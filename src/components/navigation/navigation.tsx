import React from "react";

import "./navigation.less";

interface INavigationState {}
interface INavigationProps {}
export default class Navigation extends React.Component<INavigationProps, INavigationState> {
	public state: INavigationState = {};
	constructor (props: INavigationProps) {
		super(props);
	}

	public render () {
		return (
			<nav className="content-block column" id="navigation">
				<div className="item">
					<span className="title">Министерство</span>
				</div>
				<div className="item">
					<span className="title">Деятельность</span>
				</div>
				<div className="item">
					<span className="title">Документы</span>
				</div>
				<div className="item">
					<span className="title">Господдержка</span>
				</div>
				<div className="item">
					<span className="title">Информация</span>
				</div>
				<div className="item">
					<span className="title">Контроль</span>
				</div>
				<div className="item">
					<span className="title">Контакты</span>
				</div>
			</nav>
		);
	}
}
