import React from "react";
import { getIconPath } from "../../../components/icon";
import "./select-menu.less";

interface IProps {
	children: JSX.Element[] | JSX.Element;

	/** Процедура обновления состояния активного элемента в родительском элементе */
	updateSelection?: (selection: number) => void;

	/** Обработчик события клика на элемент */
	onItemClick?: (key: number, name?: string) => void;

	/** Переключатель доступности выбора активного элемента в текущем списке */
	selectable?: boolean;

	/** Индекс изначально активного элемента */
	selection?: number;
}

interface IState {
	/** Индекс (ключ) текущего активного элемента */
	selection: number;
}

interface IItemProps {
	/** Иконка перед текстом элемента */
	icon?: string;

	/** Текст элемента */
	children: string;

	/** Дополнительный класс элемента */
	className?: string;

	/** Переключатель доступности элемента */
	readonly?: boolean;
}

/**
 * Компонент списка с возможностью выбора одного элемента, как активного
 */
export class SelectMenu extends React.PureComponent<IProps, IState> {
	state: IState = {
		selection: Number.isNaN(this.props.selection) ? -1 : this.props.selection as number
	};

	constructor (props: IProps) {
		super(props);
	}

	componentDidUpdate () {
		if (this.props.updateSelection) this.props.updateSelection(this.state.selection);
	}

	render () {
		/**
         * Техническая функция для перестройки элементов меню при необходимости.
         *
         * Элемент перестраивается в том случае, если в списке включена
         * возможность выбора активного элемента.
         *
         * @param child элемент списка
         * @param key индекс элемента в списке
         * @returns оригинальный или перестроенный элемент
         */
		const rebuildChildren = (child: JSX.Element, key: number) => {
			const onSingleItemClick = () =>
				this.props.onItemClick ? this.props.onItemClick(key, child.props.text) : null;

			// Сразу же возвращаем оригинальный элемент, если перестройка не нужна
			if (this.props.selectable === false) return SelectMenu.Item({ ...child.props }, onSingleItemClick);

			// Атрибуты оригинального элемента, добавленного в меню
			const { icon, children: text, readonly } = child.props as { [key: string]: string };

			//Часть атрибутов для перестраиваемого элемента
			const attributes = {
				"data-selected": String(this.state.selection == key),
				"data-readonly": readonly,

				// Изменения значения активного элемента при клике
				onClick: (): void =>
					this.setState({ selection: key }, () => {
						if (this.props.onItemClick) this.props.onItemClick(key, text);
					})
			};

			return (
				<div className="menu-item" key={key} {...attributes}>
					{icon && <img src={getIconPath(icon)} alt="" className="icon" />}
					<span className="text">{text}</span>
				</div>
			);
		};

		const childrenList = (Array.isArray(this.props.children)
			? this.props.children
			: [ this.props.children ]) as JSX.Element[];

		return <div className="select-menu">{childrenList.map(rebuildChildren)}</div>;
	}

	/**
     * Дочерний элемент для списка с возможность выбора
     */
	public static Item (props: IItemProps, onClickEvent?: () => void, key?: number) {
		// Класс элемента и элемент изображения с условием
		const className = [ "menu-item", props.className || "" ].join(" ").trim(),
			iconImage = props.icon && <img src={getIconPath(props.icon)} alt="" className="icon" />;

		const onClick = typeof onClickEvent == "function" ? onClickEvent : () => {},
			elementKey = key || Math.random();

		return (
			<div className={className} data-readonly={props.readonly} onClick={onClick} key={elementKey}>
				{iconImage} <span className="text">{props.children}</span>
			</div>
		);
	}
}
