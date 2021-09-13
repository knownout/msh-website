import React from "react";
import { Link } from "react-router-dom";
import { configuration, DefaultServerURL } from "../../utils/configuration";
import Icon from "../icon";
import "./footer.less";

interface IFooterProps {
	children: any;
}
interface IFooterState {}
export default class Footer extends React.Component<IFooterProps, IFooterState> {
	public state: IFooterState = {};
	constructor (props: IFooterProps) {
		super(props);
	}

	public render () {
		return (
			<footer id="content-footer">
				<div className="content-left content-block column">
					<div className="dynamic-content">{this.props.children}</div>
					<div className="footer-social-icons content-block row">
						<Link
							to={{ pathname: "mailto:" + configuration.contacts.email }}
							target="_blank"
							className="icon"
						>
							<Icon icon="email" className="light">
								{configuration.contacts.email}
							</Icon>
						</Link>
						<Link
							to={{ pathname: "callto:" + configuration.contacts.email }}
							target="_blank"
							className="icon"
						>
							<Icon icon="email" className="light">
								{configuration.contacts.phone}
							</Icon>
						</Link>
						<Link to={{ pathname: configuration.socialLinks.telegram }} target="_blank" className="icon">
							<Icon icon="telegram" className="light">
								Telegram
							</Icon>
						</Link>
						<Link to={{ pathname: configuration.socialLinks.viber }} target="_blank" className="icon">
							<Icon icon="viber" className="light">
								Viber
							</Icon>
						</Link>
						<Link to={{ pathname: configuration.socialLinks.facebook }} target="_blank" className="icon">
							<Icon icon="facebook" className="light">
								Facebook
							</Icon>
						</Link>
					</div>
				</div>
				<div className="content-right content-block row">
					<div className="content-block column nowrap" id="text-location-data">
						<span>MD-3300, г. Тирасполь</span>
						<span>ул. Юности 58/3</span>
						<span>тел. {configuration.contacts.phone}</span>
						<span>факс. {configuration.contacts.fax}</span>
						<Link to="#">Схема проезда</Link>
					</div>
					<div className="content-block row" id="qr-code-location-data">
						<img src={DefaultServerURL + "/public/location-code.svg"} alt="" />
					</div>
				</div>
			</footer>
		);
	}
}

/**
 * BEGIN:VCARD
VERSION:2.1
ORG:Министерство сельского хозяйства и природных ресурсов ПМР
ADR:;;ул. Юности 58/3;Тирасполь;;MD-3300;Приднестровская Молдавская Республика
TEL:+373 533 26745
TEL;FAX:+373 533 27896
EMAIL;INTERNET:minagro@ecology-pmr.org
URL:http://ecology-pmr.org
END:VCARD
 */
