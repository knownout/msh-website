import React from "react";
import { Base64EncodedImage } from "..";
import DateTimePicker from "../../../../components/datetime-picker";
import Dropdown, { DropdownContext } from "../../../../components/dropdown";
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
		options: Partial<Editor.TOptionsData>;

		/** Метод изменения параметров */
		updateOptions: (options: Partial<Editor.TOptionsData>) => void;
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
	// Функции изменения параметров (вынесены для очистки JSX кода)
	const articleTypeChange = (key: number) => props.updateOptions({ type: key }),
		dateChange = (date: Date) => props.updateOptions({ publishDate: date });

	const articleType = props.options.type || 0;

	return (
		<div className="section aside-menu content-block column styled-block no-centering">
			<span className="title">Параметры материала</span>
			<span className="title text-title">Тип материала</span>

			{/* Меню выбора типа редактируемого материала */}
			<Dropdown select={articleType} openTimeOut={500} onChange={articleTypeChange}>
				<Dropdown.Item>Новость</Dropdown.Item>
				<Dropdown.Item>Документ</Dropdown.Item>
				<Dropdown.Item>Страница</Dropdown.Item>
			</Dropdown>

			{/* Меню выбора даты и времени текущего материала. Доступно, если тип материала - новость */}
			<span className="title text-title">Дата публикации</span>
			<NS.Available condition={articleType == 0}>
				<Dropdown rawContent={true} openTimeOut={500}>
					<DropdownContext.Consumer>
						{dropdown => <DateTimePicker contextOptions={dropdown} onChange={dateChange} />}
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

			<div className="button">Опубликовать</div>
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
function Preview (props: Editor.EditorPreviewProps) {
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

	return (
		<div className="preview-image content-block column gap-10" onClick={clickEventHandler}>
			{props.preview && (
				<div className="image-container" style={{ backgroundImage: `url(${props.preview.content})` }} />
			)}
			<span className="preview-hint">Клик, чтобы выбрать превью материала</span>
		</div>
	);
}
