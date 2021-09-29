import React from "react";
import "./dropdown.less";

interface IProps {
	children: JSX.Element[] | JSX.Element;
	defaultTitle?: string;
	selection?: number;
	onChange?: (value: string, key: number) => void;
}

interface IState {
	openState: boolean;
	selection: number;
}
interface IItemProps {}

export class Dropdown extends React.PureComponent<IProps, IState> {
	state: IState = {
		openState: false,
		selection: Number.isNaN(this.props.selection) ? -1 : Number(this.props.selection)
	};

	constructor (props: IProps) {
		super(props);
	}

	render () {
		let title = this.props.defaultTitle || "Клик, чтобы выбрать";
		const childrenElementsList = [ this.props.children ].flat() as JSX.Element[];

		const childrenList = childrenElementsList.map((child, key) => {
			const itemContent = child.props.children;
			return (
				<div
					className="dropdown-item"
					onClick={() => {
						this.setState({ selection: key, openState: false });
						if (this.props.onChange) this.props.onChange(itemContent, key);
					}}
					key={key}
				>
					{itemContent}
				</div>
			);
		});

		if (this.state.selection > -1) {
			const itemsContentList = childrenElementsList.map(ch => String(ch.props.children));
			title = itemsContentList[this.state.selection];
		}

		if (childrenList.filter(ch => ch.key != this.state.selection).length <= 0)
			childrenList.push(
				<div className="empty" key={Math.random()}>
					Вариантов нет
				</div>
			);

		return (
			<div className="dropdown content-block column no-centering nowrap">
				<span className="dropdown-title" onClick={() => this.setState({ openState: !this.state.openState })}>
					<span>{title}</span>
				</span>
				<div className="children-holder styled-block" state-open={String(this.state.openState)}>
					{childrenList.filter(ch => ch.key != this.state.selection)}
				</div>
			</div>
		);
	}

	public static Item (props: { children: string }) {
		return <div className="dropdown-item">{props.children}</div>;
	}
}
