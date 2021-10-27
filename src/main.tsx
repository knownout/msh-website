import "normalize.css";
import "./root.less";

import ReactDOM from "react-dom";
import React from "react";
import Header, { Logotype } from "./components/header/header";

import { BrowserRouter as Router, Switch, Route, Redirect } from "react-router-dom";

import "./components/navigation/navigation.less";
import TitlePage from "./pages/title-page/title-page";
import DefaultPage from "./pages/default-page/default-page";
import Footer from "./components/footer/footer";
import CMSRoot from "./cms";

import ScrollArea from "react-scrollbar";

//// __________________________________________________________________________________________________________________________________________
import ReactPaginate from "react-paginate";
import PageWrapper from "./components/page-wrapper";
import { configuration } from "./utils";
import ExceptionPage from "./pages/exception/exception";
import Blocks from "editorjs-blocks-react-renderer";
import MaterialsList from "./cms/forms/control-form/materials-list";
import { OutputBlockData, OutputData } from "@editorjs/editorjs";
//// __________________________________________________________________________________________________________________________________________

import "./pwp.less";

interface I_unstable_PageWithPagination_props {
	height: number;
	onScrollRequest(): void;
}

interface I_unstable_PageWithPagination_state {
	page: number;
	tagsList: { news: string[]; documents: string[] };

	pageLoaded: boolean;
	pageException: boolean;

	materialsList: any;
	total: number;
}

export class UnstablePageWithPagination extends React.Component<
	I_unstable_PageWithPagination_props,
	I_unstable_PageWithPagination_state
> {
	private readonly articlesPerPage = 12;
	state: I_unstable_PageWithPagination_state = {
		page: 0,
		tagsList: { documents: [], news: [] },

		pageException: false,
		pageLoaded: false,
		materialsList: [],
		total: 0
	};

	constructor (props: I_unstable_PageWithPagination_props) {
		super(props);
	}

	private async updateTagsList (
		offsetOverride?: number
	): Promise<{ success: boolean; meta: { documents: []; news: [] } }> {
		const offset = this.state.page * this.articlesPerPage;

		const pageTag = decodeURI(window.location.pathname.split("/").slice(-1)[0]);

		const tagsListForm = new FormData();
		const formData = {
			"Tag-Name": pageTag,
			"Data-Action": "TAGLIST",
			"Materials-Offset": offset,
			"Materials-Count": offsetOverride ? offsetOverride : this.articlesPerPage
		};

		Object.keys(formData).forEach(key => tagsListForm.append(key, (formData as any)[key]));

		return await fetch(configuration.api.server_path + "api/next/materials-worker.php", {
			method: "POST",
			body: tagsListForm
		}).then(res => res.json());
	}

	private async getTotalTagsCount (): Promise<any> {
		const pageTag = decodeURI(window.location.pathname.split("/").slice(-1)[0]);

		const tagsListForm = new FormData();
		const formData = {
			"Tag-Name": pageTag,
			"Data-Action": "TAGLISTLENGTH"
		};

		Object.keys(formData).forEach(key => tagsListForm.append(key, (formData as any)[key]));

		return await fetch(configuration.api.server_path + "api/next/materials-worker.php", {
			method: "POST",
			body: tagsListForm
		}).then(res => res.json());
	}

	private async updateMaterialsContainer (tagsList: { news: []; documents: [] }) {
		const createFormData = (content: { [key: string]: string }) => {
			const data = new FormData();
			Object.keys(content).forEach(key => data.append(key, content[key]));
			return data;
		};

		const newsList = [];
		// console.log(tagsList);

		for await (const uid of tagsList.news) {
			const formData = createFormData({
				"Data-Action": "PREVIEW",
				"Material-UID": uid,
				"Material-Type": "0"
			});

			const materialData = await fetch(configuration.api.server_path + "api/next/materials-worker.php", {
				method: "POST",
				body: formData
			}).then(res => res.json());

			newsList.push(materialData);
		}

		const documentsList = [];
		for await (const uid of tagsList.documents) {
			const formData = createFormData({
				"Data-Action": "PREVIEW",
				"Material-UID": uid,
				"Material-Type": "1"
			});

			const documentData = await fetch(configuration.api.server_path + "api/next/materials-worker.php", {
				method: "POST",
				body: formData
			}).then(res => res.json());

			documentsList.push(documentData);
		}

		return { news: newsList, documents: documentsList };
	}

	async componentDidMount () {
		const tagsList = await this.updateTagsList();
		const total = await this.getTotalTagsCount();

		if (tagsList.success == false || total.success == false) this.setState({ pageException: true });
		else {
			const materialsList = await this.updateMaterialsContainer(tagsList.meta);
			this.setState({ tagsList: tagsList.meta, pageLoaded: true, materialsList, total: total.meta.content });
		}
	}

	private async pageChangeHandler (selectedItem: { selected: number }) {
		if (selectedItem.selected == this.state.page) return;

		// console.log("Init");
		this.props.onScrollRequest();
		this.setState({ pageLoaded: false, page: selectedItem.selected }, async () => {
			// console.log("State set");

			const tagsList = await this.updateTagsList();
			// console.log("tags parsed");

			const materialsList = await this.updateMaterialsContainer(tagsList.meta);
			// console.log("materials parsed");

			this.props.onScrollRequest();
			if (tagsList.success == false) this.setState({ pageException: true });
			else {
				this.setState({ tagsList: tagsList.meta, pageLoaded: true, materialsList });
				// console.log("end");

				this.props.onScrollRequest();
			}
		});
	}

	render () {
		const paginateProps = {
			previousLabel: "Назад",
			nextLabel: "Далее",
			breakLabel: "...",
			marginPagesDisplayed: 2,
			pageRangeDisplayed: 5,
			containerClassName: "pagination",
			activeClassName: "active",
			pageCount: Math.floor(this.state.total / this.articlesPerPage),

			onPageChange: this.pageChangeHandler.bind(this)
		};

		return (
			<PageWrapper
				height={this.props.height}
				loaded={this.state.pageLoaded}
				className="pwp-wrapper"
				exception={this.state.pageException}
			>
				<div className="pwp-page-text">
					<DefaultPage height={0} className="pwp-data-text" />
				</div>
				<div className="pwp-content">
					<div className="pwp-articles-list">
						{this.state.materialsList.news &&
							this.state.materialsList.news.filter((e: any) => e.success == true).map((e: any) => {
								const { preview, text, uid, title } = e.meta;
								return (
									<div
										className="material-content styled-block"
										key={Math.random()}
										onClick={() => {
											// window.location.href = "/" + type + "/" + uid;
											window.open("/news/" + uid, "_blank");
										}}
									>
										{preview && (
											<div
												className="image-bg"
												style={{ backgroundImage: `url("${preview}")` }}
											/>
										)}
										{preview && (
											<div
												className="image-preview"
												style={{ backgroundImage: `url("${preview}")` }}
											/>
										)}
										<div className="content-container">
											<div className="material-title">{title}</div>
											<div className="material-text">
												<Blocks
													data={{
														blocks: [ { type: "paragraph", data: { text } } ],
														time: 0,
														version: "1"
													}}
												/>
											</div>
										</div>
									</div>
								);
							})}
					</div>
					{this.state.total > this.articlesPerPage && (
						<ReactPaginate {...paginateProps} initialPage={this.state.page} />
					)}
				</div>
			</PageWrapper>
		);
	}
}

