import React from "react";
import EditorInstance from "../editor-js";

export namespace MaterialEditor {
	export interface IProps {}
	export interface IState {}
}

export default class MaterialEditor extends React.PureComponent<MaterialEditor.IProps, MaterialEditor.IState> {
	state: MaterialEditor.IState = {};

	private readonly editorChangeHandler = () => {};
	private readonly editorReadyHandler = () => {};

	private editor = new EditorInstance({ onChange: this.editorChangeHandler, onReady: this.editorReadyHandler });

	constructor (props: MaterialEditor.IProps) {
		super(props);

		this.editorChangeHandler = this.editorChangeHandler.bind(this);
		this.editorReadyHandler = this.editorReadyHandler.bind(this);
	}

	render () {
		const instance = this.editor.createInstance();

		return (
			<div className="section editor-container content-block column styled-block no-centering">
				<span className="title">Редактор материала</span>
				<input type="text" className="article-title" placeholder="Заголовок материала" />
				<div id="editorjs-holder" />
			</div>
		);
	}
}
