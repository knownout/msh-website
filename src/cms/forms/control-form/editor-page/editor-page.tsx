// Основные модули
import React from "react";

// Подключение общего содержимого
import { MessageBoxWorker } from "../../../components/message-box";
import { ArticleType, Base64EncodedImage } from ".";

// Подключение компонентов
import ScrollArea from "react-scrollbar";
import Options from "./sections/options";
import MaterialEditor from "./sections/material-editor";
import EditorJS, { OutputData } from "@editorjs/editorjs";

// Подключение стилей
import "./editor-page.less";
import { UUID } from "../../../cms";
import MaterialsList from "../materials-list";
import { TAccountData } from "../../..";
import { configuration } from "../../../../utils";

/** Пространство имен для компонента страницы редактирования */
export namespace Editor {
	export interface IProps {
		messageBoxWorker: MessageBoxWorker;

		articleUUID?: UUID;
		accountContext: TAccountData;
		data?: MaterialsList.IArticleRequestResult;
	}

	export interface IState {
		material: Partial<IMaterialData>;

		options: Partial<IOptionsData>;

		editorInstance?: EditorJS;

		contentLoaded: boolean;

		tagsList: { [key: string]: { [key: string]: string[] } }[];

		checkedTagsList: string[];
	}

	/**
	 * Контейнер параметров текущего материала
	 */
	export interface IOptionsData {
		/** Превью текущего материала */
		preview: Base64EncodedImage;

		/** Дата публикации новости _(для других не доступно)_ */
		publishDate: Date;

		/** Тип материала (новость, страница или документ) */
		type: ArticleType;
	}

	/**
	 * Контейнер данных о заголовке и содержимом материала
	 */
	export interface IMaterialData {
		/** Содержимое материала в виде объекта (не JSON) */
		blocks: EditorJS.OutputData;

		/** Заголовок материала */
		title: string;
	}

	export interface IServerUploadDataProps extends Omit<IOptionsData, "preview">, Omit<IMaterialData, "blocks"> {
		content: EditorJS.OutputBlockData<string, any>[];
		preview?: Base64EncodedImage;
	}
}

/**
 * Компонент страницы редактора материалов
 *
 * _Внимание! Компонент является внутренним и не будет опубликован
 * отдельным блоком по завершении проекта_
 *
 * _`PureComponent` не используется из-за того, что добавляет
 * необходимость ручного обновления в некоторых случаях,
 * что не есть эффективно_
 */
export default class Editor extends React.Component<Editor.IProps, Editor.IState> {
	state: Editor.IState = { options: {}, material: {}, contentLoaded: false, tagsList: [], checkedTagsList: [] };

	/**
	 * Техническая функция, реализующая частичное обновление вложенных в
	 * состояние компонента объектов (по аналогии с setState)
	 * @param data входящие данные
	 * @param key ключ в объекте состояния компонента
	 */
	private updateLocalState (data: any, key: keyof Editor.IState) {
		let resultingObject = this.state[key];

		Object.keys(data).map(key => Object.assign(resultingObject, { [key]: (data as any)[key] }));

		this.setState({ [key]: resultingObject } as any);
	}

	private makeFormData (data: { [key: string]: any }) {
		const form = new FormData();
		let formData = Object.assign(data, {
			"User-Login": this.props.accountContext.login,
			"User-Token": this.props.accountContext.token,

			"Material-Type": (this.props.data as any).type
		});

		Object.keys(formData).forEach(key => form.append(key, String(formData[key])));
		return form;
	}

	constructor (props: Editor.IProps) {
		super(props);

		this.publishMaterial = this.publishMaterial.bind(this);
		this.updateOptions = this.updateOptions.bind(this);
	}

	/**
	 * Метод обновления параметров материала (передается в боковое меню)
	 * @param options контейнер параметров материала
	 */
	private readonly updateOptions = (options: Partial<Editor.IOptionsData>) =>
		this.updateLocalState(options, "options");

	/**
	 * Метод обновления содержания материала (передается в редактор)
	 * @param material контейнер содержимого материала
	 */
	private readonly updateMaterial = (material: Partial<Editor.IMaterialData>) =>
		this.updateLocalState(material, "material");

