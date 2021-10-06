// Основные модули
import React from "react";

// Подключение общего контента
import { getTextTime, setLeadingZeros } from "../../../utils";

// Подключение компонентов
import Tabs from "../tabs";
import TimePicker from "../time-picker";
import Calendar from "react-calendar";

// Подключение типов
import { DateTimePicker as NS } from ".";

// Подключение стилей
import "./datetime-picker.less";

/**
 * Расширение для компонента `Dropdown`. Позволяет использовать выпадающий список
 * как форму для выбора даты и времени с соответствующим изменением заголовка
 * компонента выпадающего списка
 *
 * _**Внимание!** Данный компонент может использоваться только вместе с компонентом
 * `Dropdown` либо с компонентом, передающий такой же набор функций для
 * редактирования внутреннего состояния, что и компонент выпадающего списка_
 *
 * _**Внимание!** Компонент является внутренним компонентом проекта и не будет
 * представлен как отдельный компонент по завершении проекта_
 *
 * @author knownOut <re-knownout> knownout@hotmail.com
 * @version 1.0.0
 */
export class DateTimePicker extends React.PureComponent<NS.IProps, NS.IState> {
	state: NS.IState = { dateTime: new Date(), minuteModifier: 5 };

	constructor (props: NS.IProps) {
		super(props);

		while (this.state.dateTime.getMinutes() % this.state.minuteModifier != 0)
			this.state.dateTime.setMinutes(this.state.dateTime.getMinutes() + 1);
	}

	/**
	 * Обновление заголовка родительского компонента выпадающего списка при
	 * каждом обновлении данного компонента
	 */
	componentDidUpdate () {
		if (this.props.contextOptions.updateTitle) {
			const [ hours, minutes ] = [ this.state.dateTime.getHours(), this.state.dateTime.getMinutes() ].map(e =>
				setLeadingZeros(e, 2)
			);

			this.props.contextOptions.updateTitle(`${getTextTime(this.state.dateTime)} года, в ${hours}:${minutes}`);
		}
	}

	/** Хук загрузки компонента для вызова события onReady, если задано */
	componentDidMount () {
		if (this.props.onReady) this.props.onReady(this.state.dateTime);
	}

	render () {
		// Атрибуты календаря
		const dateAttributes = {
			get maxDate () {
				const maxDate = new Date();
				maxDate.setMonth(maxDate.getMonth() + 1);

				return maxDate;
			},

			get minDate () {
				const minDate = new Date();
				minDate.setFullYear(minDate.getFullYear() - 5);

				return minDate;
			}
		};

		/** Общая функция обратного вызова компонента */
		const callback = () => this.props.onChange && this.props.onChange(this.state.dateTime);

		return (
			<div className="datetime-picker content-block column">
				<Tabs className="header-content" defaultPage={0}>
					<Tabs.Page title="Дата">
						<Calendar
							{...dateAttributes}
							onChange={(date: Date) => {
								date.setMinutes(this.state.dateTime.getMinutes());
								date.setHours(this.state.dateTime.getHours());

								this.setState({ dateTime: date }, callback);
							}}
						/>
					</Tabs.Page>
					<Tabs.Page title="Время">
						<TimePicker
							minuteModifier={this.state.minuteModifier}
							onChange={date => {
								const dateTime = new Date(this.state.dateTime);
								dateTime.setHours(date.hours);
								dateTime.setMinutes(date.minutes);

								this.setState({ dateTime }, callback);
							}}
						/>
					</Tabs.Page>
				</Tabs>
			</div>
		);
	}
}
