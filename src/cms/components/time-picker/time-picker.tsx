import React from "react";
import "./time-picker.less";

import { TimePicker as NS } from ".";

/**
 * Компонент для создания форм выбора времени в виде двух крутилок (часы и минуты)
 * с возможностью установки шага между минутами (рекомендуется ставить шаг, кратный пяти)
 *
 * _Внимание! В компоненте есть такая переменная, как `modifier (модификатор времени)`,
 * добавлена она была в спешке и хрен его знает, как она вообще работает ~~работает и ладно~~.
 * Компонент будет полностью переписан в следующей версии_
 *
 * @author knownOut <re-knownout> knownout@hotmail.com
 * @version 1.0.0
 */
export class TimePicker extends React.Component<NS.IProps, NS.IState> {
	state: NS.IState = { selectedTime: { hours: 0, minutes: 0 }, modifier: this.props.minuteModifier || 5 };

	constructor (props: NS.IProps) {
		super(props);

		// Получение текущей даты из атрибутов компонента или из текущей даты браузера
		const currentDate = props.startTime || new Date();

		// Приведение даты к модификатору времени компонента
		while (currentDate.getMinutes() % this.state.modifier != 0)
			currentDate.setMinutes(currentDate.getMinutes() + 1);

		// Изменение стандартного времени компонента
		this.state.selectedTime = {
			hours: currentDate.getHours(),
			minutes: currentDate.getMinutes() / this.state.modifier
		};
	}

	/// __________________________________________________________________________________________________________________________________________ Технические функции

	/**
     * Метод для изменения состояния текущего времени компонента
     * @param props состояния компонента типа TTimeIndex
     * @param callback функция обратного вызова, передается напрямую в setState
     */
	private readonly setSelectedTimeState = (props: Partial<NS.TTimeIndex>, callback?: () => void) => {
		let resultingObject = this.state.selectedTime;

		const object = props as { [key: string]: any };
		Object.keys(props).forEach(key => {
			resultingObject = Object.assign(resultingObject, { [key]: object[key] });
		});

		this.setState({ selectedTime: resultingObject }, callback);
	};

	/// __________________________________________________________________________________________________________________________________________ Конверторы

	/**
     * Техническая функция для приведения чисел к определенной длине путем
     * добавления дополнительных нулей перед числом
     * @param value число, которое необходимо обработать
     * @param length длина возвращаемого значения
     * @returns строка определенной длины
     */
	private readonly addLeadingSymbols = (value: number, length: number) =>
		String(value).length < length ? Array(length - String(value).length).fill("0") + String(value) : String(value);

	/**
     * Внутренняя техническая функция реализующая конвертацию времени из типа TTimeIndex
     * в тип string вида HH:mm
     * @param data данные об индексах времени тип TTimeIndex
     * @param modifier модификатор времени компонента
     * @returns время в формате строки HH:mm
     */
	private readonly convertTime = (data: NS.TTimeIndex, modifier: number) =>
		Object.values(data)
			.map(e => this.addLeadingSymbols(e, 2))
			.reduce((a, b) => a + ":" + this.addLeadingSymbols(Number(b) * modifier, 2));

	/// __________________________________________________________________________________________________________________________________________ Генераторы

	/**
     * Техническая функция для создания числового диапазона от нуля до
     * заданного значения
     * @param length максимальное значение диапазона (размер массива)
     * @param modifier модификатор времени компонента
     * @returns диапазон значений от нуля до заданного
     */
	private readonly createNumericList = (length: number, modifier: number) =>
		Array(length / modifier).fill(null).map((_, i) => i * modifier);

	/**
     * Техническая функция для создания JSX-элементов на базе
     * числовых диапазонов из функции `createNumericList`
     * @param numericList числовой диапазон
     * @param stateIndex текущий индекс времени _(для определения активного элемента)_
     * @param container контейнер текущего элемента (часы или минуты)
     * @returns список JSX-элементов, сгенерированных на основе числового диапазона
     */
	private createElementsFromNumericList (numericList: number[], stateIndex: number, container: "minutes" | "hours") {
		/**
         * Внутренняя техническая функция для создания JSX элементов
         * @param text текст элемента
         * @param key индекс (ключ) элемента
         * @param selected переключатель активности атрибута
         * @param container контейнер элемента (часы или минуты)
         * @returns JSX элемент
         */
		const createJSXElement = (text: string, key: number, selected: string, container: "minutes" | "hours") => {
			// Контейнер событий элемента
			const eventListeners = {
				onClick: () =>
					this.setSelectedTimeState({ [container]: key }, () => {
						let { hours, minutes } = this.state.selectedTime;
						minutes = minutes * this.state.modifier;

						if (this.props.onChange)
							this.props.onChange(
								{ hours, minutes },
								this.convertTime(this.state.selectedTime, this.state.modifier)
							);
					})
			};

			return <i {...{ "data-selected": selected, key, ...eventListeners }}>{text}</i>;
		};

		// Конвертация числового диапазона в список JSX элементов
		const resultingList = numericList.map((number, index) => {
			return createJSXElement(this.addLeadingSymbols(number, 2), index, String(index === stateIndex), container);
		});

		return resultingList;
	}

