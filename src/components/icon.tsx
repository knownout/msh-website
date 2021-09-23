import React from "react";
import { configuration } from "../utils";

export default function Icon (props: { icon: string; className?: string | null; children?: string }) {
	return (
		<div
			source-icon={props.icon}
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
				<img src={configuration.api.server_path + "public/social-icons/" + props.icon + ".svg"} alt="" />
			</div>
			{props.children && <span className="text content-block row nowrap">{props.children}</span>}
		</div>
	);
}
