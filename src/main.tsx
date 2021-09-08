import "normalize.css";
import "./root.less";

import ReactDOM from "react-dom";
import React from "react";
import Header from "./components/header/header";
import Navigation from "./components/navigation/navigation";

import "./components/navigation/navigation.less";

interface AppState {
	headerHeight: number;
}
interface AppProps {}
class App extends React.Component<AppProps, AppState> {
	public readonly state: AppState = {
		headerHeight: 0
	};
	constructor (props: AppProps) {
		super(props);

		this.handleWindowResize = this.handleWindowResize.bind(this);
	}

	private readonly headerElementRef = React.createRef<HTMLDivElement>();
	private readonly mainElementRef = React.createRef<HTMLDivElement>();

	private handleWindowResize () {
		if (!this.headerElementRef.current) return;

		const height = this.headerElementRef.current.offsetHeight;
		this.setState({ headerHeight: height });
	}

	componentDidMount () {
		this.handleWindowResize();
		window.addEventListener("resize", this.handleWindowResize);
	}

	public render () {
		const height = window.innerHeight - this.state.headerHeight;
		return (
			<React.Fragment>
				<div className="screen-size-locker">
					<span className="text">Разрешение или размер экрана устройства не поддерживается</span>
				</div>
				<Header element={this.headerElementRef} />
			</React.Fragment>
		);
	}
}

ReactDOM.render(<App />, document.querySelector("main#app-root"));
