// Основные модули
import React from "react";

// Подключение общего контента
import { CMSInternalConfiguration, fullNameShort, IFormProps } from "../..";
import { AccountDataContext, UUID } from "../../cms";

// Подключение компонентов
import MessageBox, { TMessageBoxData, MessageBoxWorker, IMessageBoxParent } from "../../components/message-box";
import SelectMenu from "../../components/select-menu";
import Editor from "./editor-page/editor-page";
import MaterialsList from "./materials-list";

// Подключение стилей
import "./control-form.less";

interface IProps {
	eraseData: () => void;
}

interface IState extends IMessageBoxParent {
	openArticleUUID?: UUID;
	indexOfSection: number;
}

/**
 * Главная управляющая форма админ-панели
 */
export default class ControlForm extends React.PureComponent<IProps, IState> {
	state: IState = { messageBox: { state: false }, indexOfSection: 1 };

	constructor (props: IProps & IFormProps) {
		super(props);

		this.exitButtonClickHandler = this.exitButtonClickHandler.bind(this);
	}

	// Технические объекты для поддержки работоспособности всплывающего окна

	/**
	 * Процедура обновления состояния контейнера данных всплывающего окна в родительском компоненте
	 * @param box контейнер данных всплывающего окна
	 */
	private readonly updateMessageBox = (box: TMessageBoxData) => this.setState({ messageBox: { ...box } });

	/**
	 * Переменная, хранящая в себе экземпляр класса MessageBoxWorker
	 */
	private readonly messageBoxWorker = new MessageBoxWorker(this.updateMessageBox, this.state.messageBox);

	/**
	 * Обработчик события, вызываемого при нажатии на кнопку выхода из админ-панели
	 *
	 * _Ключ элемента используется из-за того, что элемент принадлежит SelectMenu и, дабы
	 * не загромождать код компонента, проверка индекса вынесена сюда_
	 *
	 * @param key ключ элемента, который вызвал событие
	 */
	private exitButtonClickHandler (key: number) {
		if (key !== 1) return;

		// Проверка на то, не отключено ли подтверждение выхода
		const confirm = localStorage.getItem(CMSInternalConfiguration.adminPanelExitConfirmKey);
		if (confirm && confirm === "true") return this.props.eraseData();

		// Добавление текста и заголовка всплывающего сообщения
		this.messageBoxWorker.updateContent({
			title: "Действительно выйти?",
			message: [
				"Вы действительно хотите выйти из своего аккаунта в панели управления?",
				<i>Для отмены, клик за пределами этого окна</i>
			]
		});

		// Добавление кнопок всплывающего сообщения
		this.messageBoxWorker.updateContent({
			buttons: [
				{
					text: "Выйти и больше не спрашивать",
					event: () => {
						localStorage.setItem(CMSInternalConfiguration.adminPanelExitConfirmKey, "true");
						this.props.eraseData();
					},
					type: "warn"
				},
				{
					text: "Выйти",
					event: () => this.props.eraseData()
				}
			]
		});

		// Открытие всплывающего сообщения
		this.messageBoxWorker.updateState(true);
	}

	render () {
		const onSelectIndex = (item: number) => this.setState({ indexOfSection: item });

		const controlElements = [
			<Editor messageBoxWorker={this.messageBoxWorker} articleUUID={this.state.openArticleUUID} />,
			<MaterialsList />
		];

		return (
			// Основной блок, 100% по высоте и фиксированный по ширине
			<div className="form content-block column no-centering nowrap" id="control-form">
				<MessageBox worker={this.messageBoxWorker} state={this.state.messageBox} />

				{/* Заголовок формы */}
				<div className="content-header styled-block content-block row">
					{/* Левая менюшка с выбором страницы */}
					<div className="section content-block row">
						<SelectMenu selection={1} onItemClick={onSelectIndex}>
							<SelectMenu.Item icon="plus" readonly={!this.state.openArticleUUID}>
								Редактор материала
							</SelectMenu.Item>
							<SelectMenu.Item icon="list">Список новостей</SelectMenu.Item>
						</SelectMenu>
					</div>

					{/* Правое меню с именем текущего пользователя и кнопкой выхода */}
					<div className="section content-block row right">
						<AccountDataContext.Consumer>
							{value =>
								value && (
									<SelectMenu selectable={false} onItemClick={this.exitButtonClickHandler}>
										<SelectMenu.Item readonly={true} icon="man-user">
											{fullNameShort(value.fullName)}
										</SelectMenu.Item>
										<SelectMenu.Item icon="logout">Выйти</SelectMenu.Item>
									</SelectMenu>
								)}
						</AccountDataContext.Consumer>
					</div>
				</div>

				{controlElements[this.state.indexOfSection]}
			</div>
		);
	}
}
