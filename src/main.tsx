import "normalize.css";
import "./root.less";

import ReactDOM from "react-dom";
import React from "react";
import Header from "./components/header/header";

import { BrowserRouter as Router, Switch, Route } from "react-router-dom";

import "./components/navigation/navigation.less";
import TitlePage from "./pages/title/title";
import NotMatchPage from "./pages/not-match/not-match";

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

	private handleWindowResize () {
		setTimeout(() => {
			if (!this.headerElementRef.current) return;

			const height = this.headerElementRef.current.offsetHeight;
			this.setState({ headerHeight: height });
		});
	}

	componentDidMount () {
		window.addEventListener("resize", this.handleWindowResize);
		this.handleWindowResize();
	}

	public render () {
		const height = window.innerHeight - this.state.headerHeight;

		return (
			<Router>
				<div className="screen-size-locker">
					<span className="text">Разрешение экрана устройства не поддерживается</span>
				</div>
				<Header element={this.headerElementRef} />

				<div id="page-data-container" style={{ height }}>
					<Switch>
						<Route exact path="/">
							<TitlePage />
						</Route>
						<Route path="/документы/правовые-акты/общее-направление/законы">Hello world</Route>
						<Route path="*">
							<NotMatchPage />
						</Route>
					</Switch>
				</div>
			</Router>
		);
	}
}

ReactDOM.render(<App />, document.querySelector("main#app-root"));
