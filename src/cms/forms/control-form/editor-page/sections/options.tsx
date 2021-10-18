import React from "react";
import { Base64EncodedImage } from "..";
import DateTimePicker from "../../../../components/datetime-picker";
import Dropdown, { DropdownContext } from "../../../../components/dropdown";
import MaterialsList from "../../materials-list";
import { Editor } from "../editor-page";

import "./options.less";

/**
 * Пространство имен для внутреннего компонента Options
 */
namespace NS {
	/**
	 * Атрибуты компонента Options
	 */
	export interface IOptionsProps {
		/** Набор параметров для изменения */
		options: Partial<Editor.IOptionsData>;

		/** Метод изменения параметров */
		updateOptions(options: Partial<Editor.IOptionsData>): void;

		/** Метод отправки данных материала в модуль публикации */
		publish(options: Partial<Editor.IOptionsData>): void;
		editorData?: MaterialsList.IArticleRequestResult;

		tagsList: { [key: string]: any };
		checkedTagsList: string[];

		updateCheckedTagsList(checkedTagsList: string[]): void;
	}

	/**
	 * Атрибуты компонента загрузки превью
	 */
	export interface EditorPreviewProps {
		/** Метод изменения превью в родительском компоненте */
		setPreview(image: Base64EncodedImage): void;

		/** Данные загруженного изображения */
		preview?: Base64EncodedImage;
	}

	/**
	 * Компонент для проверки доступности определенного блока
	 * по заданному условию
	 * @param condition условие для проверки
	 * @param children блок, который будет выведен если условие истинно
	 */
	export function Available (props: { condition: boolean; children: any }) {
		if (!props.condition) return <span className="not-available">Недоступно для данного типа публикации</span>;
		return props.children;
	}
}

/**
 * Внутренний компонент для организации взаимодействия и расположения
 * компонентов в боковом меню панели управления сайтом
 *
 * _Внимание! Компонент не будет использоваться в других проектах
 * в связи с его спецификой и тем, что он слишком сильно завязан
 * на других компонентах админ-панели_
 *
 * @param props NS.IOptionsProps
 */
export default function Options (props: NS.IOptionsProps) {
	React.useEffect(() => {
		if (typeof props.options.type != "number") props.updateOptions({ type: 0 });
	});

	// Функции изменения параметров (вынесены для очистки JSX кода)
	const articleTypeChange = (key: number) => props.updateOptions({ type: key }),
		dateChange = (date: Date) => props.updateOptions({ publishDate: date });

	const articleType = props.options.type || 0;
	// const editorData = props.editorData as MaterialsList.IArticleRequestResult;

	const tagNameList = Object.keys(props.tagsList).map(e => {
		let val = e.split("_").slice(-1)[0];
		val = val[0].toLocaleUpperCase() + val.slice(1);

		return [ val, e ];
	});

	return (
		<div className="section aside-menu content-block column styled-block no-centering">
			<span className="title">Параметры материала</span>
			<span className="title text-title">
				Тип материала: {articleType == 0 ? "Новость" : articleType == 1 ? "Документ" : "Страница"}
			</span>

			{/* Меню выбора типа редактируемого материала */}
			{/* <Dropdown select={articleType} openTimeOut={500} onChange={articleTypeChange}>
				<Dropdown.Item>Новость</Dropdown.Item>
				<Dropdown.Item>Документ</Dropdown.Item>
				<Dropdown.Item>Страница</Dropdown.Item>
			</Dropdown> */}

			{/* Меню выбора даты и времени текущего материала. Доступно, если тип материала - новость */}
			<span className="title text-title">Дата публикации</span>
			<NS.Available condition={articleType == 0}>
				<Dropdown rawContent={true} openTimeOut={500}>
					<DropdownContext.Consumer>
						{dropdown => (
							<DateTimePicker
								contextOptions={dropdown}
								onChange={dateChange}
								onReady={dateChange}
								dateTime={
									props.editorData ? props.editorData.time == "0" ? (
										Date.now().toString()
									) : (
										props.editorData.time
									) : (
										Date.now().toString()
									)
								}
							/>
						)}
					</DropdownContext.Consumer>
				</Dropdown>
			</NS.Available>

			{/* Меню выбора превью. Доступно, если тип материала - новость */}
			<span className="title text-title">Превью</span>
			<NS.Available condition={articleType == 0}>
				<Preview
					setPreview={image => props.updateOptions({ preview: image })}
					preview={props.options.preview}
				/>
			</NS.Available>

			<span className="title text-title">Также опубликовать в:</span>
			<NS.Available condition={articleType != 2}>
				{tagNameList.map(e => {
					return (
						<Checkbox
							originalTagName={e[1]}
							label={e[0]}
							key={Math.random()}
							defaultValue={props.checkedTagsList.includes(e[1])}
							onChange={(state, label) => {
								if (!state) {
									props.updateCheckedTagsList(props.checkedTagsList.filter(e => e != label));
								} else props.updateCheckedTagsList([ ...props.checkedTagsList, label ]);

								console.log(props.checkedTagsList);
							}}
						/>
					);
				})}
			</NS.Available>

			<div className="button" onClick={() => props.publish(props.options)}>
				Опубликовать
			</div>
		</div>
	);
}

/**
 * Внутренний компонент для выбора изображения превью
 *
 * _Внимание! Компонент не использует собственное состояние, за рабочую
 * основу берется переменная и метод из атрибутов компонента_
 * @param props Editor.EditorPreviewProps
 */
function Preview (props: NS.EditorPreviewProps) {
	/** Обработчик события клика на кнопку выбора превью */
	const clickEventHandler = () => {
		const dialog = document.createElement("input"),
			fileReader = new FileReader();

		dialog.type = "file";
		dialog.accept = "*.jpg;*.jpeg";

		dialog.onchange = () => {
			if (dialog.files && dialog.files[0]) {
				fileReader.onload = () =>
					props.setPreview({
						filename: dialog.files ? dialog.files[0].name : String(),
						content: fileReader.result
					} as Base64EncodedImage);

				fileReader.readAsDataURL(dialog.files[0]);
			}
		};

		dialog.click();
	};

	let preview: any = props.preview ? props.preview.content : "";
	if (!props.preview || props.preview.content == "") preview = undefined;

	return (
		<div className="preview-image content-block column gap-10" onClick={clickEventHandler}>
			{preview && <div className="image-container" style={{ backgroundImage: `url(${preview})` }} />}
			<span className="preview-hint">Клик, чтобы выбрать превью материала</span>
		</div>
	);
}

interface ICheckboxProps {
	defaultValue?: boolean;

	onChange?(state: boolean, label: string, event: React.MouseEvent<HTMLDivElement, MouseEvent>): void;
	label: string;
	originalTagName: string;
}

function Checkbox (props: ICheckboxProps) {
	const [ checked, setChecked ] = React.useState(props.defaultValue || false);
	const clickEvent = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
		if (props.onChange) props.onChange(!checked, props.originalTagName, event);
		setChecked(!checked);
	};

	return (
		<div className="checkbox" data-checked={String(checked)} onClick={clickEvent}>
			<div className="checkbox-checker" />
			<div className="checkbox-label">{props.label}</div>
		</div>
	);
}
