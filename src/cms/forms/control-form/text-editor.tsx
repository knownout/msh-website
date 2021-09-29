import React from "react";
import CreateEditorInstance from "./text-editor/instance";

export default function Editor () {
	const instance = CreateEditorInstance(() => {});

	return <div id="editorjs-holder" />;
}
