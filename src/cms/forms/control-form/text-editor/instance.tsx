const Header = require("@editorjs/header");
const Paragraph = require("@editorjs/paragraph");
const List = require("@editorjs/list");
const AlignmentTuneTool = require("editorjs-text-alignment-blocktune");
const Quote = require("@editorjs/quote");
const Warning = require("@editorjs/warning");
const Marker = require("@editorjs/marker");
const InlineCode = require("@editorjs/inline-code");

import EditorJS from "@editorjs/editorjs";

export default function CreateEditorInstance (callback: () => void) {
	const editorInstance = new EditorJS({
		placeholder: "Напишите что-нибудь...",
		holder: "editorjs-holder",
		autofocus: true,

		onReady: callback,

		inlineToolbar: [ "bold", "italic", "link", "marker", "inlineCode" ],
		tools: {
			header: {
				class: Header,
				config: {
					levels: [ 1, 2 ],
					defaultLevel: 1,
					placeholder: "Введите заголовок"
				},
				tunes: [ "align" ]
			},

			align: {
				class: AlignmentTuneTool,
				config: { default: "left" }
			},

			marker: Marker,
			inlineCode: InlineCode,

			paragraph: {
				class: Paragraph,
				inlineToolbar: [ "bold", "italic", "link", "marker", "inlineCode" ],
				tunes: [ "align" ]
			},

			list: List,
			quote: {
				class: Quote,
				config: {
					quotePlaceholder: "Цитата",
					captionPlaceholder: "Подпись"
				}
			},
			warning: {
				class: Warning,
				config: {
					titlePlaceholder: "Название",
					messagePlaceholder: "Сообщение"
				}
			}
		},

		i18n: {
			messages: {
				ui: {
					blockTunes: {
						toggler: {
							"Click to tune": "Настроить блок",
							Delete: "Удалить"
						}
					},
					inlineToolbar: {
						converter: {
							"Convert to": "Конвертировать"
						}
					},
					toolbar: {
						toolbox: {
							Add: "Добавить"
						}
					}
				},
				toolNames: {
					Text: "Параграф",
					Heading: "Заголовок",
					List: "Список",
					Warning: "Примечание",
					Quote: "Цитата",
					Code: "Код",
					Delimiter: "Разделитель",
					"Raw HTML": "HTML-фрагмент",
					Table: "Таблица",
					Link: "Ссылка",
					Marker: "Маркер",
					Bold: "Полужирный",
					Italic: "Курсив",
					InlineCode: "Моноширинный"
				},
				tools: {
					link: {
						"Add a link": "Вставьте ссылку"
					},
					list: {
						Ordered: "Нумерованный",
						Unordered: "Маркированный"
					}
				},
				blockTunes: {
					delete: {
						Delete: "Удалить"
					},
					moveUp: {
						"Move up": "Переместить вверх"
					},
					moveDown: {
						"Move down": "Переместить вниз"
					}
				}
			}
		}
	});

	return editorInstance;
}
