import React from "react";
import { TMessageBoxButtonEvent, TMessageBoxData } from ".";
import "./message-box.less";

type TObject = { [key: string]: any };
type TMessageBoxHintState = { state: boolean; x?: number; y?: number };

interface IProps {
	state: TMessageBoxData;
	worker: MessageBoxWorker;
}

/** Тип для модуля интернационализации (локализации) компонента */
type TTranslationModule = {
	/** Параметры кнопок */
	buttons: {
		/** Название стандартной кнопки */
		default: string;
	};

	/** Текст подсказки о возможности закрытия окна (возле курсора),
	 * если не установлен атрибут require */
	hint: string;
};

/**
 * Компонент для работы с всплывающим окном без лишних костылей в виде ручного изменения
 * состояния объект окна в родительском компоненте
 *
 * @author knownOut <re-knownout> knownout@hotmail.com
 * @version 1.0.0
 */
export class MessageBoxWorker {
	/**
	 * Техническая процедура для обновления состояния родительского компонента
	 * @param messageBox выходные данные об окне
	 */
	private readonly updateStateFunction: (messageBox: TMessageBoxData) => void;
	public static translation: TTranslationModule = {
		buttons: { default: "Окей" },
		hint: "Клик, чтобы закрыть окно"
	};

	/**
	 * Техническая функция для получения текущей версии данных из состояния
	 * родительского компонента
	 *
	 /* TODO: Возможно, класс будет работать и без этой функции, а с
	 * простой передачей this.state.messageBox из родителя
	 */
	private readonly messageBox: TMessageBoxData;

	constructor (updateStateFunction: (messageBox: TMessageBoxData) => void, messageBox: TMessageBoxData) {
		this.updateStateFunction = updateStateFunction;
		this.messageBox = messageBox;

		this.updateContent = this.updateContent.bind(this);
		this.updateState = this.updateState.bind(this);
		this.require = this.require.bind(this);
	}

	/**
	 * Метод позволяет обновить состояние окна в компоненте (открыто или закрыто)
	 * @param state новое состояние окна
	 * @param timeout время в миллисекундах, через которое будет применено новое состояние
	 * @returns возвращает этот же экземпляр класса (chaining)
	 */
	public updateState (state: boolean, timeout: number = 0) {
		setTimeout(() => this.updateStateFunction(Object.assign(this.messageBox, { state })), timeout);
		return this;
	}

	/**
	 * Метод изменяет атрибут require, который, в свою очередь, определяет, должен ли пользователь сделать
	 * выбор (кликнуть на одну из кнопок) для того, чтобы закрыть всплывающее окно, или достаточно будет
	 * кликнуть на пустую область
	 * @param require если true, пользователю нужно будет кликнуть на кнопку
	 * @returns возвращает этот же экземпляр класса (chaining)
	 */
	public require (require: boolean) {
		this.updateStateFunction(Object.assign(this.messageBox, { require: require }));
		return this;
	}

	/**
	 * По параметрам всё то же, что было описано в типах TMessageBoxData и TMessageBoxButton.
	 *
	 * Аргументы функции не завязаны друг на друга, так что могут быть изменены как
	 * все вместе, так и по отдельности, хоть разными методами, всё равно должно работать.
	 *
	 * @param message текст внутри окна
	 * @param title заголовок окна
	 * @param buttons список кнопок окна
	 * @returns возвращает этот же экземпляр класса (chaining)
	 */
	public updateContent (props: Partial<TMessageBoxData>) {
		let resultingObject = this.messageBox;

		/**
		 * deprecated
		 *
		 * 	if (message) resultingObject = Object.assign(resultingObject, { message });
		 *	if (buttons) resultingObject = Object.assign(resultingObject, { buttons });
		 * 	if (title) resultingObject = Object.assign(resultingObject, { title });
		 *
		 */

		Object.keys(props).forEach(key => Object.assign(resultingObject, { [key]: (props as TObject)[key] }));

		this.updateStateFunction(resultingObject);
		return this;
	}

	/**
	 * Метод редактирования i18n конфигурации компонента
	 * @param props partial тип TTranslationModule (по аналогии с React state)
	 * @returns TTranslationModule
	 */
	public static editTranslationModule (props: Partial<TTranslationModule>) {
		let resultingObject = MessageBoxWorker.translation;

		Object.keys(props).forEach(key => Object.assign(resultingObject, { [key]: (props as TObject)[key] }));
		MessageBoxWorker.translation = resultingObject;

		return MessageBoxWorker.translation;
	}
}

