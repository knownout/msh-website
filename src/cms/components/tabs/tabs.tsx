import React from "react";
import "./tabs.less";

import { Tabs as NS } from ".";

/**
 * Компонент для создания переключаемых страниц в виде нескольких вкладок, представленных
 * кнопками в шапке компонента
 *
 * @author knownOut <re-knownout> knownout@hotmail.com
 * @version 1.0.0
 */
export class Tabs extends React.PureComponent<NS.IProps, NS.IState> {
	state: NS.IState = { tabIndex: Number.isInteger(this.props.defaultPage) ? this.props.defaultPage as number : -1 };

	constructor (props: NS.IProps) {
		super(props);

		this.convertTitleElement = this.convertTitleElement.bind(this);
	}

	/**
	 * Метод преобразования заголовков из текста в JSX элементы (кнопки для выбора вкладки компонента)
	 * @param text текст заголовка
	 * @param index индекс заголовка
	 * @returns JSX кнопка выбора вкладки компонента
	 */
	private convertTitleElement (text: string, index: number) {
		const clickEventHandler = () => {
			if (this.state.tabIndex != index) this.setState({ tabIndex: index });
		};

		// Список атрибутов элемента
		const attributesList = {
			className: "title-element content-block row nowrap",
			onClick: clickEventHandler,

			key: index
		};

		return (
			<div {...attributesList} data-selected={String(index == this.state.tabIndex)}>
				{text}
			</div>
		);
	}

	render () {
		/** Список элементов, приведенный к единому виду */
		const childrenList = [ this.props.children ].flat() as JSX.Element[],
			/** Список заголовков из элементов страниц */
			titlesList = childrenList.map(e => e.props.title as string);

		return (
			<div className={[ "tabs-component", this.props.className || "" ].join(" ").trim()}>
				<div className="tabs-selector content-block row nowrap">{titlesList.map(this.convertTitleElement)}</div>
				<div className="tab-content content-block nowrap no-centering">
					{childrenList[this.state.tabIndex] && childrenList[this.state.tabIndex].props.children}
				</div>
			</div>
		);
	}

	/**
	 * Полностью бесполезный компонент, за исключением того, что с его
	 * помощью можно создавать красивые JSX конструкции
	 */
	public static Page (props: NS.IPageProps) {
		return <div className="tab-content-page">{props.title}</div>;
	}
}
