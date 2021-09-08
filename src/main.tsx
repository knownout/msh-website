import "normalize.css";
import "./root.less";

import ReactDOM from "react-dom";
import React from "react";
import Header from "./components/header/header";

interface AppState {}
interface AppProps {}
class App extends React.Component<AppProps, AppState> {
	public readonly state: AppState = {};
	constructor (props: AppProps) {
		super(props);
	}

	public render () {
		return (
			<React.Fragment>
				<div className="screen-size-locker">
					<span className="text">Разрешение или размер экрана устройства не поддерживается</span>
				</div>
				<Header />
			</React.Fragment>
		);
	}
}

ReactDOM.render(<App />, document.querySelector("main#app-root"));
