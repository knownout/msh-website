// Основные модули
import React from "react";

// Подключение общего контента
import { IFormProps } from "../..";

// Подключение стилей
import "./control-form.less";

// Подключение стилей внутренних компонентов
// import "./cmscf-styles/header.less";
// import "./cmscf-styles/menu.less";
// import "./cmscf-styles/content.less";
import MessageBox, { TMessageBoxData, MessageBoxWorker } from "../../components/message-box";

interface IProps {}
interface IState {
	messageBox: TMessageBoxData;
}

export default class ControlForm extends React.PureComponent<IProps & IFormProps, IState> {
	state: IState = { messageBox: { state: false } };

	constructor (props: IProps & IFormProps) {
		super(props);
	}

	private readonly updateMessageBox = (box: TMessageBoxData) => this.setState({ messageBox: { ...box } });
	private readonly messageBoxWorker = new MessageBoxWorker(this.updateMessageBox, this.state.messageBox);

	render () {
		return (
			<div className="form content-block column no-centering nowrap" id="control-form">
				<MessageBox messageBox={this.state.messageBox} worker={this.messageBoxWorker} />
				<ControlForm.Header />
				<div className="cm-cf-wrapper content-block row no-centering nowrap">
					<ControlForm.Menu />
					<ControlForm.Content />
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

	private static Header () {
		return <div className="cms-cf-header styled-block content-block row no-centering">Header</div>;
	}

	private static Menu () {
		return <div className="cms-cf-menu styled-block content-block column no-centering">Menu</div>;
	}

	private static Content () {
		return <div className="cms-cf-content content-block column">Content</div>;
	}
}
