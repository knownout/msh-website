import React from "react";
import { getIconPath } from "../../../components/icon";
import "./dropdown.less";

interface IProps {
	children: JSX.Element[] | JSX.Element;
}

interface IState {
	dropdownOpen: boolean;
}

export class Dropdown extends React.PureComponent<IProps, IState> {
	state: IState = { dropdownOpen: false };
	constructor (props: IProps) {
		super(props);

		this.headerClickHandler = this.headerClickHandler.bind(this);
	}

	private readonly headerClickHandler = () => {
		this.setState({ dropdownOpen: !this.state.dropdownOpen });
	};

	// TODO: Таймер авто-закрытия, дочерние элементы
	render () {
		return (
			<div className="dropdown content-block row nowrap no-centering" data-open={this.state.dropdownOpen}>
				<div className="dropdown-header-content content-block row nowrap" onClick={this.headerClickHandler}>
					<span className="selection-text">SelectionTitleElement</span>
					<div className="select-button">
						<img src={getIconPath("arrow")} alt="" />
					</div>
				</div>
				<div className="dropdown-items-holder content-block column nowrap styled-block">
					<div className="item">Item 1</div>
					<div className="item">Item 2</div>
					<div className="item">Item 3</div>
				</div>
			</div>
		);
	}
}
