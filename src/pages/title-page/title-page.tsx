import React from "react";
import { Link } from "react-router-dom";
import PageWrapper from "../../components/page-wrapper";
import ScrollMenu from "../../components/scroll-menu";
import { configuration } from "../../utils";
import { getTextTime } from "../../utils";
import ExceptionPage from "../exception/exception";

import "./title-page.less";

interface ITitlePageProps {
	height: number;
}

interface ITitlePageState {
	loaded: boolean;
	exception: boolean;

	mainPageData: { [key: string]: any };
	mainArticleData: { [key: string]: any };
}

export default class TitlePage extends React.Component<ITitlePageProps, ITitlePageState> {
	public readonly state: ITitlePageState = {
		loaded: false,
		exception: false,

		mainArticleData: {},
		mainPageData: {}
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
				for await (const article of articlesList) {
					const articleData = await fetch(
						configuration.api.server_path + configuration.api.get_articles + article
					).then(res => res.json());

					console.log(articleData); //TODO
				}

				this.setState({ mainArticleData: { date, title, preview }, loaded: true });
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

		const bgImage = { backgroundImage: `url("${this.state.mainArticleData.preview}")` } as React.CSSProperties;
		return (
			<PageWrapper {...this.props} loaded={this.state.loaded} id="title-page" exception={this.state.exception}>
				{this.state.loaded && (
					<React.Fragment>
						<div className="content-block row main-article-wrapper">
							<div className="bg-image" style={bgImage} />
							<div className="content-block row limited">
								<div className="content-block row" id="main-article" style={bgImage}>
									<div className="content-block column text-content">
										<span className="date">{getTextTime(this.state.mainArticleData.date)}</span>
										<span className="title">{this.state.mainArticleData.title}</span>
									</div>
								</div>
								<div className="content-block column" id="main-document">
									<span className="block-title">Важная информация</span>
									<div className="block-content">
										На период введения ограничительных мероприятий (карантина) по предотвращению
										распространения коронавирусной инфекции COVID-19 в Министерстве сельского
										хозяйства и природных ресурсов Приднестровской Молдавской Республики ограничен
										прием граждан. На период введения ограничительных мероприятий (карантина) по
										предотвращению распространения коронавирусной инфекции COVID-19 в Министерстве
										сельского хозяйства и природных ресурсов Приднестровской Молдавской Республики
										ограничен прием граждан.
									</div>
								</div>
							</div>
						</div>
						<div className="content-block row" id="latest-articles">
							<ScrollMenu />
						</div>
					</React.Fragment>
				)}
			</PageWrapper>
		);
	}
}
