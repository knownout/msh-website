import React from "react";
import EditorInstance from "../editor-js";
import { Editor } from "../editor-page";

import EditorJS from "@editorjs/editorjs";

export namespace MaterialEditor {
	export interface IProps {
		updateMaterial(material: Partial<Editor.IMaterialData>): void;

		updateEditorInstance(instance: EditorJS | undefined): void;

		onReady?(): void;
		onInit?(): void;
	}

	export interface IState {}
}

export default class MaterialEditor extends React.PureComponent<MaterialEditor.IProps, MaterialEditor.IState> {
	state: MaterialEditor.IState = {};

	private readonly editorReadyHandler = () => {
		if (this.props.onReady) this.props.onReady();
	};

	private editor = new EditorInstance({ onReady: this.editorReadyHandler }).createInstance();

	constructor (props: MaterialEditor.IProps) {
		super(props);

		// this.editorChangeHandler = this.editorChangeHandler.bind(this);
		this.editorReadyHandler = this.editorReadyHandler.bind(this);
		if (props.onInit) props.onInit();
	}

	componentDidMount () {
		this.props.updateEditorInstance(this.editor);
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
					clean = input.value
						.replace(/[^A-Za-z0-9а-яёА-ЯЁ .,]/g, "")
						.replace(/\s{2,}/g, " ")
						.replace(/\.{2,}/g, ".")
						.replace(/\,{2,}/g, ",")
						.replace(/\,\./g, ".")
						.replace(/\.\,/g, ".")
						.replace(/\s\./g, ".")
						.replace(/\s\,/g, ",")
						.replace(/\,([^\s])/g, ", $1")
						.replace(/\.([^\s])/g, ". $1")
						.replace(/\s{2,}/g, " ")
						.replace(/\.\s([a-zа-яё])/g, (_, l) => `. ` + String(l).toLocaleUpperCase())
						.trimLeft();

				let output = clean.trim();
				if (output.slice(-1) == ".") output = output.slice(0, -1);

				this.props.updateMaterial({ title: output });

				let pos = input.selectionStart as number;
				if (input.value < clean) pos = pos - 1;

				input.value = clean;
				input.setSelectionRange(pos, pos);
			}
		};

		return (
			<div className="section editor-container content-block column styled-block no-centering">
				<span className="title">Редактор материала</span>
				<input type="text" {...inputAttributes} />
				<div id="editorjs-holder" />
			</div>
		);
	}
}
