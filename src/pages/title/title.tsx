import React from "react";
import { Link, useRouteMatch } from "react-router-dom";

interface ITitlePageProps {}
interface ITitlePageState {}
export default class TitlePage extends React.Component<ITitlePageProps, ITitlePageState> {
	public readonly state: ITitlePageState = {};
	constructor (props: ITitlePageProps) {
		super(props);
	}

	public render () {
		return <div>Title page stub</div>;
	}
}