	private readonly updateEditorInstance = (editorInstance: EditorJS | undefined) => this.setState({ editorInstance });

	private readonly updateCheckedTagsList = (checkedTagsList: string[]) => this.setState({ checkedTagsList });

	/**
	 * Функция инициализации процедуры публикации материала
	 * @param options параметры материала
	 */
	private async publishMaterial (options: Partial<Editor.IOptionsData>) {
		if (!this.state.editorInstance) return;

		const properties = {
			content: (await this.state.editorInstance.save()).blocks,
			title: this.state.material.title ? this.state.material.title : String(),

			publishDate: options.publishDate || new Date(),
			type: Number.isInteger(options.type) ? options.type as number : 0,

			preview: options.preview
		};

		const conditions = [ properties.content.length >= 3, properties.title.length >= 10 ];
		let message: [string, string] = [ "", "" ];

		if (!conditions[0])
			message = [
				"Слишком короткая новость",
				"Количество блоков в созданном материале не превышает трех, " +
					"что является недопустимым размером для материла"
			];

		if (!conditions[1])
			message = [ "Слишком короткий заголовок", "Длина строки заголовка должна превышать десять символов" ];

		if (!conditions.reduce((a, b) => a && b)) {
			this.props.messageBoxWorker.updateContent({
				title: message[0],
				message: message[1],

				require: false,
				buttons: [ { text: "Понятно" } ],
				state: true
			});

			return;
		}

		if (options.type === 0 && !options.preview) {
			this.props.messageBoxWorker.updateContent({
				title: "Превью не выбрано",
				message: [
					'Вы выбрали тип материала "Новость", однако не выбрали для материала превью. ' +
						"В это случае материал в списке новостей будет отображаться только как текст.",
					"Продолжить загрузку новости без превью?"
				],

				buttons: [
					{
						text: "Продолжить",
						type: "warn",
						event: () => {
							this.props.messageBoxWorker.updateState(false);
							this.updateWebserverArticle({ ...properties });
						}
					},
					{ text: "Отмена" }
				],

				require: false,
				state: true
			});
		} else this.updateWebserverArticle({ ...properties });
	}

	private async updateWebserverArticle (options: Editor.IServerUploadDataProps) {
		const imagesList: { [key: string]: any } = {};

		if (options.preview) imagesList["preview"] = options.preview;

		const content = {
			title: options.title,
			time: options.publishDate.getTime(),
			version: "0",
			blocks: options.content
		};
		const uuid = (this.props.articleUUID as UUID).identifier;

		// @ts-ignore
		function urltoFile (url, filename, mimeType) {
			return fetch(url)
				.then(function (res) {
					return res.arrayBuffer();
				})
				.then(function (buf) {
					return new File([ buf ], filename, { type: mimeType });
				});
		}

		const tagsList = this.state.checkedTagsList;
		const form = this.makeFormData({
			"Data-Action": "UPDATE",
			"Material-UID": uuid,
			"Update::Material-Data": JSON.stringify(content),
			"Update::Material-Tags": JSON.stringify(tagsList)
		});

		// console.log("123", options.preview);
		if (
			options.preview &&
			options.preview.content != null &&
			options.preview.content.slice(0, 10) == "data:image"
		) {
			const file = await urltoFile(options.preview.content, Math.random().toString(), "image/jpeg");
			form.append("Material-Preview", file);
		}

		this.props.messageBoxWorker.updateContent({
			title: "Выполняется загрузка...",
			message: "Пожалуйста, подождите. Выполняется загрузка материала на сервер",
			buttons: [],
			require: true,
			state: true
		});

		const res = fetch(configuration.api.server_path + `api/next/materials-worker.php`, {
			method: "POST",
			body: form
		})
			.then(res => res.json())
			.then(res => {
				console.log(res);
				if (res.success == true) {
					this.props.messageBoxWorker.updateContent({
						require: false,
						message: "Материал успешно обновлен",
						buttons: [ { text: "Понятно" } ],
						state: true,
						title: "Материал загружен"
					});
				} else {
					this.props.messageBoxWorker.updateContent({
						require: false,
						message:
							"Во время загрузки материала произошла неизвестная ошибка, попробуйте загрузить материла позже или обратитесь к администратору",
						buttons: [ { text: "Понятно" } ],
						state: true,
						title: "Ошибка загрузки :("
					});
				}
			});
	}

