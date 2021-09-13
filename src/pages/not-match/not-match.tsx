import React from "react";
import { Link } from "react-router-dom";
import { useState } from "react-router/node_modules/@types/react";
import { configuration } from "../../utils/configuration";

import "./not-match.less";

export default function NotMatchPage () {
	return (
		<div className="page-container not-match-page">
			<span className="page-title">404</span>
			<div className="description">{configuration.notMatchMessage.map(i => <p key={Math.random()}>{i}</p>)}</div>
			<div className="links-holder">
				<Link to="/">Главная страница</Link>
			</div>
		</div>
	);
}
