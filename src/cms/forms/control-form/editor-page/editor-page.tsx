// Основные модули
import React from "react";

// Подключение компонентов
import ScrollArea from "react-scrollbar";

// Подключение стилей
import "./editor-page.less";
import { MessageBoxWorker } from "../../../components/message-box";
import Options from "./sections/options";
import MaterialEditor from "./sections/material-editor";
import { ArticleType, Base64EncodedImage } from ".";

export namespace Editor {
	export interface IProps {
		messageBoxWorker: MessageBoxWorker;
	}

	export interface IState {
		options: Partial<TOptionsData>;
	}

	export type TOptionsData = {
		preview: Base64EncodedImage;
		type: ArticleType;
		publishDate: Date;
	};

	export interface EditorPreviewProps {
		setPreview: (image: Base64EncodedImage) => void;
		preview?: Base64EncodedImage;
	}
}

export default class Editor extends React.PureComponent<Editor.IProps, Editor.IState> {
	state: Editor.IState = { options: {} };

	constructor (props: Editor.IProps) {
		super(props);

		this.updateOptions = this.updateOptions.bind(this);
	}

	private updateOptions (options: Partial<Editor.TOptionsData>) {
		let resultingObject = this.state.options;

		Object.keys(options).map(key => Object.assign(resultingObject, { [key]: (options as any)[key] }));

		this.setState({ options: resultingObject });
		this.forceUpdate();
	}

	render () {
		return (
			<div className="content-container content-block column no-centering" id="content-editor">
				<ScrollArea horizontal={false} smoothScrolling={true} className="content-scroll-area">
					<div className="section-wrapper content-block row no-centering nowrap">
						<MaterialEditor />
						<Options options={this.state.options} updateOptions={this.updateOptions} />
					</div>
				</ScrollArea>
			</div>
		);
	}
}
