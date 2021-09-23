import React from "react";
import "./popup.less";

export type TPopupData = Partial<{
	title: string;
	shown: boolean;

	message: string;
	buttons: {
		onClick?: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
		name: string;
		special?: boolean;
	}[];
}>;

export default function Popup (props: TPopupData) {
	return (
		<div className="popup-messages-layout content-block row w-100 h-100 nowrap" data-shown={props.shown}>
			<div className="popup-message content-block column nowrap no-centering">
				<span className="message-title">{props.title}</span>
				<div className="popup-message-content white-block content-block column nowrap no-centering">
					<span className="message-text">{props.message}</span>
					{props.buttons &&
					props.buttons.length > 0 && (
						<div className="controls content-block row">
							{props.buttons.map(e => (
								<div
									className={"button form-submit" + (e.special ? " special" : "")}
									key={Math.random()}
									onClick={e.onClick}
								>
									{e.name}
								</div>
							))}
						</div>
					)}
				</div>
			</div>
		</div>
	);
}

export function handlePopupMessage (setPopupData: (d: TPopupData) => void, { title, message, buttons }: TPopupData) {
	// const denyLogout = () => setPopupData({ shown: false, ...partialPopupData });
	// const confirmLogout = () =>
	//     this.setState({ popupData: { shown: false, ...partialPopupData } }, () =>
	//         this.props.updateAuthState({ authState: false })
	//     );

	const partialPopupData = { title, message, buttons: (buttons || []).map(e => ({ name: e.name })) };
	const messageButtons = (buttons || []).map(e => ({
		name: e.name,
		special: e.special,
		onClick: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
			setPopupData({ shown: false, ...partialPopupData });
			if (e.onClick) e.onClick(event);
		}
	}));

	setPopupData({ ...partialPopupData, buttons: messageButtons });
}
