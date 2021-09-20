import React from "react";
import ExceptionPage from "../pages/exception/exception";

interface IPageWrapperProps {
	height: number;
	loaded: boolean;
	children?: any;
	id?: string;
	exception?: boolean;
}
interface IPageWrapperState {
	pageCentered: boolean;
}

export default class PageWrapper extends React.Component<IPageWrapperProps, IPageWrapperState> {
	public readonly state: IPageWrapperState = {
		pageCentered: false
	};

	constructor (props: IPageWrapperProps) {
		super(props);

		this.setPageCentring = this.setPageCentring.bind(this);
	}

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
		setTimeout(this.setPageCentring, 50);
		window.addEventListener("resize", this.setPageCentring);
	}

	componentDidUpdate () {
		this.setPageCentring();
	}

	componentWillUnmount () {
		window.removeEventListener("resize", this.setPageCentring);
	}

	public render () {
		return (
			<div
				className="page-wrapper"
				data-centered={this.state.pageCentered}
				ref={this.pageContainerRef}
				style={{ minHeight: this.props.height }}
				id={this.props.id}
			>
				<div className="page-content" ref={this.pageBlocksRendererRef}>
					{this.props.exception ? (
						<ExceptionPage exception={500} />
					) : this.props.loaded ? (
						this.props.children
					) : (
						<span>Загрузка...</span>
					)}
				</div>
			</div>
		);
	}
}