	render () {
		/// ______________________________________________________________________________________________________________________________________ Локальные функции отрисовки

		/**
         * Внутренняя техническая функция, призванная упростить взаимодействие с
         * интерфейсом создания элементов на базе числовых диапазонов и объединить
         * функциональность методов создания числовых диапазонов и преобразования числовых
         * диапазонов в списки элементов
         * @param length длина числового диапазона
         * @param stateIndex индекс текущего активного элемента
         * @param container тип контейнера родительского элемента
         * @param modifier модификатор времени компонента
         * @returns список JSX элементов _(результат работы метода `createElementsFromNumericList`)_
         */
		const createElements = (length: number, stateIndex: number, container: "minutes" | "hours", modifier = 1) =>
			this.createElementsFromNumericList(this.createNumericList(length, modifier), stateIndex, container);

		/// ______________________________________________________________________________________________________________________________________ Обработчики событий

		/**
         * Обработчик события вращения колеса мыши пользователем.
         *
         * Добавляется к каждому временному контейнеру (их два) и обрабатывает
         * изменение времени компонента
         * @param s селектор типа контейнера (часы или минуты)
         * @param e оригинальное React-событие элемента
         * @param m модификатор времени компонента
         * @returns
         */
		const wheelEventHandler = (s: "hours" | "minutes", e: React.WheelEvent<HTMLDivElement>, m: number) => {
			// Переменные направления вращения и максимального элемента текущего контейнера
			const { deltaY: delta } = e,
				maxTime = s == "hours" ? 24 : 60 / m;

			// Новое значение для индексов времени компонента
			let selectorValue = this.state.selectedTime[s] + (delta > 0 ? 1 : -1);

			// Не вносить изменения, если достигнут конец списка
			if (delta > 0 && selectorValue >= maxTime) return;

			// Ограничение значения индексов количеством элементов контейнера
			selectorValue =
				selectorValue < 0 ? (selectorValue = 0) : selectorValue >= maxTime ? maxTime - 1 : selectorValue;

			const resultingObject = { [s]: selectorValue } as NS.TTimeIndex;

			// Изменение состояния компонента и вызов возвратной функции
			this.setSelectedTimeState(resultingObject, () => {
				let { hours, minutes } = this.state.selectedTime;
				minutes = minutes * m;

				if (this.props.onChange)
					this.props.onChange({ hours, minutes }, this.convertTime(this.state.selectedTime, m));
			});

			e.preventDefault();
			e.stopPropagation();
			return false;
		};

		/// ______________________________________________________________________________________________________________________________________ Контейнеры атрибутов

		// CSS позиции селекторов
		const selectorPositionY = {
			minutes: { style: { top: `calc(50% - ${this.state.selectedTime.minutes} * 26px)` } as React.CSSProperties },
			hours: { style: { top: `calc(50% - ${this.state.selectedTime.hours} * 26px)` } as React.CSSProperties }
		};

		// Распределение событий для каждого временного контейнера
		const eventHandlers = {
			minutes: {
				onWheel: (event: React.WheelEvent<HTMLDivElement>) =>
					wheelEventHandler("minutes", event, this.state.modifier)
			},
			hours: {
				onWheel: (event: React.WheelEvent<HTMLDivElement>) =>
					wheelEventHandler("hours", event, this.state.modifier)
			}
		};

		return (
			<div className="time-picker content-block row nowrap">
				{/* Часть компонента, отвечающая за выбор времени */}
				<div className="time-selector content-block column nowrap no-centering">
					{/* Заголовки временных контейнеров */}
					<div className="selectors-title-holder content-block row nowrap">
						<span className="selector-title">Часы</span>
						<span className="selector-title">Минуты</span>
					</div>

					{/* Держатель временных контейнеров */}
					<div className="selectors-content-holder content-block row nowrap">
						{/* Временной контейнер для часов */}
						<div className="selector-wrapper content-block nowrap" {...eventHandlers.hours}>
							<div className="selector content-block column nowrap" {...selectorPositionY.hours}>
								{createElements(24, this.state.selectedTime.hours, "hours")}
							</div>
						</div>

						{/* Временной контейнер для минут */}
						<div className="selector-wrapper content-block nowrap" {...eventHandlers.minutes}>
							<div className="selector content-block column nowrap" {...selectorPositionY.minutes}>
								{createElements(60, this.state.selectedTime.minutes, "minutes", this.state.modifier)}
							</div>
						</div>
					</div>
				</div>

				{/* Часть компонента, отвечающая за отображение результата выбора */}
				<div className="time-result content-block column">
					{/* Результат выбора времени */}
					<div className="selection-result content-block column nowrap no-centering">
						<span className="selection-result-title">Выбрано</span>
						<span className="selection-result-content">
							{this.convertTime(this.state.selectedTime, this.state.modifier)}
						</span>
					</div>

					{/* Подсказка по взаимодействию с крутилками */}
					<div className="selection-hint">
						Изменить часы и минуты можно при помощи прокрутки колёсиком мыши или клика на нужное время
					</div>
				</div>
			</div>
		);
	}
}
