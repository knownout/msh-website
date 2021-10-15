import React from "react";
import EditorInstance from "../editor-js";
import { Editor } from "../editor-page";

import EditorJS, { OutputData } from "@editorjs/editorjs";
import { filterTitleInput } from "../../../..";
import MaterialsList from "../../materials-list";

export namespace MaterialEditor {
	export interface IProps {
		updateMaterial(material: Partial<Editor.IMaterialData>): void;

		updateEditorInstance(instance: EditorJS | undefined): void;

		onReady?(): void;
		onInit?(): void;

		editorData?: MaterialsList.IArticleRequestResult;
	}

	export interface IState {}
}

export default class MaterialEditor extends React.PureComponent<MaterialEditor.IProps, MaterialEditor.IState> {
	state: MaterialEditor.IState = {};

	private readonly editorReadyHandler = () => {
		if (this.props.onReady) this.props.onReady();
	};

	private editor?: EditorJS;

	constructor (props: MaterialEditor.IProps) {
		super(props);

		const { title, ...outputData } = props.editorData as MaterialsList.IArticleRequestResult;

		this.editor = new EditorInstance(
			{ onReady: this.editorReadyHandler },
			{ blocks: outputData.blocks, time: 0, version: "0" }
		).createInstance();

		// this.editorChangeHandler = this.editorChangeHandler.bind(this);
		this.editorReadyHandler = this.editorReadyHandler.bind(this);
		if (props.onInit) props.onInit();
	}

	componentDidMount () {
		this.props.updateEditorInstance(this.editor);
		if (this.props.editorData && this.props.editorData.title.length > 3)
			this.props.updateMaterial({ title: this.props.editorData.title });
	}

	componentWillUnmount () {
		this.props.updateEditorInstance(undefined);
	}

	render () {
		const inputAttributes = {
			className: "article-title",
			placeholder: "Заголовок материала",

			onInput: (event: React.KeyboardEvent<HTMLInputElement>) => {
				const input = event.target as HTMLInputElement,
					clean = filterTitleInput(input.value);

				let output = clean.trim();
				if (output.slice(-1) == ".") output = output.slice(0, -1);

				this.props.updateMaterial({ title: output });

				let pos = input.selectionStart as number;
				if (input.value < clean) pos = pos - 1;

				input.value = clean;
				input.setSelectionRange(pos, pos);
			}
		};

		// if (this.props.editorData && this.props.editorData.title.length > 3)
		// 	this.props.updateMaterial({ title: this.props.editorData.title });

		return (
			<div className="section editor-container content-block column styled-block no-centering">
				<span className="title">Редактор материала</span>
				<input
					type="text"
					defaultValue={this.props.editorData ? this.props.editorData.title : ""}
					{...inputAttributes}
				/>
				<div id="editorjs-holder" />
			</div>
		);
	}
}
