// Основные модули
import React from "react";

// Подключение общего контента
import { CMSInternalConfiguration, IFormProps } from "../..";

// Подключение стилей
import "./control-form.less";

import MessageBox, { TMessageBoxData, MessageBoxWorker } from "../../components/message-box";
import { AccountDataContext } from "../../cms";
import SelectMenu from "../../components/select-menu/";
import { configuration, getHelloText } from "../../../utils";
import Dropdown from "../../components/dropdown";

import DatePicker from "react-date-picker";
import TimePicker from "react-time-picker";
import Editor from "./text-editor";

interface IProps {
	eraseData: () => void;
}

interface IState {
	messageBox: TMessageBoxData;
	menuSelection: number;
	preferences: Partial<TPreferencesData>;
}

type TPreferencesData = {
	date: string;
	time: string;
	preview: string;
	type: string;
};

export default class ControlForm extends React.PureComponent<IProps, IState> {
	state: IState = { messageBox: { state: false }, menuSelection: 0, preferences: {} };

	constructor (props: IProps & IFormProps) {
		super(props);

		this.updateMenuSelection = this.updateMenuSelection.bind(this);
		this.updatePreferencesData = this.updatePreferencesData.bind(this);
	}

	private readonly updateMenuSelection = (selection: number) => this.setState({ menuSelection: selection });

	private readonly updateMessageBox = (box: TMessageBoxData) => this.setState({ messageBox: { ...box } });
	private readonly messageBoxWorker = new MessageBoxWorker(this.updateMessageBox, this.state.messageBox);

	private readonly updatePreferencesData = ({ date, time, preview, type }: Partial<TPreferencesData>) => {
		let resultingObject = this.state.preferences;

		if (date) resultingObject = Object.assign(resultingObject, { date });
		if (time) resultingObject = Object.assign(resultingObject, { time });
		if (preview) resultingObject = Object.assign(resultingObject, { preview });
		if (type) resultingObject = Object.assign(resultingObject, { type });

		this.setState({ preferences: resultingObject });
	};

	render () {
		return (
			<div className="form content-block column no-centering nowrap" id="control-form">
				<MessageBox messageBox={this.state.messageBox} worker={this.messageBoxWorker} />
				<ControlForm.Header>
					<ControlForm.Menu selection={this.state.menuSelection} updateSelection={this.updateMenuSelection} />
					<ControlForm.Profile messageBox={this.messageBoxWorker} eraseData={this.props.eraseData} />
				</ControlForm.Header>
				<div className="cm-cf-wrapper content-block column nowrap">
					<AccountDataContext.Consumer>
						{value =>
							value && (
								<ControlForm.Content
									selection={this.state.menuSelection}
									token={value.token}
									login={value.login}
									messageBox={this.messageBoxWorker}
									updatePreferences={this.updatePreferencesData}
								/>
							)}
					</AccountDataContext.Consumer>
				</div>
			</div>
		);
	}

	/**
     *
     * =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
     *
     *         ВНУТРЕННИЕ КОМПОНЕНТЫ
     *
     * =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
     *
     */

	private static Header (props: { children: any }) {
		return <div className="cms-cf-header content-block row no-centering">{props.children}</div>;
	}

	private static Profile (props: { messageBox: MessageBoxWorker; eraseData: () => void }) {
		const Item = SelectMenu.Item;

		const exitRequestHandler = (key: number) => {
			if (key != 1) return;

			const adminPanelExit = (removeConfirmation: boolean) => {
				if (removeConfirmation)
					localStorage.setItem(CMSInternalConfiguration.adminPanelExitConfirmKey, "false");

				props.eraseData();
			};

			if (localStorage.getItem(CMSInternalConfiguration.adminPanelExitConfirmKey) != "false")
				props.messageBox
					.updateContent({
						title: "Действительно выйти?",
						message: [
							"После выхода придётся вновь пройти авторизацию, чтобы получить доступ к панели управления.",
							<i>Для отмены кликните вне этого окна (на черный фон)</i>
						],
						buttons: [
							{ text: "Выйти и больше не спрашивать", type: "warn", event: () => adminPanelExit(true) },
							{ text: "Выйти", event: () => adminPanelExit(false) }
						]
					})
					.updateState(true);
			else props.eraseData();
		};

		const nameConvertor = (fullName: string) => {
			const nameArray = fullName.split(" ");

			if (nameArray.length < 3) return fullName;
			return `${nameArray[0]} ${nameArray[1].slice(0, 1)}.${nameArray[2].slice(0, 1)}.`;
		};
		return (
			<div className="cms-cf-profile styled-block content-block row no-centering">
				<div className="select-menu content-block row">
					<AccountDataContext.Consumer>
						{value =>
							value && (
								<SelectMenu selectable={false} onItemClick={exitRequestHandler}>
									<Item icon="man-user" readonly={true}>
										{nameConvertor(value.fullName)}
									</Item>
									<Item className="exit" icon="logout">
										Выйти
									</Item>
								</SelectMenu>
							)}
					</AccountDataContext.Consumer>
				</div>
			</div>
		);
	}

	private static Menu (props: { selection: number; updateSelection: (selection: number) => void }) {
		const Item = SelectMenu.Item;

		return (
			<div className="cms-cf-menu content-block row styled-block">
				<SelectMenu {...props}>
					{/* <Item icon="homepage">Главная</Item> */}
					<Item icon="plus">Добавить новость</Item>
					<Item icon="list">Список новостей</Item>
				</SelectMenu>
			</div>
		);
	}

