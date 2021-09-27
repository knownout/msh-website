import React from "react";
import { TMessageBoxButtonEvent, TMessageBoxData } from ".";
import "./message-box.less";

interface IProps {
	messageBox: TMessageBoxData;
	worker: MessageBoxWorker;
}

/**
 * Класс для работы с всплывающим окном без лишних костылей в виде ручного изменения
 * состояния объект окна в родительском компоненте
 */
export class MessageBoxWorker {
	/**
	 * Техническая процедура для обновления состояния родительского компонента
	 * @param messageBox выходные данные об окне
	 */
	private readonly updateStateFunction: (messageBox: TMessageBoxData) => void;

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

	public require (require: boolean) {
		this.updateStateFunction(Object.assign(this.messageBox, { require: require }));
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
	public updateContent ({ message, title, buttons }: TMessageBoxData) {
		let resultingObject = this.messageBox;

		if (message) resultingObject = Object.assign(resultingObject, { message });
		if (buttons) resultingObject = Object.assign(resultingObject, { buttons });
		if (title) resultingObject = Object.assign(resultingObject, { title });

		this.updateStateFunction(resultingObject);
		return this;
	}
}

export function MessageBox (props: IProps) {
	// Сокращение атрибутов в переменные
	const title = props.messageBox.title || String(),
		buttons = props.messageBox.buttons || [ { text: "Окей" } ],
		message = props.messageBox.message || String();

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
			if (props.messageBox.require) return;

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

	return (
		<div {...layoutAttributesList} data-state={props.messageBox.state}>
			<div className="msg-holder content-block column nowrap no-centering gap-10">
				{title && <span className="msg-title">{title}</span>}
				<div className="msg-content styled-block content-block column no-centering nowrap">
					{message && <span className="msg-message">{message}</span>}
				</div>
				<div className="msg-buttons-holder styled-block content-block row no-centering">{buttonsList}</div>
			</div>
		</div>
	);
}
