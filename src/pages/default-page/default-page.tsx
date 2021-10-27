import React from "react";
import Blocks, { DataProp } from "editorjs-blocks-react-renderer";

import "./default-page.less";
import { configuration } from "../../utils";
import ExceptionPage from "../exception/exception";
import { getTextTime } from "../../utils";
import PageWrapper from "../../components/page-wrapper";

import fileSize from "filesize";

interface IDefaultPageProps {
	height: number;
	className?: string;
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
		const articlePath = location.split("/").filter(e => e.length > 1).slice(1).join("/"),
			articleType = location.split("/").filter(e => e.length > 1)[0];

		const pageContent = await fetch(
			configuration.api.server_path + configuration.api.get_articles + articlePath + "&type=" + articleType
		)
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
		try {
			document.title = this.state.pageContent.meta.content.title;
			console.log(this.state.pageContent.meta.content);
		} catch (e) {}

		const extensionNameMatch = {
			doc: [ "word", "Документ Microsoft Word" ],
			docx: [ "word", "Документ Microsoft Word" ],
			pptx: [ "powerpoint", "Документ Microsoft PowerPoint" ],
			ppt: [ "powerpoint", "Документ Microsoft PowerPoint" ],
			xls: [ "excel", "Документ Microsoft Excel" ],
			xlsx: [ "excel", "Документ Microsoft Excel" ],
			txt: [ "text", "Текстовый файл" ],
			ini: [ "text", "Файл конфигурации" ],
			md: [ "text", "Файл описания" ],
			zip: [ "zip", "Архив формата ZIP" ],
			rar: [ "rar", "Архив формата RAR" ]
		} as any;

		const Attaches: any = ({ data }: { data: any }) => {
			const key = data.file.extension in extensionNameMatch ? extensionNameMatch[data.file.extension] : null;
			return (
				<a href={data.file.url} className="file-attachment-link">
					<div className="file-attachment content-block row no-centering">
						{key && (
							<div className="attach-icon">
								<img src={`http://192.168.100.170/public/file-icons/${key[0]}.png`} alt="" />
							</div>
						)}
						<div className="attach-data content-block column">
							<div className="file-title">{data.title}</div>
							<div className="file-type">
								{key ? key[1] : "Файл"} (.{data.file.extension})
							</div>
							<div className="file-size">{fileSize(data.file.size, { base: 2 })}</div>
						</div>
						<div className="download-icon">
							<img src="http://192.168.100.170/public/file-icons/download.png" alt="" />
						</div>
					</div>
				</a>
			);
		};

		const Warning: any = ({ data }: { data: any }) => {
			return (
				<div className="notification">
					<div className="title">{data.title}</div>
					<div className="message">{data.message}</div>
				</div>
			);
		};

		const type = window.location.href.split("/").slice(3, -1)[0];
		return (
			<PageWrapper
				{...this.props}
				loaded={this.state.contentLoaded}
				exception={this.state.pageException}
				className={this.props.className}
			>
				{Object.keys(this.state.pageContent).length > 0 ? (
					<React.Fragment>
						{this.state.pageContent.meta.content.time &&
						type != "pages" && (
							<div className="article-date">{getTextTime(this.state.pageContent.meta.content.time)}</div>
						)}
						<Blocks
							data={this.state.pageContent.meta.content}
							renderers={{ attaches: Attaches, warning: Warning }}
						/>
					</React.Fragment>
				) : (
					<ExceptionPage exception={404} />
				)}
			</PageWrapper>
		);
	}
}
