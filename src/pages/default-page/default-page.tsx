import React from "react";
import Blocks, { DataProp } from "editorjs-blocks-react-renderer";

import "./default-page.less";
import { configuration, DefaultServerURL } from "../../utils/configuration";
import NotMatchPage from "../not-match/not-match";

interface IDefaultPageProps {
	height: number;
}
interface IDefaultPageState {
	contentLoaded: boolean;
	pageCentered: boolean;
}
export default class DefaultPage extends React.Component<IDefaultPageProps, IDefaultPageState> {
	public readonly state: IDefaultPageState = {
		contentLoaded: false,
		pageCentered: false
	};

	constructor (props: IDefaultPageProps) {
		super(props);

		this.setPageCentring = this.setPageCentring.bind(this);
	}

	protected pageContent: DataProp | null = null;
	protected readonly pageBlocksRendererRef = React.createRef<HTMLDivElement>();
	protected readonly pageContainerRef = React.createRef<HTMLDivElement>();

	protected setPageCentring () {
		const target = this.pageBlocksRendererRef.current;
		const page = this.pageContainerRef.current;

		if (!target || !page) return;
		const maxHeight = (page.parentElement as HTMLElement).offsetHeight,
			condition = maxHeight - 40 - target.offsetHeight > 0;

		if (this.state.pageCentered != condition) this.setState({ pageCentered: condition });
	}

	async componentDidMount () {
		const location = window.location.pathname;
		const pageContent: DataProp = await fetch(DefaultServerURL + `api/articles.php?action=get&path=` + location)
			.then(req => req.json())
			.catch(() => {
				this.setState({ contentLoaded: true });
			});

		if (!pageContent) return;
		this.pageContent = pageContent;
		this.setState({ contentLoaded: true }, this.setPageCentring);

		window.addEventListener("resize", this.setPageCentring);
		setTimeout(this.setPageCentring, 50);
	}

	componentDidUpdate () {
		this.setPageCentring();
	}

	componentWillUnmount () {
		window.removeEventListener("resize", this.setPageCentring);
	}

	private getTextTime (timestamp: number) {
		const date = new Date(timestamp);
		let monthName = configuration.monthsName[date.getMonth()];

		let lastCharacter = monthName.slice(-1);
		monthName = monthName.slice(0, -1);

		if (lastCharacter == "т") lastCharacter = "а";
		else lastCharacter = "я";

		monthName = monthName + lastCharacter;

		return `${date.getDay()} ${monthName} ${date.getFullYear()}`;
	}

	public render () {
		return (
			<div
				className="page-wrapper"
				data-centered={this.state.pageCentered}
				ref={this.pageContainerRef}
				style={{ minHeight: this.props.height }}
			>
				<div className="page-content" ref={this.pageBlocksRendererRef}>
					{this.state.contentLoaded ? this.pageContent ? (
						<React.Fragment>
							{this.pageContent.time && (
								<div className="article-date">{this.getTextTime(this.pageContent.time)}</div>
							)}
							<Blocks data={this.pageContent} />
						</React.Fragment>
					) : (
						<NotMatchPage />
					) : (
						<span>Загрузка...</span>
					)}
				</div>
			</div>
		);
	}
}
