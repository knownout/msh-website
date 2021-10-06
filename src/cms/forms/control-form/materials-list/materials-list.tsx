import React from "react";
import { ArticleType } from "../editor-page";

namespace MaterialsList {
	export interface IState {
		materialType: ArticleType;
	}

	export interface IProps {}
}

export class MaterialsList extends React.Component<MaterialsList.IProps, MaterialsList.IState> {
	state: MaterialsList.IState = { materialType: ArticleType.Article };

	constructor (props: MaterialsList.IProps) {
		super(props);
	}

	private fetchMaterialsList () {
		console.log(this.state.materialType);
	}

	componentDidMount () {
		this.fetchMaterialsList();
	}

	render () {
		return (
			<div className="content-container content-block column no-centering" id="content-editor">
				<div>NewsListComponent MainPage</div>
			</div>
		);
	}
}
