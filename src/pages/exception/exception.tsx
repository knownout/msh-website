import React from "react";
import { Link } from "react-router-dom";
import { configuration } from "../../utils";

import "./exception.less";

export default function ExceptionPage (props: { exception: number }) {
	return (
		<div className="page-container not-match-page">
			<span className="page-title">{props.exception}</span>
			<div className="description">
				{configuration.exceptionMessages[props.exception].map(i => <p key={Math.random()}>{i}</p>)}
			</div>
			<div className="links-holder">
				<Link to="/">Главная страница</Link>
			</div>
		</div>
	);
}
