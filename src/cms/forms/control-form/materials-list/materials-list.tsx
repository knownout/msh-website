import React from "react";
import { TAccountData } from "../../..";
import { configuration, getTextTime } from "../../../../utils";
import { ArticleType } from "../editor-page";

import ScrollArea from "react-scrollbar";
import "./materials-list.less";

import EditorJS from "@editorjs/editorjs";
import Blocks from "editorjs-blocks-react-renderer";
import Dropdown from "../../../components/dropdown";

namespace MaterialsList {
	export interface IState {
		materialType: ArticleType;
		page: number;

		materialsList: IArticleContentRequestResult[];
	}

	export interface IProps {
		accountContext: TAccountData;
	}

	export type TRequestFalseResult = { reason: string };
	export type TRequestResult = {
		success: boolean;
		meta: Partial<TRequestFalseResult> & { content?: string; [key: string]: any };
	};

	export interface IArticleRequestResult {
		blocks: EditorJS.OutputBlockData<string, any>[];
		time: string;
		title: string;
	}

	export interface IArticleContentRequestResult {
		preview: string;
		uid: string;
		content: IArticleRequestResult;
	}
}

export class MaterialsList extends React.Component<MaterialsList.IProps, MaterialsList.IState> {
	private readonly materialsPerPage: number = 12;
	private readonly materialsWorkerPath = configuration.api.server_path + "api/next/materials-worker.php";

	state: MaterialsList.IState = { materialType: ArticleType.Article, page: 0, materialsList: [] };

	constructor (props: MaterialsList.IProps) {
		super(props);
	}

	private makeFormData (data: { [key: string]: any }) {
		const form = new FormData();
		let formData = Object.assign(data, {
			"User-Login": this.props.accountContext.login,
			"User-Token": this.props.accountContext.token,

			"Material-Type": this.state.materialType
		});

		Object.keys(formData).forEach(key => form.append(key, String(formData[key])));
		return form;
	}

	private async fetchAPIContent (formData: FormData) {
		const requestAttributes = { method: "POST", body: formData },
			content = (await fetch(this.materialsWorkerPath, requestAttributes).then(req =>
				req.json()
			)) as MaterialsList.TRequestResult;

		return content;
	}

	private async fetchMaterialsList () {
		const formData = this.makeFormData({
			"Data-Action": "GET",

			"Materials-Offset": this.materialsPerPage * this.state.page,
			"Materials-Count": this.materialsPerPage
		});

		const materialsUIDList = await (await this.fetchAPIContent(formData)).meta;
		const materialsList = [];

		for await (const uid of materialsUIDList.deferred) materialsList.push(await this.readMaterialData(uid));
		for await (const uid of materialsUIDList.current) materialsList.push(await this.readMaterialData(uid));

		console.log(materialsUIDList);

		return (materialsList as any) as MaterialsList.IArticleContentRequestResult[];
	}

	private async readMaterialData (materialUID: string) {
		const formData = this.makeFormData({
			"Data-Action": "MATERIAL",
			"Material-UID": materialUID
		});

		return (await this.fetchAPIContent(formData)).meta;
	}

	async componentDidMount () {
		this.setState({ materialsList: await this.fetchMaterialsList() });
	}

	render () {
		console.log(this.state.materialsList);
		function Material (props: MaterialsList.IArticleContentRequestResult) {
			const bgImage = { backgroundImage: `url(${props.preview})` } as React.CSSProperties;

			return (
				<div className="content-block row no-centering material gap-10 nowrap">
					{props.preview && <div className="preview-image" style={bgImage} />}

					<div className="material-context styled-block content-block column no-centering nowrap">
						<span
							className="publish-date"
							data-deferred={String(new Date(props.content.time).getTime() > Date.now())}
						>
							{getTextTime(new Date(props.content.time))}
						</span>
						<span className="material-title">{props.content.title}</span>
						<div className="material-description">
							<Blocks
								data={{
									time: 0,
									version: "0",
									blocks: [ props.content.blocks.filter(e => e.type == "paragraph")[0] ]
								}}
							/>
						</div>
						<div className="material-buttons-holder content-block row nowrap gap-10">
							<div className="button">Удалить</div>
							<div className="button">Редактировать</div>
							<div className="button">Открыть</div>
						</div>
					</div>
				</div>
			);
		}

		return (
			<div className="content-container content-block row no-centering gap-10 nowrap" id="content-list">
				<ScrollArea smoothScrolling={true}>
					<div className="materials-wrapper">
						{this.state.materialsList.map(material => {
							return <Material {...material} key={Math.random()} />;
						})}
					</div>
				</ScrollArea>
				<div className="data-controls styled-block content-block column nowrap">
					<span className="data-title">Тип отображаемых материалов</span>
					<Dropdown select={0}>
						<Dropdown.Item>Новости</Dropdown.Item>
						<Dropdown.Item>Документы</Dropdown.Item>
						<Dropdown.Item>Страницы</Dropdown.Item>
					</Dropdown>

					<div className="hint">
						Тип отображаемых материалов влияет на то, какие материалы будут отображены на этой странице
						(Документы, Страницы или Новости)
					</div>
				</div>
			</div>
		);
	}
}
