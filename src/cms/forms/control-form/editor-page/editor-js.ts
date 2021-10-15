const Header = require("@editorjs/header");
const Paragraph = require("@editorjs/paragraph");
const List = require("@editorjs/list");
const AlignmentTuneTool = require("editorjs-text-alignment-blocktune");
const Quote = require("@editorjs/quote");
const Warning = require("@editorjs/warning");
const Marker = require("@editorjs/marker");
const InlineCode = require("@editorjs/inline-code");
const Image = require("@editorjs/image");
const Delimiter = require("@editorjs/delimiter");

import EditorJS, { API, BlockAPI, EditorConfig, LogLevels, OutputData } from "@editorjs/editorjs";

const EditorJSToolConfiguration = {
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

		image: {
			class: Image,
			config: {
				captionPlaceholder: "Подпись к изображению",
				uploader: {}
			}
		},

		delimiter: Delimiter,

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
	}
};

const EditorJSLocalizationConfiguration = {
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
				Image: "Картинка",
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
				},
				image: {
					"Select an Image": "Загрузить изображение"
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
};

interface EditorInstanceProps {
	onReady: () => void;
	onImageLoaded: (image: File) => void;

	onChange: (api: API, block: BlockAPI) => void;
}

export default class EditorInstance {
	private editorInstance?: EditorJS;

	private readonly editorConfig: EditorConfig = {
		logLevel: "ERROR" as LogLevels,

		placeholder: "Напишите что-нибудь...",

		holder: "editorjs-holder",
		autofocus: true,

		inlineToolbar: [ "bold", "italic", "link", "marker", "inlineCode" ],

		...EditorJSToolConfiguration,
		...EditorJSLocalizationConfiguration
	};

	constructor (props: Partial<EditorInstanceProps>, content?: OutputData) {
		const imageConfiguration = (this.editorConfig.tools as any).image as { [key: string]: any };

		imageConfiguration.config.uploader = {
			uploadByFile (file: File) {
				const fileReader = new FileReader();
				const promise = new Promise(resolve => {
					const pull = (data: string) => resolve({ success: 1, file: { url: data } });

					fileReader.onload = () => pull(String(fileReader.result));
					fileReader.readAsDataURL(file);
				});

				return promise;
			}
		};

		if (props && props.onImageLoaded && this.editorConfig.tools) {
		}

		if (content) this.editorConfig.data = content;

		if (props && props.onChange) this.editorConfig.onChange = props.onChange;
		if (props && props.onReady) this.editorConfig.onReady = props.onReady;
	}

	public createInstance (holder: string = "editorjs-holder") {
		if (!this.editorInstance) {
			if (holder) this.editorConfig.holder = holder;
			this.editorInstance = new EditorJS(this.editorConfig);
		}

		return this.editorInstance;
	}
}
