import React from "react";

namespace DateTimePicker {
	export interface IProps {}

	export interface IState {}
}

export class DateTimePicker extends React.PureComponent<DateTimePicker.IProps, DateTimePicker.IProps> {
	state: DateTimePicker.IState = {};

	constructor (props: DateTimePicker.IProps) {
		super(props);
	}

	render () {
		return <div className="datetime-picker">DateTimePickerComponent stub</div>;
	}
}
