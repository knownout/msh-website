import "normalize.css";
import "./root.less";

import ReactDOM from "react-dom";
import React from "react";
import Header, { Logotype } from "./components/header/header";

import { BrowserRouter as Router, Switch, Route } from "react-router-dom";

import "./components/navigation/navigation.less";
import TitlePage from "./pages/title-page/title-page";
import DefaultPage from "./pages/default-page/default-page";
import Footer from "./components/footer/footer";
import CMSRoot from "./cms";

interface AppState {
	headerHeight: number;
	pageWidth: number;
}
interface AppProps {}
class App extends React.Component<AppProps, AppState> {
	public readonly state: AppState = {
		headerHeight: 0,
		pageWidth: 0
	};
	constructor (props: AppProps) {
		super(props);

		this.handleWindowResize = this.handleWindowResize.bind(this);
	}

	private readonly scrollableElementRef = React.createRef<HTMLDivElement>();
	private readonly headerElementRef = React.createRef<HTMLDivElement>();

	private wheelEventHandler (event: WheelEvent) {
		const elementUnderCursor = document.elementFromPoint(event.clientX, event.clientY);
		const menu = (elementUnderCursor as Element).closest("div.scroll-menu");

		if (menu) {
			if (!menu.scrollLeft && event.deltaY < 0) return true;
			if (
				menu.scrollLeft < menu.scrollWidth - menu.clientWidth ||
				(menu.scrollLeft < menu.scrollWidth && event.deltaY < 0)
			) {
				event.preventDefault();
				return false;
			}
		}

		return true;
	}

	private handleWindowResize () {
		setTimeout(() => {
			if (!this.headerElementRef.current) return;

			const height = this.headerElementRef.current.offsetHeight;
			this.setState({ headerHeight: height, pageWidth: window.innerWidth });
		});
	}

	componentDidMount () {
		window.addEventListener("resize", this.handleWindowResize);
		this.handleWindowResize();

		if (this.scrollableElementRef.current)
			this.scrollableElementRef.current.addEventListener("wheel", this.wheelEventHandler, { passive: false });
	}

	public render () {
		const height = window.innerHeight - this.state.headerHeight;

		return (
			<Router>
				<Switch>
					<Route exact path="/admin-panel">
						{/* <CMS /> */}
						<CMSRoot />
					</Route>
					<Route path="*">
						<div className="screen-size-locker">
							<span className="text">Разрешение экрана устройства не поддерживается</span>
						</div>
						<Header element={this.headerElementRef} />

						<div id="page-data-container" style={{ height }} ref={this.scrollableElementRef}>
							<Switch>
								<Route exact path="/">
									<TitlePage height={height} />
								</Route>
								<Route path="*">
									<DefaultPage height={height} />
								</Route>
							</Switch>
							<Footer>
								<Logotype width={this.state.pageWidth} />
							</Footer>
						</div>
					</Route>
				</Switch>
			</Router>
		);
	}
}

ReactDOM.render(<App />, document.querySelector("main#app-root"));