	private static Content (props: {
		selection: number;
		token: string;
		login: string;
		messageBox: MessageBoxWorker;
		updatePreferences: ({ date, time, preview, type }: Partial<TPreferencesData>) => void;
	}) {
		const [ previewImage, setPreviewImage ] = React.useState<string | null>();
		const currentDate = new Date();

		const NewArticle: React.FC = () => {
			const Item = Dropdown.Item;

			return (
				<div className="content-page new-article content-block column nowrap no-centering">
					<span className="data-block-title">Параметры публикации</span>
					<div className="data-block content-block column nowrap no-centering styled-block">
						<span className="data-block-title">Превью на главной странице и в списке новостей</span>
						<div className="data-block-content content-block column nowrap no-centering ">
							<div
								className="image-selector"
								onClick={() => {
									const selector = document.createElement("input");
									selector.type = "file";
									selector.accept = ".jpg,.jpeg";
									selector.click();

									selector.onchange = () => {
										if (!selector.files) return;
										const data = new FormData();
										data.append("file", selector.files[0]);
										data.append("user", props.login);
										data.append("token", props.token);

										const timeStart = Date.now();
										const msg = props.messageBox
											.updateContent({
												buttons: [],
												title: "Загрузка изображения...",
												message:
													"После завершения загрузки изображения это окно закроется автоматически, " +
													"а изображение будет показано в секции превью"
											})
											.updateState(true)
											.require(true);

										fetch(configuration.api.server_path + configuration.api.temp_upload, {
											method: "POST",
											body: data
										})
											.then(req => req.json())
											.then(res => {
												const timeEnd = Date.now();
												const lim = 800 - (timeEnd - timeStart);

												setTimeout(() => {
													if (!res.success) {
														console.error(res);
														msg
															.updateContent({
																title: "Ошибка",
																message: [
																	"При загрузке изображения произошла ошибка",
																	"Попробуйте повторить действие позже или сообщите администратору",
																	<code>{res.reason || "null"}</code>
																],
																buttons: [ { text: "Закрыть" } ]
															})
															.require(false);
													} else {
														msg.updateState(false);
														setPreviewImage(res.meta.fileName);
														props.updatePreferences({ preview: res.meta.fileName });
													}
												}, lim > 0 ? lim : 0);
											})
											.catch(e => {
												console.error(e);
												msg
													.updateContent({
														title: "Ошибка",
														message: [
															"При загрузке изображения произошла ошибка",
															"Попробуйте повторить действие позже или сообщите администратору",
															<code>{String(e) || "null"}</code>
														],
														buttons: [ { text: "Закрыть" } ]
													})
													.require(false);
											});
									};
								}}
							>
								<div className="selection-box" style={{ backgroundImage: `url("${previewImage}")` }} />
								<div className="selection-content">
									<span className="selection-hint">Кликните, чтобы выбрать изображение</span>
								</div>
							</div>
						</div>
						<span className="data-block-title">Дата и время публикации</span>
						<div className="data-block-content content-block row nowrap no-h-centering gap-10">
							<ErrorBoundary>
								<DatePicker
									value={currentDate}
									clearIcon={null}
									minDate={new Date(currentDate.getFullYear() - 10, currentDate.getMonth())}
									maxDate={new Date(currentDate.getFullYear(), currentDate.getMonth() + 2)}
									onChange={(value: Date) => {
										props.updatePreferences({ date: value.toJSON() });
									}}
								/>
								<TimePicker
									value={`10:00`}
									clearIcon={null}
									clockClassName="c-cl"
									onChange={value => {
										props.updatePreferences({ time: value.toString() });
									}}
								/>
							</ErrorBoundary>
						</div>
						<span className="data-block-title">Тип публикации</span>
						<div className="data-block content-block column nowrap no-centering">
							<div className="data-block-content content-block column nowrap no-centering">
								<Dropdown selection={0} onChange={value => props.updatePreferences({ type: value })}>
									<Item>Новость</Item>
									<Item>Документ</Item>
									<Item>Страница</Item>
								</Dropdown>
							</div>
						</div>
					</div>
					<div className="button volumetric">Опубликовать запись</div>

					<span className="data-block-title">Текст публикации</span>
					<div className="data-block content-block column nowrap no-centering styled-block">
						<Editor />
					</div>
				</div>
			);
		};

		const componentsList = [ NewArticle ];
		const ControlComponent = componentsList[props.selection];

		return (
			<div className="cms-cf-content">
				<ControlComponent />
			</div>
		);
	}
}

class ErrorBoundary extends React.Component {
	state: { hasError: boolean } = { hasError: false };

	constructor (props: {}) {
		super(props);
		this.state = { hasError: false };
	}

	static getDerivedStateFromError (error: any) {
		// Обновить состояние с тем, чтобы следующий рендер показал запасной UI.
		return { hasError: true };
	}

	componentDidCatch (error: any, errorInfo: any) {
		// Можно также сохранить информацию об ошибке в соответствующую службу журнала ошибок
	}

	render () {
		if (this.state.hasError) {
			// Можно отрендерить запасной UI произвольного вида
			return <span>Что-то пошло не так.</span>;
		}

		return this.props.children;
	}
}
