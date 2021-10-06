import { TimePicker } from "./time-picker";

/** Пространство имен для компонента TimePicker */
export namespace TimePicker {
	/** Тип объекта индексов выбранного времени */
	export type TTimeIndex = { hours: number; minutes: number };

	export interface IProps {
		/**
		 * Обработчик события изменения значения времени в компоненте
		 * вызывается каждый раз, когда фактическое время компонента
		 * изменяется
		 *
		 * _(не будет вызываться по сто раз, если пользователь
		 * тупой и крутит колесиком мыши даже когда список закончился)_
		 *
		 * @param time объект типа TTimeIndex, содержащий информацию о часах и минутах
		 * @param formattedTime строка времени вида HH:mm
		 */
		onChange?(time: TTimeIndex, formattedTime: string): void;

		/**
		 * Изначально выбранное время компонента.
		 * Если не задано, устанавливается текущее время.
		 */
		startTime?: Date;

		/**
		 * Модификатор шага крутилки минут
		 */
		minuteModifier?: number;
	}

	export interface IState {
		/**
		 * Текущее время компонента
		 */
		selectedTime: TTimeIndex;

		/**
		 * Модификатор шага крутилки минут
		 */
		modifier: number;
	}
}

export default TimePicker;
