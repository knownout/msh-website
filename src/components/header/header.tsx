import React from "react";
import { configuration } from "../configuration";
import { DefaultServerURL } from "../utils";
import "./header.less";

function Icon (props: { icon: string; className?: string | null; children?: string }) {
	return (
		<div
			className={[
				"icon round-icon content-block row nowrap",
				props.children ? "text" : "",
				props.className ? props.className : ""
			]
				.filter(e => e.length > 1)
				.join(" ")
				.trim()}
		>
			<div className="icon-holder content-block row nowrap">
				<img src={DefaultServerURL + "/public/social-icons/" + props.icon + ".svg"} alt="" />
			</div>
			{props.children && <span className="text content-block row nowrap">{props.children}</span>}
		</div>
	);
}

interface IHeaderProps {}
interface IHeaderState {
	titleTextLength: "short" | "middle" | "full";
	mobileMenu: boolean;
	headerHeight: number;
	mobileMenuOpen: boolean;
}
export default class Header extends React.Component<IHeaderProps, IHeaderState> {
	public readonly state: IHeaderState = {
		titleTextLength: "full",
		mobileMenu: false,
		headerHeight: 0,
		mobileMenuOpen: false
	};
	private websiteTitles = configuration.titleNames;
	private readonly headerComponentRef = React.createRef<HTMLDivElement>();

	constructor (props: IHeaderProps) {
		super(props);

		this.windowResizeHandler = this.windowResizeHandler.bind(this);
	}

	private windowResizeHandler () {
		const width = window.innerWidth;
		let length: "short" | "middle" | "full",
			mobileMenu: boolean = true;

		if (width <= 462) length = "short";
		else if (width < 1108) length = "middle";
		else {
			mobileMenu = false;
			length = "full";
			if (this.state.mobileMenuOpen) this.setState({ mobileMenuOpen: false });
		}

		if (this.headerComponentRef.current)
			this.setState({ headerHeight: this.headerComponentRef.current.offsetHeight });

		this.setState({ titleTextLength: length, mobileMenu });
	}

	componentDidMount () {
		this.windowResizeHandler();
		window.addEventListener("resize", this.windowResizeHandler);
	}

	componentWillUnmount () {
		window.removeEventListener("resize", this.windowResizeHandler);
	}

	public render () {
		return (
			<header className="header-component content-block row" ref={this.headerComponentRef}>
				<div className="header-content content-block row">
					<div className="content-block column" id="title-socials">
						<div className="content-block row nowrap" id="logo-title-block">
							<div className="msh-logotype">
								<img src={DefaultServerURL + "/public/favicon.ico"} alt="Логотип МСХиПР ПМР" />
							</div>
							<div className="msh-title">{this.websiteTitles[this.state.titleTextLength]}</div>
						</div>
						<div className="content-block row" id="social-icons-title">
							<Icon icon="telegram" />
							<Icon icon="viber" />
							<Icon icon="facebook" />
							<Icon icon="email">{configuration.contacts.email}</Icon>
						</div>
					</div>
					<div className="content-block column" id="title-buttons">
						<div className="content-block row" id="buttons-holder">
							<div className="button volumetric">Виртуальная приемная</div>
							<div className="button volumetric">Горячие линии</div>
						</div>
						<Icon icon="phone-call" className="right">
							{configuration.contacts.phone}
						</Icon>
					</div>
					<div
						className="content-block row"
						id="mobile-menu"
						is-shown={this.state.mobileMenu.toString()}
						is-active={this.state.mobileMenuOpen.toString()}
						onClick={() => {
							this.setState({ mobileMenuOpen: !this.state.mobileMenuOpen });
							if (this.headerComponentRef.current)
								this.setState({ headerHeight: this.headerComponentRef.current.offsetHeight });
						}}
					>
						<div className="hamburger-line" />
					</div>
				</div>
				<div
					className="content-block column"
					id="mobile-menu-content"
					style={{ top: this.state.headerHeight, height: window.innerHeight - this.state.headerHeight }}
					is-active={this.state.mobileMenu.toString()}
					is-shown={this.state.mobileMenuOpen.toString()}
				>
					123
				</div>
				{/** <Navigation /> component here */}
			</header>
		);
	}
}