interface AppState {
	headerHeight: number;
	pageWidth: number;
	isMobileMenu: boolean;
}
interface AppProps {}
class App extends React.Component<AppProps, AppState> {
	public readonly state: AppState = {
		headerHeight: 0,
		pageWidth: 0,
		isMobileMenu: false
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

	private setMobileMenuState (state: boolean) {
		this.setState({ isMobileMenu: state });
	}

	public render () {
		const height = window.innerHeight - this.state.headerHeight;
		const scrollRequest = () =>
			this.scrollableElementRef.current &&
			this.scrollableElementRef.current.scrollTo({ top: 0, behavior: "smooth" });

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
						<div
							id="page-data-container"
							ref={this.scrollableElementRef}
							data-mobile-menu={this.state.isMobileMenu.toString()}
						>
							<Header
								element={this.headerElementRef}
								setMobileMenuState={this.setMobileMenuState.bind(this)}
							/>
							<Switch>
								<Route exact path="/">
									<TitlePage height={height} />
								</Route>
								<Route exact path="/pages/testPage">
									<UnstablePageWithPagination
										height={height}
										onScrollRequest={scrollRequest.bind(this)}
									/>
								</Route>
								<Route exact path="/pages/информация_новости">
									<UnstablePageWithPagination
										height={height}
										onScrollRequest={scrollRequest.bind(this)}
									/>
								</Route>
								<Route exact path="/pages/контакты_горячие-линии">
									<Redirect to="/pages/горячие_линии" />
								</Route>
								<Route exact path="/pages/информация_новости_вакансии">
									<UnstablePageWithPagination
										height={height}
										onScrollRequest={scrollRequest.bind(this)}
									/>
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