	async componentDidMount () {
		const tagsList = await fetch(configuration.api.server_path + "api/next/materials-worker.php", {
			method: "POST",
			body: this.makeFormData({
				"Data-Action": "TAGLIST"
			})
		}).then(res => res.json());

		if (tagsList.success == false) {
			this.props.messageBoxWorker.updateContent({
				require: true,
				title: "Произошла критическая ошибка",
				message:
					"Попробуйте перезагрузить страницу. Если ошибка продолжит появляться, обратитесь к администратору",

				state: true,
				buttons: [
					{
						text: "Перезагрузить",
						event: () => {
							location.reload();
						}
					}
				]
			});
		} else {
			const uuid = this.props.articleUUID as UUID;
			// const a = Object.values(tagsList.meta.content).filter(
			// 	(e: any) => e.documents.includes(uuid.identifier) || e.news.includes(uuid.identifier)
			// );

			const includes = [];
			for (let i = 0; i < Object.keys(tagsList.meta.content).length; i++) {
				const key = Object.keys(tagsList.meta.content)[i] as any;
				const value = Object.values(tagsList.meta.content)[i] as any;

				if (value.documents.includes(uuid.identifier) || value.news.includes(uuid.identifier))
					includes.push(key);
			}

			console.log(includes);

			this.setState({ tagsList: tagsList.meta.content, checkedTagsList: includes });
			if (!this.state.contentLoaded) this.setState({ contentLoaded: true });
		}
	}

	render () {
		const attributes = {
			options: {
				options: {
					publishDate: this.state.options.publishDate,
					preview:
						this.state.options.preview ||
						({ content: this.props.data ? this.props.data.preview : undefined } as Base64EncodedImage),
					type: this.state.options.type || (this.props.data ? this.props.data.type : 0)
				},
				updateOptions: this.updateOptions,

				publish: this.publishMaterial
			},
			material: {
				updateMaterial: (material: Partial<Editor.IMaterialData>) => this.updateMaterial(material),
				updateEditorInstance: (instance: EditorJS | undefined) => this.updateEditorInstance(instance)
			}
		};

		const initialEvents = {
			onReady: () => {
				this.props.messageBoxWorker.updateState(false);
			},
			onInit: () => {
				this.props.messageBoxWorker.updateContent({
					title: "Загрузка панели...",
					message: "Пожалуйста, подождите. Идет загрузка админ-панели",

					require: true,
					buttons: [],
					state: true
				});
			}
		};

		if (!this.props.articleUUID) {
			return (
				<div className="page-exception content-block column">
					<div className="page-exception-content content-block column nowrap gap-10">
						<span className="title">Произошла ошибка :(</span>
						<span className="code">E_(no_uuid_state)</span>
						<span className="description">
							Произошел сбой во время запуска редактора материалов. В редактор не был передан материал,
							который должен был быть отредактирован пользователем. Вернитесь на вкладку "Список новостей"
							и повторите попытку
						</span>
					</div>
				</div>
			);
		}

		return (
			<div className="content-container content-block column no-centering" id="content-editor">
				<ScrollArea horizontal={false} smoothScrolling={true} className="content-scroll-area">
					<div className="section-wrapper content-block row no-centering nowrap">
						<MaterialEditor {...attributes.material} {...initialEvents} editorData={this.props.data} />
						<Options
							{...attributes.options}
							editorData={this.props.data}
							updateCheckedTagsList={this.updateCheckedTagsList.bind(this)}
							checkedTagsList={this.state.checkedTagsList}
							tagsList={this.state.tagsList}
						/>
					</div>
				</ScrollArea>
			</div>
		);
	}
}
