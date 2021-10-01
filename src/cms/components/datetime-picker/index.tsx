import { Dropdown } from "../dropdown";
import { DateTimePicker } from "./datetime-picker";

export namespace DateTimePicker {
	export interface IProps {
		/** Методы из контекста родительского компонента для
         * обращения к ним вне функции рендера */
		contextOptions: Partial<Dropdown.IDropdownContext>;

		/**
         * Обработчик события изменения данных компонента
         *
         * Вызывается каждый раз после обновления компонентов
         * `TimePicker` и `Calendar`
         *
         * @param date результат выбора типа Date
         */
		onChange?: (date: Date) => void;
	}

	export interface IState {
		/** Текущие дата и время компонента */
		dateTime: Date;

		/** Модификатор времени компонента, описан
         * в компоненте `TimePicker` */
		minuteModifier: number;
	}
}

export default DateTimePicker;
