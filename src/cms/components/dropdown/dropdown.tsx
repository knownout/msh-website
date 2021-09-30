import React from "react";
import { getIconPath } from "../../../components/icon";
import "./dropdown.less";

/** Пространство имен для компонента `Dropdown` */
namespace Dropdown {
	export interface IProps {
		children: JSX.Element[] | JSX.Element;
		/**
		 * Индекс изначально выбранного элемента, если не установлен, заголовком будет
		 * назначен текст из модуля транслитерации `Dropdown.translation`
		 */
		select?: number;

		/**
		 * Если `true`, то выпадающий список не будет закрываться после
		 * выбора элемента из списка
		 */
		stayOpen?: boolean;

		/**
		 * Обработчик события клика на элемент выпадающего списка
		 *
		 * _Внимание! Вызывается при каждом клике на элемент, даже если тот выбран/выключен
		 * или у него установлен атрибут `readonly`_
		 *
		 * @param key индекс элемента в списке
		 * @param name текст элемента
		 */
		onItemClick?: (key: number, name: string) => void;

		/**
		 * Обработчик события изменения значения выпадающего списка
		 *
		 * _В отличии от `onItemClick`, вызывается только в случае изменения значения
		 * заголовка компонента_
		 *
		 * @param key индекс выбранного элемента в списке
		 * @param value новое значение заголовка компонента
		 */
		onChange?: (key: number, value: string) => void;
	}

	export interface IState {
		/** Состояние выпадающего списка компонента */
		dropdownOpen: boolean;

		/** Индекс текущего выбранного элемента */
		selected: number;

		/** Таймаут автоматического сокрытия выпадающего списка */
		timeOut?: TTimeOutFunctionMethods;
	}

	export interface IItemProps {
		children: string;
		readonly?: boolean;

		className?: string;
	}

	export type TTimeOutFunctionMethods = { set: () => void; clear: () => void };
	export type TTimeOutFunction = (time: number, callback: () => void) => TTimeOutFunctionMethods;
}

type TObject = { [key: string]: any };

/** Тип модуля транслитерации (интернационализации) компонента */
type TTranslationModule = {
	/** Параметры заголовка компонента */
	title: {
		/** Стандартный текст заголовка, если не выбран элемент */
		default: string;
	};
};

/**
 * Компонент для создания независимых выпадающих списков в существующих react-компонентах,
 * не требующий дополнительной инициализации и интеграции _~~(воткнул и поехали)~~_
 *
 * @author knownOut <re-knownout> knownout@hotmail.com
 * @version 1.0.0
 */
export class Dropdown extends React.PureComponent<Dropdown.IProps, Dropdown.IState> {
	state: Dropdown.IState = {
		dropdownOpen: false,
		selected: Number.isInteger(this.props.select) ? this.props.select as number : -1
	};

	constructor (props: Dropdown.IProps) {
		super(props);

		this.headerClickHandler = this.headerClickHandler.bind(this);
	}

	/**
	 * Процедура обработки события клика на заголовок компонента _(клика на компонент)_
	 */
	private readonly headerClickHandler = () => this.setState({ dropdownOpen: !this.state.dropdownOpen });

	/** Модуль транслитерации (интернационализации) компонента */
	public static translation: TTranslationModule = {
		title: { default: "Выберите элемент" }
	};

	/** Контейнер данных о атрибутах элементов выпадающего списка */
	private childrenList: Dropdown.IItemProps[] = [];

	componentDidMount () {
		const timeOutCallback = () => {
			if (this.state.dropdownOpen) this.setState({ dropdownOpen: false });
		};

		if (!this.state.timeOut) this.setState({ timeOut: Dropdown.timeOut(1000, timeOutCallback) });
	}

	// TODO: Таймер авто-закрытия

	render () {
		// Обновление списка атрибутов элементов перед отрисовкой, если количество элементов изменилось
		if (this.childrenList.length !== this.props.children) {
			// Обнулить текущий список
			this.childrenList = [];

			// Конвертация атрибута содержания компонента в одномерный массив
			const childrenList = [ this.props.children ].flat() as JSX.Element[];

			// Запись данных об атрибутах
			this.childrenList = childrenList.map(child => {
				return child.props as Dropdown.IItemProps;
			});
		}

		/**
		 * Техническая функция для конвертации входящих элементов выпадающего
		 * списка в определенное общее представление
		 * @param childrenList набор атрибутов элементов
		 * @returns набор конвертированных элементов
		 */
		const convertChildren = (childrenList: Dropdown.IItemProps[]) => {
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
					<div data-readonly={String(props.readonly || false)} {...attributesList}>
						{props.children}
					</div>
				);
			});

			return resultingList;
		};

		// Определение заголовка компонента
		const titleText = this.childrenList[this.state.selected]
			? this.childrenList[this.state.selected].children
			: Dropdown.translation.title.default;

		const eventHandlers = {
			onMouseOut: () => {
				if (this.state.timeOut && this.state.dropdownOpen) this.state.timeOut.set();
			},

			onMouseOver: () => {
				if (this.state.timeOut) this.state.timeOut.clear();
			}
		};

		return (
			<div className="dropdown content-block row nowrap" data-open={this.state.dropdownOpen} {...eventHandlers}>
				{/* Заголовок компонента */}
				<div className="dropdown-header-content content-block row nowrap" onClick={this.headerClickHandler}>
					<span className="selection-text">{titleText}</span>

					{/* Декоративная кнопка открытия списка */}
					<div className="select-button">
						<img src={getIconPath("arrow")} alt="" />
					</div>
				</div>

				{/* Выпадающий список */}
				<div className="dropdown-items-holder content-block column nowrap styled-block">
					{convertChildren(this.childrenList)}
				</div>
			</div>
		);
	}

	/**
	 * Компонент не имеет практического смысла, зато можно красиво
	 * писать JSX конструкции с его использованием
	 *
	 * _Компонент НЕ рендерится, а сразу обрабатывается родителем_
	 */
	public static Item (props: Dropdown.IItemProps) {
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
	public static timeOut (time: number, callback: () => void): Dropdown.TTimeOutFunctionMethods {
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
