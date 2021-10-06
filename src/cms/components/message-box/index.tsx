import { MessageBox, MessageBoxWorker } from "./message-box";

/**
 * Тип события кнопки (совмещает клик мышью и нажатие с использованием клавиатуры)
 */
export type TMessageBoxButtonEvent = React.MouseEvent<HTMLDivElement, MouseEvent> | React.KeyboardEvent<HTMLDivElement>;

/**
  * Тип кнопки всплывающего окна
  * @param event событие при нажатии на кнопку (клавиатура и мышь)
  * @param text текст кнопки
  * @param type дополнительный стиль (тип) кнопки
  */
type TMessageBoxButton = {
	/** Событие при нажатии на кнопку (клавиатура и мышь) */
	event?(): void;

	/** Текст кнопки */
	text: string;

	/** Дополнительный стиль (тип) кнопки */
	type?: "default" | "warn" | "critical";
};

/**
  * Тип данных всплывающего окна
  *
  * Если на задан набор кнопок, кнопка "Окей" будет добавлена автоматически
  * с привязкой к ней стандартного события (закрытие окна)
  *
  * @param state состояние всплывающего окна (открыто или закрыто)
  * @param title заголовок всплывающего окна
  * @param message сообщение, отображаемое внутри окна
  * @param buttons набор кнопок окна
  * @param require определяет, будет ли всплывающее окно обязательным для ответа
  *
  */
export type TMessageBoxData = {
	/** Состояние всплывающего окна (открыто или закрыто) */
	state: boolean;

	/** Заголовок всплывающего окна */
	title?: string;

	/** Сообщение, отображаемое внутри окна */
	message?: string | (JSX.Element | string)[];

	/** Набор кнопок окна */
	buttons?: TMessageBoxButton[];

	/** Если задано, окно нельзя закрыть по клику в пустую область */
	require?: boolean;
};

/** Тип состояния родительского компонента для всплывающего окна */
export interface IMessageBoxParent {
	/** Контейнер данных всплывающего окна */
	messageBox: TMessageBoxData;
}

export { MessageBoxWorker };
export default MessageBox;
