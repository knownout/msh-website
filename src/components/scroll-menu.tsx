import React from "react";

export default function ScrollMenu (props: { children?: any; childrenWidth?: number }) {
	const [ mouseLock, setMouseLock ] = React.useState<number | boolean>(false);

	const scrollMenuElement = React.createRef<HTMLDivElement>();
	const childrenWidth = props.childrenWidth || null;

	type LockMouseEvent = React.MouseEvent<HTMLDivElement, MouseEvent>;
	type PointerLockEvent = LockMouseEvent | React.TouchEvent<HTMLDivElement>;

	const Capitalize = (item: string) => item[0].toLocaleUpperCase() + item.slice(1);
	const onPointerLock = (event: PointerLockEvent) => {
		if (!scrollMenuElement.current) return;

		let root: LockMouseEvent | React.Touch;
		if (event.nativeEvent instanceof MouseEvent) root = event as LockMouseEvent;
		else root = (event as React.TouchEvent<HTMLDivElement>).touches[0];

		if ([ "mousedown", "touchstart" ].includes(event.type))
			setMouseLock(root.pageX + scrollMenuElement.current.scrollLeft);
		else if ([ "mouseup", "touchend" ].includes(event.type)) {
			setMouseLock(false);

			if (!childrenWidth) return;
			const nearestPosition =
				childrenWidth * Math.round(scrollMenuElement.current.scrollLeft / (childrenWidth - 0));
			scrollMenuElement.current.scrollTo({
				left: nearestPosition,
				behavior: "smooth"
			});
		} else if ([ "mousemove", "touchmove" ].includes(event.type)) {
			if (typeof mouseLock === "boolean") return;

			const left = mouseLock - root.pageX;
			scrollMenuElement.current.scrollTo({ left });
		}
	};

	const relatedEvents: { [key: string]: string[] } = {
		mouse: [ "down", "up", "move" ],
		touch: [ "start", "end", "move" ]
	};

	const eventNamesList: {
		[key: string]: typeof onPointerLock | ((event: React.WheelEvent<HTMLDivElement>) => void);
	} = {};
	for (const event in relatedEvents)
		relatedEvents[event].forEach(e => (eventNamesList[`on${Capitalize(event)}${Capitalize(e)}`] = onPointerLock));

	eventNamesList["onWheel"] = (event: React.WheelEvent<HTMLDivElement>) => {
		if (!childrenWidth || !scrollMenuElement.current) return;

		const nearestPosition =
			childrenWidth *
			Math.round(
				(scrollMenuElement.current.scrollLeft + (event.deltaY > 0 ? childrenWidth : -childrenWidth)) /
					childrenWidth
			);
		scrollMenuElement.current.scrollTo({
			left: nearestPosition,
			behavior: "smooth"
		});
	};

	return (
		<div className="scroll-menu-wrapper">
			<div className="scroll-left" />
			<div className="scroll-menu" {...eventNamesList} ref={scrollMenuElement}>
				{props.children}
			</div>
			<div className="scroll-right" />
		</div>
	);
}
