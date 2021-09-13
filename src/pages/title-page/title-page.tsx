import React from "react";
import { Link, useRouteMatch } from "react-router-dom";

import Blocks from "editorjs-blocks-react-renderer";
import DefaultPage from "../default-page/default-page";

interface ITitlePageProps {
	height: number;
}
export default class TitlePage extends DefaultPage {
	async componentDidMount () {
		setTimeout(this.setPageCentring, 50);
	}

	public render () {
		return (
			<div
				className="page-wrapper"
				style={{ minHeight: this.props.height }}
				data-centered={this.state.pageCentered}
				ref={this.pageContainerRef}
			>
				<div className="page-content" ref={this.pageBlocksRendererRef}>
					Title page stub
				</div>
			</div>
		);
	}
}
