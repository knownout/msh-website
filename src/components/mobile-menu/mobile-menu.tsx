import React from "react";
import { configuration } from "../../utils/configuration";

import Icon from "../icon";
import Navigation from "../navigation/navigation";

import "./mobile-menu.less";

interface IMobileMenuState {}
interface IMobileMenuProps {
	open: boolean;
	active: boolean;

	top: number;
}
export default class MobileMenu extends React.Component<IMobileMenuProps, IMobileMenuState> {
	public readonly state: IMobileMenuState = {};

	constructor (props: IMobileMenuProps) {
		super(props);
	}

	public render () {
		const props = this.props;

		const defaultProps = { className: "", id: "mobile-menu-content" };

		return (
			<div
				{...defaultProps}
				style={{ top: this.props.top, height: window.innerHeight - this.props.top }}
				is-active={props.active.toString()}
				is-open={props.open.toString()}
			>
				<header className="content-block column" id="mobile-menu-header">
					<div className="content-block row" id="social-icons">
						<Icon icon="telegram" />
						<Icon icon="viber" />
						<Icon icon="facebook" />
						<Icon icon="phone-call">{configuration.contacts.phone}</Icon>
						<Icon icon="email">{configuration.contacts.email}</Icon>
					</div>
					<Navigation mobileView={true} />
					<div className="content-block row nowrap" id="buttons-holder">
						<div className="button volumetric">Виртуальная приемная</div>
						<div className="button volumetric">Горячие линии</div>
					</div>
				</header>
				<main className="content-block column" id="mobile-menu-inner">
					{/** Nav panel */}
				</main>
			</div>
		);
	}
}
