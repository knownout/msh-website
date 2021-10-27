import React from "react";
import { Link } from "react-router-dom";
import PageWrapper from "../../components/page-wrapper";
import ScrollMenu from "../../components/scroll-menu";
import { configuration } from "../../utils";
import { getTextTime } from "../../utils";
import ExceptionPage from "../exception/exception";
import Blocks, { DataProp } from "editorjs-blocks-react-renderer";

import "./title-page.less";

type TArticle = { meta: { content: { [key: string]: any }; preview?: string }; success: boolean };

interface ITitlePageProps {
	height: number;
}

interface ITitlePageState {
	loaded: boolean;
	exception: boolean;

	mainPageData: { [key: string]: any };
	mainArticleData: { [key: string]: any };

	mainInfoContent: { [key: string]: any };

	articlesList: TArticle[];
}

export default class TitlePage extends React.Component<ITitlePageProps, ITitlePageState> {
	public readonly state: ITitlePageState = {
		loaded: false,
		exception: false,

		mainArticleData: {},
		mainPageData: {},
		mainInfoContent: {},

		articlesList: []
	};

	constructor (props: ITitlePageProps) {
		super(props);
	}

	async componentDidMount () {
		this.setState({
			mainPageData: await fetch(configuration.api.server_path + configuration.api.fetch_title_page).then(req =>
				req.json()
			)
		});

		if (this.state.mainPageData.success == false) this.setState({ exception: true });
		else {
			const mainArticleName = this.state.mainPageData.meta.main_article;
			const mainArticle = await fetch(
				configuration.api.server_path + configuration.api.get_articles + mainArticleName
			).then(req => req.json());

			if (mainArticle.success == false) this.setState({ exception: true });
			else {
				const date: number = mainArticle.meta.content.time;
				const title: string = mainArticle.meta.content.title;
				const preview: string = mainArticle.meta.preview;

				const articlesList = this.state.mainPageData.meta.articles;
				const fetchedArticlesList = [] as TArticle[];

				for await (const article of articlesList) {
					const articleData = await fetch(
						configuration.api.server_path + configuration.api.get_articles + article
					).then(res => res.json());

					fetchedArticlesList.push(articleData);
				}

				this.setState({
					mainArticleData: { date, title, preview },
					articlesList: fetchedArticlesList
				});
			}

			const mainInfo = await fetch(
				configuration.api.server_path + configuration.api.get_info_content + this.state.mainPageData.meta.info
			).then(req => req.json());

			if (mainInfo.success == false) this.setState({ exception: true });
			else {
				this.setState({ mainInfoContent: mainInfo.meta, loaded: true });
			}
		}
	}

	public render () {
		if (this.state.exception) {
			return (
				<PageWrapper {...this.props} loaded={true}>
					<ExceptionPage exception={500} />
				</PageWrapper>
			);
		}

		let articlesList = this.state.articlesList;
		articlesList = articlesList.filter(e => e.meta.content.blocks.length > 0);

		const bgImage = { backgroundImage: `url("${this.state.mainArticleData.preview}")` } as React.CSSProperties;
		const articlesListPreviewText = articlesList
			.map(e => {
				try {
					const block = e.meta.content.blocks.filter((i: any) => i.type == "paragraph")[0];
					if (!block) return null;
					return { blocks: [ block ] } as DataProp;
				} catch (e) {
					return null;
				}
			})
			.filter(e => e !== null) as any;

		return (
			<PageWrapper {...this.props} loaded={this.state.loaded} id="title-page" exception={this.state.exception}>
				{this.state.loaded && (
					<React.Fragment>
						<div className="content-block row main-article-wrapper">
							<div className="bg-image" style={bgImage} />
							<div className="content-block row limited">
								<div className="content-block row" id="main-article" style={bgImage}>
									<a className="ddt" href={"news/" + this.state.mainPageData.meta.main_article}>
										<div className="content-block column text-content">
											<span className="date">{getTextTime(this.state.mainArticleData.date)}</span>
											<span className="title">{this.state.mainArticleData.title}</span>
										</div>
									</a>
								</div>
								<div className="content-block column" id="main-document">
									<span className="block-title">Важная информация</span>
									<div className="block-content">
										<Blocks data={this.state.mainInfoContent.content} />
									</div>
								</div>
							</div>
						</div>
						<div className="content-block row" id="latest-articles">
							<ScrollMenu childrenWidth={344}>
								{articlesList.map((e, i) => {
									if (articlesListPreviewText[i])
										return (
											<a
												className="ddt"
												href={"news/" + this.state.mainPageData.meta.articles[i]}
												key={Math.random()}
											>
												<div
													className="article content-block column"
													data-bg={!!e.meta.preview}
												>
													{e.meta.preview && (
														<div
															className="bg-image"
															style={{ backgroundImage: `url(${e.meta.preview})` }}
														/>
													)}

													<div className="content">
														{<Blocks data={articlesListPreviewText[i]} />}
													</div>

													<span className="date">
														{getTextTime(e.meta.content.time as number)}
													</span>
													<span className="title">{e.meta.content.title}</span>
												</div>
											</a>
										);
									else return null;
								})}
							</ScrollMenu>
							<div className="button-wrapper">
								<a className="ddt" href="/pages/информация_новости">
									<div className="button">Архив новостей</div>
								</a>
							</div>
						</div>
					</React.Fragment>
				)}
			</PageWrapper>
		);
	}
}
