import React from "react";
import { Link } from "react-router-dom";
import { configuration } from "../../utils";
import Icon from "../icon";
import ScrollMenu from "../scroll-menu";
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
			<React.Fragment>
				<div className="special-links content-block">
					<div className="bg-image" />
					<a href="http://president.gospmr.org/" target="_blank">
						<div className="link content-block column">
							<img
								src={configuration.api.server_path + "/public/link-icons/president-of-transnistria.png"}
								alt=""
							/>
							<span className="title">Сайт Президента Приднестровской Молдавской Республики</span>
						</div>
					</a>

					<a href="http://gov-pmr.org/" target="_blank">
						<div className="link content-block column">
							<img src={configuration.api.server_path + "/public/link-icons/government.png"} alt="" />
							<span className="title">Правительство Приднестровской Молдавской Республики</span>
						</div>
					</a>

					<a href="http://meteo.idknet.com/" target="_blank">
						<div className="link content-block column">
							<img
								src={
									configuration.api.server_path + "/public/link-icons/hydrometeorological-center.png"
								}
								alt=""
							/>
							<span className="title">Республиканский гидрометцентр</span>
						</div>
					</a>

					<a href="http://pniish.org/" target="_blank">
						<div className="link content-block column">
							<img src={configuration.api.server_path + "/public/link-icons/logo-pniish.png"} alt="" />
							<span className="title">
								Приднестровский научно исследовательский институт сельского хозяйства
							</span>
						</div>
					</a>

					<a href="https://botsadpmr.com/" target="_blank">
						<div className="link content-block column">
							<img
								src={configuration.api.server_path + "/public/link-icons/botanical-garden.png"}
								alt=""
							/>
							<span className="title">Республиканский ботанический сад</span>
						</div>
					</a>

					<a href="https://uslugi.gospmr.org/?view=gosuslugi&org=13" target="_blank">
						<div className="link content-block column">
							<img
								src={configuration.api.server_path + "/public/link-icons/government-services.png"}
								alt=""
							/>
							<span className="title">Портал государственных услуг</span>
						</div>
					</a>

					<a href="https://tv.pgtrk.com/ru" target="_blank">
						<div className="link content-block column">
							<img src={configuration.api.server_path + "/public/link-icons/first-channel.png"} alt="" />
							<span className="title">Первый Приднестровский телеканал</span>
						</div>
					</a>

					<a href="http://radio.pgtrk.com/" target="_blank">
						<div className="link content-block column">
							<img src={configuration.api.server_path + "/public/link-icons/first-radio.jpg"} alt="" />
							<span className="title">Радио 1 (Радио Приднестровья)</span>
						</div>
					</a>

					{/* <a href="http://investpmr.org/#start" target="_blank">
						<div className="link content-block column">
							<img src={configuration.api.server_path + "/public/link-icons/first-radio.jpg"} alt="" />
							<span className="title">Invest Pridnestrovie</span>
						</div>
					</a> */}
				</div>
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
							<Link
								to={{ pathname: configuration.socialLinks.telegram }}
								target="_blank"
								className="icon"
							>
								<Icon icon="telegram" className="light">
									Telegram
								</Icon>
							</Link>
							<Link to={{ pathname: configuration.socialLinks.viber }} target="_blank" className="icon">
								<Icon icon="viber" className="light">
									Viber
								</Icon>
							</Link>
							<Link
								to={{ pathname: configuration.socialLinks.facebook }}
								target="_blank"
								className="icon"
							>
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
							<img src={configuration.api.server_path + "/public/location-code.svg"} alt="" />
						</div>
					</div>
				</footer>
			</React.Fragment>
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
