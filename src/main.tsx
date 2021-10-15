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
						<ScrollArea>
							<div id="page-data-container" ref={this.scrollableElementRef}>
								<Header element={this.headerElementRef} />
								<Switch>
									<Route exact path="/">
										<TitlePage height={height} />
									</Route>
									<Route exact path="/pages/testPage">
										<PageWithPagination height={height} />
									</Route>
									<Route path="*">
										<DefaultPage height={height} />
									</Route>
								</Switch>
								<Footer>
									<Logotype width={this.state.pageWidth} />
								</Footer>
							</div>
						</ScrollArea>
					</Route>
				</Switch>
			</Router>
		);
	}
}

interface IPageWithPaginationProps {
	height: number;
}
interface IPageWithPaginationState {
	contentLoaded: boolean;
	pageException: boolean;
	pageContent: { [key: string]: any };

	materialsList: [OutputData, string, string, string | null][];
	pagesCount: number;
	selectedPage: number;
}

class PageWithPagination extends React.PureComponent<IPageWithPaginationProps, IPageWithPaginationState> {
	state: IPageWithPaginationState = {
		contentLoaded: false,
		pageException: false,
		pageContent: {},
		materialsList: [],
		pagesCount: 1,
		selectedPage: 0
	};
	constructor (props: IPageWithPaginationProps) {
		super(props);
	}

	private readonly materialsWorkerPath = configuration.api.server_path + "api/next/materials-worker.php";
	private makeFormData (data: { [key: string]: any }) {
		const form = new FormData();
		let formData = Object.assign(data, {});

		Object.keys(formData).forEach(key => form.append(key, String(formData[key])));
		return form;
	}

	private async fetchAPIContent (formData: FormData) {
		const requestAttributes = { method: "POST", body: formData };
		const content = (await fetch(this.materialsWorkerPath, requestAttributes).then(req => req.text())) as string;

		// console.log(content);
		return JSON.parse(content) as any;
	}

	private async readMaterialData (materialUID: string, type: string) {
		const formData = this.makeFormData({
			"Data-Action": "MATERIAL",
			"Material-UID": materialUID,
			"Material-Type": type
		});

		return (await this.fetchAPIContent(formData)).meta;
	}

	private perPage = 8;
	async componentDidMount () {
		const pageTag = window.location.pathname.split("/").slice(-1)[0];
		const location = window.location.pathname;
		const articlePath = location.split("/").filter(e => e.length > 1).slice(1).join("/"),
			articleType = location.split("/").filter(e => e.length > 1)[0];

		const pageContent = await fetch(
			configuration.api.server_path + configuration.api.get_articles + articlePath + "&type=" + articleType
		)
			.then(req => req.json())
			.catch(() => {
				this.setState({ pageException: true });
			});

		const tagList = await fetch(configuration.api.server_path + "api/next/materials-worker.php", {
			method: "POST",
			body: this.makeFormData({
				"Tag-Name": pageTag,
				"Data-Action": "TAGLIST"
			})
		}).then(res => res.json());

		if (tagList.success == true) {
			const { news, documents } = tagList.meta.content as { [key: string]: string[] };

			let totalMaterialsList: any[] = [];
			for await (const uid of documents) {
				totalMaterialsList.push([ await this.readMaterialData(uid, "1"), "documents" ]);
			}

			for await (const uid of news) {
				totalMaterialsList.push([ await this.readMaterialData(uid, "0"), "news" ]);
			}
			totalMaterialsList = totalMaterialsList
				.filter(e => Boolean(e[0].content))
				.map(e => [ e[0].content, e[0].uid, e[1], e[0].preview ]) as [
				OutputData,
				string,
				string,
				string | null
			][];

			const pagesCount = Math.floor(totalMaterialsList.length / this.perPage);
			// totalMaterialsList = totalMaterialsList.slice(
			// 	this.state.selectedPage * this.perPage,
			// 	this.state.selectedPage * this.perPage + this.perPage
			// );

			this.setState({ materialsList: totalMaterialsList, pagesCount: pagesCount || 1 });
		}

		if (pageContent.success == false || tagList.success == false) {
			if (pageContent.meta.reason == "404 Not found") {
				this.setState({ contentLoaded: true });
			} else this.setState({ pageException: true });
		} else this.setState({ pageContent, contentLoaded: true });
	}

	render () {
		const pageWrapperAttributes = {
			loaded: this.state.contentLoaded,
			height: this.props.height,
			exception: this.state.pageException
		};

		let formattedPageTag = window.location.pathname.split("/").slice(-1)[0].replace(/\-/g, " ");
		formattedPageTag = formattedPageTag[0].toLocaleUpperCase() + formattedPageTag.slice(1);
		console.log(formattedPageTag);

		return (
			<PageWrapper {...pageWrapperAttributes}>
				{Object.keys(this.state.pageContent).length > 0 ? (
					<div className="page-with-pagination">
						<Blocks data={this.state.pageContent.meta.content} />
						<div className="tagged-articles-list">
							<div className="materials-area content-block column no-centering nowrap gap-10">
								{this.state.materialsList
									.slice(
										this.state.selectedPage * this.perPage,
										this.state.selectedPage * this.perPage + this.perPage
									)
									.map(material => {
										const [ content, uid, type, preview ] = material;

										let paragraph: OutputBlockData<string, any> | null = null;
										if (content.blocks.length > 0) {
											paragraph = content.blocks.filter(e => e.type == "paragraph")[0];
										} else return null;

										return (
											<div
												className="material-content styled-block"
												key={Math.random()}
												onClick={() => {
													window.location.href = "/" + type + "/" + uid;
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
													<div className="material-title">{(content as any).title}</div>
													<div className="material-text">
														<Blocks
															data={{ blocks: [ paragraph ], time: 0, version: "1" }}
														/>
													</div>
												</div>
											</div>
										);
									})}
							</div>

							<div className="pagination-area" data-disabled={String(!this.state.contentLoaded)}>
								<ReactPaginate
									previousLabel={"Назад"}
									nextLabel={"Далее"}
									breakLabel={"..."}
									breakClassName={"break-me"}
									pageCount={this.state.pagesCount}
									marginPagesDisplayed={2}
									pageRangeDisplayed={5}
									onPageChange={data => {
										this.setState({ selectedPage: data.selected });
									}}
									containerClassName={"pagination"}
									activeClassName={"active"}
								/>
							</div>
						</div>
					</div>
				) : (
					<ExceptionPage exception={404} />
				)}
			</PageWrapper>
		);
	}
}

ReactDOM.render(<App />, document.querySelector("main#app-root"));
