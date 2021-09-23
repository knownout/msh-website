// Основные модули
import React from "react";

// Подключение общего контента
import { IFormProps } from "../..";

// Подключение стилей
import "./control-form.less";

// Подключение стилей внутренних компонентов
import "./cmscf-styles/header.cmscf.less";
import "./cmscf-styles/menu.cmscf.less";
import "./cmscf-styles/content.cmscf.less";

interface IProps {}
interface IState {}

export default class ControlForm extends React.PureComponent<IProps & IFormProps, IState> {
	state: IState = {};
	constructor (props: IProps & IFormProps) {
		super(props);
	}

	render () {
		return (
			<div className="form content-block column no-centering nowrap" id="control-form">
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
