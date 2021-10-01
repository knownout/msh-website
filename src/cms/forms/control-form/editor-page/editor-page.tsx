// Основные модули
import React from "react";

// Подключение компонентов
import DateTimePicker from "../../../components/datetime-picker";
import Dropdown, { DropdownContext } from "../../../components/dropdown";
import ScrollArea from "react-scrollbar";

// Подключение стилей
import "./editor-page.less";

namespace EditorPage {
	export type TArticleType = 0 | 1 | 2;
}

export default function EditorPage (props: {}) {
	const [ articleType, setArticleType ] = React.useState<EditorPage.TArticleType>(0);
	const changeArticleType = (key: number) => setArticleType(key as EditorPage.TArticleType);

	const notAvailable = <span className="not-available">Недоступно для данного типа публикации</span>;

	return (
		<div className="content-container content-block column no-centering" id="content-editor">
			<ScrollArea horizontal={false} smoothScrolling={true} className="content-scroll-area">
				<div className="section-wrapper content-block row no-centering nowrap">
					<div className="section editor-container content-block column styled-block no-centering">
						editor
					</div>
					<div className="section aside-menu content-block column styled-block no-centering">
						<span className="title">Параметры материала</span>

						<span className="title text-title">Тип материала</span>
						<Dropdown select={0} openTimeOut={500} onChange={changeArticleType}>
							<Dropdown.Item>Новость</Dropdown.Item>
							<Dropdown.Item>Документ</Dropdown.Item>
							<Dropdown.Item>Страница</Dropdown.Item>
						</Dropdown>

						<span className="title text-title">Дата публикации</span>
						{articleType == 2 ? (
							notAvailable
						) : (
							<Dropdown rawContent={true} openTimeOut={500}>
								<DropdownContext.Consumer>
									{dropdown => <DateTimePicker contextOptions={dropdown} />}
								</DropdownContext.Consumer>
							</Dropdown>
						)}

						<span className="title text-title">Превью</span>
						{articleType != 0 ? notAvailable : <span>ImagePreviewComponent stub</span>}
					</div>
				</div>
			</ScrollArea>
		</div>
	);
}
