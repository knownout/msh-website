import React from "react";
import { Link } from "react-router-dom";

import { configuration } from "../../utils";

import Icon from "../icon";
import MobileMenu from "../mobile-menu/mobile-menu";
import Navigation from "../navigation/navigation";

import "./header.less";

export function Logotype (props: {
	width: number;
	onClick?: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
}) {
	let length: "short" | "middle" | "full";
	if (props.width <= 462) length = "short";
	else if (props.width <= 1108) length = "middle";
	else length = "full";

	return (
		<div
			className="content-block row nowrap"
			id="logo-title-block"
			onClick={props.onClick}
			style={{ cursor: props.onClick ? "pointer" : "default" }}
		>
			<div className="msh-logotype">
				<img src={configuration.api.server_path + "/public/favicon.ico"} alt="Логотип МСХиПР ПМР" />
			</div>
			<div className="msh-title">{configuration.titleNames[length]}</div>
		</div>
	);
}

interface IHeaderProps {
	element: React.RefObject<HTMLDivElement>;
}
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

	constructor (props: IHeaderProps) {
		super(props);

		this.windowResizeHandler = this.windowResizeHandler.bind(this);
	}

	private windowResizeHandler () {
		const width = window.innerWidth;
		let length: "short" | "middle" | "full",
			mobileMenu: boolean = true;

		if (width <= 462) length = "short";
		else if (width <= 1108) length = "middle";
		else {
			[ mobileMenu, length ] = [ false, "full" ];
			this.setState({ mobileMenuOpen: false });
		}

		this.setState({ titleTextLength: length, mobileMenu }, () => {
			if (this.props.element.current) this.setState({ headerHeight: this.props.element.current.offsetHeight });
		});
	}

	componentDidMount () {
		this.windowResizeHandler();
		window.addEventListener("resize", this.windowResizeHandler);
	}

	componentWillUnmount () {
		window.removeEventListener("resize", this.windowResizeHandler);
	}

	// TODO: If mobile menu bugs appear, there may be an error here. (ref: header || .header-content)
	public render () {
		return (
			<header
				className="header-component content-block row"
				// ref={this.headerComponentRef}
				data-blackout={this.state.mobileMenuOpen}
				ref={this.props.element}
			>
				<div className="blackout" />
				<div className="header-content content-block row">
					<div className="content-block column" id="title-socials">
						<Logotype
							width={window.innerWidth}
							onClick={() => {
								window.location.pathname = "/";
							}}
						/>
						<div className="content-block row" id="social-icons-title">
							<Link
								to={{ pathname: configuration.socialLinks.telegram }}
								target="_blank"
								className="icon"
							>
								<Icon icon="telegram" />
							</Link>
							<Link to={{ pathname: configuration.socialLinks.viber }} target="_blank" className="icon">
								<Icon icon="viber" />
							</Link>
							<Link
								to={{ pathname: configuration.socialLinks.facebook }}
								target="_blank"
								className="icon"
							>
								<Icon icon="facebook" />
							</Link>
							<Link
								to={{ pathname: "mailto:" + configuration.contacts.email }}
								target="_blank"
								className="icon"
							>
								<Icon icon="email">{configuration.contacts.email}</Icon>
							</Link>
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
						is-open={this.state.mobileMenu.toString()}
						is-active={this.state.mobileMenuOpen.toString()}
						onClick={() => this.setState({ mobileMenuOpen: !this.state.mobileMenuOpen })}
					>
						<div className="hamburger-line" />
					</div>
				</div>
				<MobileMenu
					open={this.state.mobileMenuOpen}
					active={this.state.mobileMenu}
					top={this.state.headerHeight}
				/>

				<Navigation mobileView={false} />
			</header>
		);
	}
}
