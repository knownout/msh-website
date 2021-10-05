import React from "react";
import "./dropdown.less";

import { getIconPath } from "../../../components/icon";
import { Dropdown as NS } from ".";

type TObject = { [key: string]: any };

/** Тип модуля транслитерации (интернационализации) компонента */
type TTranslationModule = {
	/** Параметры заголовка компонента */
	title: {
		/** Стандартный текст заголовка, если не выбран элемент */
		default: string;
	};
};

export const DropdownContext = React.createContext<Partial<NS.IDropdownContext>>({});

/**
 * Компонент для создания независимых выпадающих списков в существующих react-компонентах,
 * не требующий дополнительной инициализации и интеграции _~~(воткнул и поехали)~~_
 *
 * @author knownOut <re-knownout> knownout@hotmail.com
 * @version 1.0.0
 */
export class Dropdown extends React.PureComponent<NS.IProps, NS.IState> {
	state: NS.IState = {
		dropdownOpen: false,
		selected: Number.isInteger(this.props.select) ? this.props.select as number : -1,

		overrideTitleText: null
	};

	constructor (props: NS.IProps) {
		super(props);

		this.headerClickHandler = this.headerClickHandler.bind(this);
	}

	/// __________________________________________________________________________________________________________________________________________ Технические методы

	/**
	 * Техническая функция для конвертации входящих элементов выпадающего
	 * списка в определенное общее представление
	 * @param childrenList набор атрибутов элементов
	 * @returns набор конвертированных элементов
	 */
	private convertChildren (childrenList: NS.IItemProps[]) {
		const resultingList = childrenList.map((props, key) => {
			const { onItemClick, onChange, stayOpen } = this.props;

			// Контейнер для атрибутов элемента
			const attributesList = {
				onClick: () => {
					// Вызов события клика на элемент, если доступно
					if (onItemClick) onItemClick(key, props.children);

					// Вызов события изменения значения компонента и, собственно, изменение этого значения
					if (!props.readonly && this.state.selected != key) {
						this.setState({ selected: key, dropdownOpen: stayOpen || false });

						if (onChange) onChange(key, props.children);
					}
				},

				"data-selected": String(this.state.selected == key),
				key,

				// Запись оставшихся доступных атрибутов
				...props,

				// Перезапись атрибута класса. Именно в таком порядке (сначала запись, потом перезапись)
				className: [ "item", props.className || "" ].join(" ").trim()
			};

			return (
				<div data-enabled={String(props.readonly || false)} {...attributesList}>
					{props.children}
				</div>
			);
		});

		return resultingList;
	}

	/// __________________________________________________________________________________________________________________________________________ Функции контекста

	private readonly setDropdownState = (dropdownOpen: boolean) => this.setState({ dropdownOpen });
	private readonly updateTitle = (title: string) => this.setState({ overrideTitleText: title });

	/// __________________________________________________________________________________________________________________________________________ Обработчики событий

	/**
	 * Процедура обработки события клика на заголовок компонента _(клика на компонент)_
	 */
	private readonly headerClickHandler = () => this.setState({ dropdownOpen: !this.state.dropdownOpen });

	/// __________________________________________________________________________________________________________________________________________ Локальные переменные

	/** Контейнер данных о атрибутах элементов выпадающего списка */
	private childrenList: NS.IItemProps[] = [];

	/// __________________________________________________________________________________________________________________________________________ Вызов React-функций

	componentDidMount () {
		const timeOutCallback = () => {
			if (this.state.dropdownOpen) this.setState({ dropdownOpen: false });
		};

		if (!this.state.timeOut)
			this.setState({ timeOut: Dropdown.timeOut(this.props.openTimeOut || 1000, timeOutCallback) });
	}

	render () {
		// Обновление списка атрибутов элементов перед отрисовкой, если количество элементов изменилось
		if (this.childrenList.length !== this.props.children) {
			// Обнулить текущий список
			this.childrenList = [];

			// Конвертация атрибута содержания компонента в одномерный массив
			const childrenList = [ this.props.children ].flat() as JSX.Element[];

			// Запись данных об атрибутах
			this.childrenList = childrenList.map(child => {
				return child.props as NS.IItemProps;
			});
		}

		// Определение заголовка компонента
		const titleText = this.childrenList[this.state.selected]
			? this.childrenList[this.state.selected].children
			: Dropdown.translation.title.default;

		const eventHandlers = {
			onMouseOut: () => {
				if (this.state.timeOut && this.state.dropdownOpen && this.props.closeOnMouseLeave !== false)
					this.state.timeOut.set();
			},

			onMouseOver: () => {
				if (this.state.timeOut) this.state.timeOut.clear();
			}
		};

		const { setDropdownState, updateTitle } = this;

		/// ______________________________________________________________________________________________________________________________________ Отрисовка

		return (
			<div className="dropdown content-block row nowrap" data-open={this.state.dropdownOpen} {...eventHandlers}>
				{/* Заголовок компонента */}
				<div className="dropdown-header-content content-block row nowrap" onClick={this.headerClickHandler}>
					<span className="selection-text">{this.state.overrideTitleText || titleText}</span>

					{/* Декоративная кнопка открытия списка */}
					<div className="select-button">
						<img src={getIconPath("arrow")} alt="" />
					</div>
				</div>

				{/* Выпадающий список */}
				<div className="dropdown-items-holder content-block column nowrap styled-block">
					<DropdownContext.Provider value={{ setDropdownState, updateTitle }}>
						{this.props.rawContent ? this.props.children : this.convertChildren(this.childrenList)}
					</DropdownContext.Provider>
				</div>
			</div>
		);
	}

	/// __________________________________________________________________________________________________________________________________________ Статические методы

	/**
	 * Компонент не имеет практического смысла, зато можно красиво
	 * писать JSX конструкции с его использованием
	 *
	 * _Компонент НЕ рендерится, а сразу обрабатывается родителем_
	 */
	public static Item (props: NS.IItemProps) {
		return <div className="item">{props.children}</div>;
	}

	/**
	 * Функция для адекватной работы с setTimeout и clearTimeout, без
	 * костылей в коде по типу `any` на переменных.
	 *
	 * Возвращает тип `TTimeOutFunctionMethods` из пространства имен `Dropdown`:
	 * - `clear()` остановить таймер
	 * - `set()` запустить таймер
	 *
	 * @param time время таймаута в миллисекундах
	 * @param callback функция, вызываемая по завершению таймаута
	 * @returns Dropdown.TTimeOutFunctionMethods
	 */
	public static timeOut (time: number, callback: () => void): NS.TTimeOutFunctionMethods {
		let timeOut: any = null;

		return {
			set () {
				timeOut = setTimeout(callback, time);
			},
			clear () {
				clearTimeout(timeOut);
				timeOut = null;
			}
		};
	}

	/// __________________________________________________________________________________________________________________________________________ Транслитерация

	/** Модуль транслитерации (интернационализации) компонента */
	public static translation: TTranslationModule = {
		title: { default: "Выберите элемент" }
	};

	/**
	 * Метод редактирования i18n конфигурации компонента
	 * @param props partial тип TTranslationModule (по аналогии с React state)
	 * @returns TTranslationModule
	 */
	public static editTranslationModule (props: Partial<TTranslationModule>) {
		let resultingObject = Dropdown.translation;

		Object.keys(props).forEach(key => Object.assign(resultingObject, { [key]: (props as TObject)[key] }));
		Dropdown.translation = resultingObject;

		return Dropdown.translation;
	}
}
