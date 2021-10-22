import React from "react";
import { filterTitleInput, TAccountData } from "../../..";
import { configuration, getTextTime } from "../../../../utils";
import { ArticleType } from "../editor-page";

import ScrollArea from "react-scrollbar";
import "./materials-list.less";

import EditorJS, { OutputData } from "@editorjs/editorjs";
import Blocks from "editorjs-blocks-react-renderer";
import Dropdown from "../../../components/dropdown";
import { MessageBoxWorker } from "../../../components/message-box";
import { UUID } from "../../../cms";

export namespace MaterialsList {
	export interface IState {
		materialType: ArticleType;
		page: number;

		materialsList: IArticleContentRequestResult[];
		searchStatement: string | null;
	}

	export interface IProps {
		accountContext: TAccountData;
		messageBoxWorker: MessageBoxWorker;
		updateIndex: (index: number, uuid: UUID, data: IArticleRequestResult, type: number, preview: string) => void;
	}

	export type TRequestFalseResult = { reason: string };
	export type TRequestResult = {
		success: boolean;
		meta: Partial<TRequestFalseResult> & { content?: string; [key: string]: any };
	};

	export interface IArticleRequestResult {
		blocks: EditorJS.OutputBlockData<string, any>[];
		time: string;
		title: string;
		type: number;
		preview: string;
	}

	export interface IArticleContentRequestResult {
		preview: string;
		uid: string;
		content: IArticleRequestResult;
	}
}

export class MaterialsList extends React.Component<MaterialsList.IProps, MaterialsList.IState> {
	private readonly materialsPerPage: number = 12;
	private readonly materialsWorkerPath = configuration.api.server_path + "api/next/materials-worker.php";

	state: MaterialsList.IState = {
		materialType: ArticleType.Article,
		page: 0,
		materialsList: [],
		searchStatement: null
	};

	constructor (props: MaterialsList.IProps) {
		super(props);
	}

	private makeFormData (data: { [key: string]: any }) {
		const form = new FormData();
		let formData = Object.assign(data, {
			"User-Login": this.props.accountContext.login,
			"User-Token": this.props.accountContext.token,

			"Material-Type": this.state.materialType
		});

		Object.keys(formData).forEach(key => form.append(key, String(formData[key])));
		return form;
	}

	private async fetchAPIContent (formData: FormData) {
		const requestAttributes = { method: "POST", body: formData };
		const content = (await fetch(this.materialsWorkerPath, requestAttributes).then(req => req.text())) as string;

		// console.log(content);
		return JSON.parse(content) as MaterialsList.TRequestResult;
	}

	private async fetchMaterialsList () {
		const formData = this.makeFormData({
			"Data-Action": "GET",

			"Materials-Offset": this.materialsPerPage * this.state.page,
			"Materials-Count": this.materialsPerPage
		});

		const materialsUIDList = (await this.fetchAPIContent(formData)).meta;
		const materialsList = [];

		for await (const uid of materialsUIDList.deferred) materialsList.push(await this.readMaterialData(uid));
		for await (const uid of materialsUIDList.current) materialsList.push(await this.readMaterialData(uid));

		return (materialsList as any) as MaterialsList.IArticleContentRequestResult[];
	}

	private async readMaterialData (materialUID: string) {
		const formData = this.makeFormData({
			"Data-Action": "MATERIAL",
			"Material-UID": materialUID
		});

		return (await this.fetchAPIContent(formData)).meta;
	}

	async componentDidMount () {
		this.setState({ materialsList: await this.fetchMaterialsList() });
	}

