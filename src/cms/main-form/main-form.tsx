import React, { useState } from "react";
import Icon from "../../components/icon";
import { AccountDataContext, TAccountAuthData } from "../cms";
import Popup, { handlePopupMessage, TPopupData } from "../popup/popup";

import "./main-form.less";
import Empty from "./control-forms/empty";
import EditorJS from "@editorjs/editorjs";

import CreateEditorInstance from "./editor";

interface IProps {
	updateAuthState({ authState, accountLevel, fullName }: TAccountAuthData): void;
}

interface IState {
	popupData: TPopupData;
	selectedIndex: number;
	editorInstance?: EditorJS;
	editorLoaded: boolean;
}

export default class MainForm extends React.PureComponent<IProps, IState> {
	public readonly state: IState = {
		popupData: { shown: false },
		selectedIndex: -1,
		editorLoaded: false,
		editorInstance: CreateEditorInstance(() => this.setState({ editorLoaded: true }))
	};

	public constructor (props: IProps) {
		super(props);

		this.logoutButtonHandler = this.logoutButtonHandler.bind(this);
		this.setPopupData = this.setPopupData.bind(this);
	}

	private readonly setPopupData = (popupData: TPopupData) => this.setState({ popupData });
	private readonly logoutButtonHandler = () => {
		const partialPopupData = {
			title: "Действительно выйти?",
			message:
				"После выхода из аккаунта сохраненные данные о пользователе" +
				"будут удалены из вашего браузера и вход придётся повторить вновь",

			buttons: [
				{ name: "Выйти", onClick: () => this.props.updateAuthState({ authState: false }), special: true },
				{ name: "Отмена" }
			]
		};

		handlePopupMessage(this.setPopupData, { ...partialPopupData });
	};

	public componentDidMount () {}

	public render () {
		const classesList = {
			item: "item content-block row h-100 nowrap",
			itemContainer: {
				right: "item-container content-block row nowrap right",
				left: "item-container content-block row nowrap"
			}
		};

		const controlButtonsList: [string, string, number][] = [
			[ "list", "Список новостей", 1 ],
			[ "plus", "Добавить новость", 2 ],
			[ "settings", "Настройки", 2 ],
			[ "group", "Управление", 3 ]
		];

		return (
			<AccountDataContext.Consumer>
				{value => (
					<div id="main-form" className="content-block column w-100 h-100 nowrap no-centering">
						<Popup {...this.state.popupData} />

						<header className="header-content white-block">
							<div className={classesList.itemContainer.left}>
								<div className={classesList.item} onClick={() => (window.location.href = "/")}>
									<Icon icon="homepage" />
									<span className="text">Вернуться на главную</span>
								</div>
							</div>

							<div className={classesList.itemContainer.right}>
								<div className={classesList.item} style={{ pointerEvents: "none" }}>
									<span className="text">{value.fullName}</span>
									<Icon icon="man-user" />
								</div>
								<div className={`${classesList.item} logout`} onClick={this.logoutButtonHandler}>
									<span className="text">Выйти</span>
									<Icon icon="logout" />
								</div>
							</div>
						</header>
						<div className="main-content content-block row nowrap w-100 no-centering">
							<aside className="content-selector">
								<div className={classesList.itemContainer.left}>
									{controlButtonsList.filter(e => (value.accountLevel || 1) >= e[2]).map((e, i) => (
										<div
											className={classesList.item}
											key={i}
											item-select={(this.state.selectedIndex == i).toString()}
											onClick={() => this.setState({ selectedIndex: i })}
										>
											<Icon icon={e[0]} />
											<span className="text">{e[1]}</span>
										</div>
									))}
								</div>
								<span className="info-text">Уровень аккаунта: {value.accountLevel}</span>
							</aside>
							<div className="control-page-content">
								<div
									className="editorjs-content-holder content-block column nowrap white-block"
									data-open={this.state.selectedIndex === 1}
								>
									<div className="buttons-holder content-block row w-100 no-centering gap-10">
										<div
											className="button form-submit"
											onClick={() => {
												const editor = this.state.editorInstance;
												if (!editor) return;
												editor.save().then(blocks => {
													const firstBlock = blocks.blocks[0].type;
													if (firstBlock != "header" || blocks.blocks[0].data.level != 1) {
														const partialPopupData = {
															title: "Ошибка написания статьи",
															message:
																"В любой статье первым элементом должен идти заголовок первого уровня",

															buttons: [ { name: "Понятно" } ]
														};

														return handlePopupMessage(this.setPopupData, {
															...partialPopupData
														});
													}

													console.log("DONE");
													console.log(blocks);

													editor.clear();
													this.setState({ selectedIndex: -1 });
													window.open("https://google.com/", "_blank");
												});
											}}
										>
											Добавить новость
										</div>
										<div
											className="button form-submit"
											onClick={() =>
												this.state.editorInstance && this.state.editorInstance.clear()}
										>
											Очистить
										</div>
									</div>
									<div id="editorjs-holder" />
								</div>
								{this.state.selectedIndex === -1 && <Empty accountLevel={value.accountLevel || 1} />}
							</div>
						</div>
					</div>
				)}
			</AccountDataContext.Consumer>
		);
	}
}