export function MessageBox (props: IProps) {
	const hintReference = React.createRef<HTMLDivElement>();

	const [ hint, setHint ] = React.useState<TMessageBoxHintState>({
		state: false,
		x: 0,
		y: 0
	});

	// Сокращение атрибутов в переменные
	const title = props.state.title || String(),
		buttons = props.state.buttons || [ { text: MessageBoxWorker.translation.buttons.default } ],
		message = props.state.message || String();

	/**
	 * Обработчик нажатия на кнопку (мышь и клавиатура)
	 * @param event React-событие, которое произошло с кнопкой
	 * @param callback дополнительная функция, если не задана, функция закрытия окна
	 */
	const buttonEventHandler = (event: TMessageBoxButtonEvent, callback?: () => void) => {
		/**
		 * Необходимо предотвращать стандартное событие из-за того, что при смене фокуса
		 * с кнопки на, к примеру, поле ввода, событие клавиатуры введет нажатые символы
		 * в это поле ввода
		 */
		event.preventDefault();

		if (event.nativeEvent instanceof KeyboardEvent)
			if (![ " ", "Enter" ].includes((event as React.KeyboardEvent<HTMLDivElement>).key)) return;

		// Если не задана обратная функция, закрыть окно
		if (callback) callback();
		else props.worker.updateState(false);
	};

	// Ссылка на корневой элемент компонента окна
	const layoutReference = React.createRef<HTMLDivElement>();

	// Атрибуты для корневого элемента компонента окна
	const layoutAttributesList = {
		ref: layoutReference,

		className: "content-block column nowrap",
		id: "message-box-layout",

		onClick: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
			if (event.target != layoutReference.current) return;
			if (props.state.require) return;

			props.worker.updateState(false);
		}
	};

	// Конвертер массива объектов типа TMessageBoxButton в JSX-элементы
	const buttonsList = buttons.map(button => {
		const buttonEvent = (event: TMessageBoxButtonEvent) => buttonEventHandler(event, button.event);
		const attributes = {
			className: `button ${button.type || "default"}`,
			key: Math.random()
		};

		return (
			<div onClick={buttonEvent} onKeyPress={buttonEvent} {...attributes}>
				{button.text}
			</div>
		);
	});

	const messageData = Array.isArray(message) ? message.map(e => <p key={Math.random()}>{e}</p>) : message;

	/**
	 * Обработчик события движения мыши на элементе-обертке всплывающего окна
	 * @param event событие движения мышью
	 */
	const mouseMoveEventHandler = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
		// Элемент, который в данный момент находится под курсором пользователя
		const hoveredElement = document.elementFromPoint(event.clientX, event.clientY),
			// Условия, при выполнении которых будет выедена подсказка
			conditions = [
				hoveredElement && hoveredElement.id == "message-box-layout",
				!("ontouchstart" in document.documentElement),
				hintReference.current
			].reduce((a, b) => a && b);

		// Проверка заданных условий и не является ли окно обязательным
		if (!conditions || props.state.require === true) {
			if (hint.state !== false) setHint({ ...hint, state: false });
		} else {
			// Получение элемента подсказки из ссылки на него
			const hintElement = hintReference.current as HTMLDivElement;

			// Изменение состояния подсказки
			setHint({
				state: true,
				x: event.clientX < hintElement.clientWidth + 5 ? hintElement.clientWidth + 5 : event.clientX,
				y: event.clientY
			});
		}
	};

	/** Атрибуты для корректного отображения подсказки */
	const hintSupportAttributes = {
		/** Атрибуты для элемента подсказки */
		hint: {
			/** Положение подсказки (относительно курсора) */
			style: { left: (hint.x || 0) + "px", top: (hint.y || 0) + "px" } as React.CSSProperties,

			/** Состояние отображения подсказки */
			"data-state": hint.state,

			/** Ссылка на элемент подсказки */
			ref: hintReference
		},

		/** Атрибуты для элемента-обертки окна */
		layout: {
			onMouseMove: mouseMoveEventHandler,
			onMouseOut: () => setHint({ ...hint, state: false })
		}
	};

	return (
		<div {...layoutAttributesList} data-state={props.state.state} {...hintSupportAttributes.layout}>
			<div id="message-box-cursor-hint" {...hintSupportAttributes.hint}>
				{MessageBoxWorker.translation.hint}
			</div>
			<div className="msg-holder content-block column nowrap no-centering gap-10">
				{title && <span className="msg-title">{title}</span>}
				<div className="msg-content styled-block content-block column no-centering nowrap">
					{message && <span className="msg-message">{messageData}</span>}
				</div>
				<div className="msg-buttons-holder styled-block content-block row no-centering">{buttonsList}</div>
			</div>
		</div>
	);
}