	render () {
		const worker = this.props.messageBoxWorker,
			makeFormData = this.makeFormData.bind(this),
			setState = this.setState.bind(this),
			fetchMaterialsList = this.fetchMaterialsList.bind(this),
			state = this.state,
			tprops = this.props,
			ttt = this;

		function Material (props: MaterialsList.IArticleContentRequestResult & { type: number }) {
			const bgImage = { backgroundImage: `url(${props.preview})` } as React.CSSProperties;

			return (
				<div className="content-block row no-centering material gap-10 nowrap">
					{props.preview && <div className="preview-image" style={bgImage} />}

					<div className="material-context styled-block content-block column no-centering nowrap">
						<span
							className="publish-date"
							data-deferred={String(new Date(props.content.time).getTime() > Date.now())}
						>
							{getTextTime(new Date(props.content.time))}
						</span>
						<span className="material-title">{props.content.title}</span>
						<div className="material-description">
							{props.content.blocks.filter(e => e.type == "paragraph").length > 0 && (
								<Blocks
									data={{
										time: 0,
										version: "0",
										blocks: [ props.content.blocks.filter(e => e.type == "paragraph")[0] ]
									}}
								/>
							)}
						</div>
						<div className="material-buttons-holder content-block row nowrap gap-10">
							<div
								className="button"
								onClick={() => {
									worker.updateContent({
										title: "Подтвердите действие",
										message: [
											"Вы действительно хотите удалить данный материал?" +
												" Отменить процедуру после подтверждения будет невозможно"
										],
										require: false,
										buttons: [
											{
												text: "Удалить материал",
												type: "warn",
												event: async () => {
													const result = await fetch(
														configuration.api.server_path +
															"/api/next/materials-worker.php",
														{
															method: "POST",
															body: makeFormData({
																"Material-UID": props.uid,
																"Data-Action": "REMOVE"
															})
														}
													).then(req => req.text());

													setState({ materialsList: await fetchMaterialsList() });
													worker.updateState(false);
												}
											},
											{ text: "Отмена" }
										],
										state: true
									});
								}}
							>
								Удалить
							</div>
							<div
								className="button"
								onClick={() => {
									tprops.updateIndex(
										0,
										{ identifier: props.uid },
										props.content,
										props.type,
										props.preview
									);
								}}
							>
								Редактировать
							</div>
							<div
								className="button"
								onClick={() => {
									(window.open(
										`${[ "news", "documents", "pages" ][state.materialType]}/${props.uid}`,
										"_blank"
									) as Window).focus();
								}}
							>
								Открыть
							</div>
						</div>
					</div>
				</div>
			);
		}

		const onInput = (event: React.KeyboardEvent<HTMLInputElement>) => {
			const input = event.target as HTMLInputElement;
			if (input.value.trim().length > 0) this.setState({ searchStatement: input.value });
			else this.setState({ searchStatement: null });
		};

		let materialsList = this.state.materialsList.filter(e => e.content.blocks.length > 0);
		materialsList = materialsList.filter(
			e =>
				this.state.searchStatement
					? e.content.title.toLocaleLowerCase().includes(this.state.searchStatement.toLocaleLowerCase())
					: true
		);

		return (
			<div className="content-container content-block row no-centering gap-10 nowrap" id="content-list">
				<ScrollArea smoothScrolling={true}>
					<div className="materials-wrapper">
						{materialsList.length > 0 ? (
							materialsList.map(material => {
								return <Material {...material} type={this.state.materialType} key={Math.random()} />;
							})
						) : (
							<span className="not-found">
								{this.state.searchStatement ? (
									`Материалов по запросу ${this.state.searchStatement} не найдено`
								) : (
									"Материалы в данном разделе отсутствуют"
								)}
							</span>
						)}
					</div>
				</ScrollArea>
				<div className="data-controls styled-block content-block column nowrap">
					<span className="data-title">Поиск в списке по заголовкам</span>
					<input
						type="text"
						className="searchInput"
						placeholder="Начните вводить заголовок"
						onInput={onInput}
					/>

					<span className="data-title">Тип отображаемых материалов</span>
					<Dropdown
						select={0}
						onChange={key => {
							this.setState({ materialType: key }, async () => {
								this.setState({ materialsList: await this.fetchMaterialsList() });
							});
						}}
					>
						<Dropdown.Item>Новости</Dropdown.Item>
						<Dropdown.Item>Документы</Dropdown.Item>
						<Dropdown.Item>Страницы</Dropdown.Item>
					</Dropdown>

					<div className="hint">
						Тип отображаемых материалов влияет на то, какие материалы будут отображены на этой странице
						(Документы, Страницы или Новости)
					</div>
					<div
						className="button create-material"
						onClick={async () => {
							//123123
							const create = await fetch(
								configuration.api.server_path + "api/next/materials-worker.php",
								{
									method: "POST",
									body: this.makeFormData({
										"Data-Action": "CREATE"
									})
								}
							).then(r => r.json());

							const data = await this.readMaterialData(create.meta.content);
							tprops.updateIndex(
								0,
								{ identifier: create.meta.content },
								{ blocks: [], preview: "", time: "0", title: "", type: this.state.materialType },
								this.state.materialType,
								""
							);
						}}
					>
						Создать материал
					</div>
				</div>
			</div>
		);
	}
}
