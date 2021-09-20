import React from "react";
import Blocks, { DataProp } from "editorjs-blocks-react-renderer";

import "./default-page.less";
import { configuration } from "../../utils";
import ExceptionPage from "../exception/exception";
import { getTextTime } from "../../utils";
import PageWrapper from "../../components/page-wrapper";

interface IDefaultPageProps {
	height: number;
}
interface IDefaultPageState {
	contentLoaded: boolean;
	pageContent: { [key: string]: any };
	pageException: boolean;
}
export default class DefaultPage extends React.Component<IDefaultPageProps, IDefaultPageState> {
	public readonly state: IDefaultPageState = {
		contentLoaded: false,
		pageContent: {},
		pageException: false
	};

	constructor (props: IDefaultPageProps) {
		super(props);
	}

	protected readonly pageBlocksRendererRef = React.createRef<HTMLDivElement>();
	protected readonly pageContainerRef = React.createRef<HTMLDivElement>();

	async componentDidMount () {
		const location = window.location.pathname;
		const pageContent = await fetch(configuration.api.server_path + configuration.api.get_articles + location)
			.then(req => req.json())
			.catch(() => {
				this.setState({ pageException: true });
			});

		if (pageContent.success == false) {
			if (pageContent.meta.reason == "404 Not found") {
				this.setState({ contentLoaded: true });
			} else this.setState({ pageException: true });
		} else this.setState({ pageContent, contentLoaded: true });
	}

	public render () {
		return (
			<PageWrapper {...this.props} loaded={this.state.contentLoaded} exception={this.state.pageException}>
				{Object.keys(this.state.pageContent).length > 0 ? (
					<React.Fragment>
						{this.state.pageContent.meta.content.time && (
							<div className="article-date">{getTextTime(this.state.pageContent.meta.content.time)}</div>
						)}
						<Blocks data={this.state.pageContent.meta.content} />
					</React.Fragment>
				) : (
					<ExceptionPage exception={404} />
				)}
			</PageWrapper>
		);
	}
}
