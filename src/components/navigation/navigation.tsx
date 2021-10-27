import React from "react";
import { configuration } from "../../utils";

import "./navigation.less";

interface INavigationState {
	navigationTab: string | null;
}
interface INavigationProps {
	mobileView: boolean;
}
export default class Navigation extends React.Component<INavigationProps, INavigationState> {
	public state: INavigationState = {
		navigationTab: null
	};
	constructor (props: INavigationProps) {
		super(props);
	}

	private getParentalRoute (e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
		const target = e.target as HTMLElement;

		const clickableItem = [ "title", "sub-item", "item", "sub-title" ]
			.map(e => target.classList.contains(e))
			.reduce((a, b) => a || b);

		if (!clickableItem) return;

		const getParentTitle = (object: HTMLElement) =>
			((object.parentElement as HTMLElement).parentElement as HTMLElement).querySelector("span") as HTMLElement;

		const firstParent = getParentTitle(target),
			secondParent = getParentTitle(firstParent.parentElement as HTMLElement),
			thirdParent = getParentTitle(secondParent.parentElement as HTMLElement);

		const titleItems = Array.from((target.closest("nav#navigation") as HTMLElement).querySelectorAll(
			"span.title"
		) as NodeListOf<HTMLElement>).map(e => e.innerText.toLocaleLowerCase());

		let parentalPath: string[] = [ firstParent, secondParent, thirdParent ]
			.map(e => e.innerText)
			.filter(e => e != target.innerText);
		parentalPath = parentalPath.filter((e, pos) => parentalPath.indexOf(e) == pos);
		parentalPath = parentalPath.reverse();
		parentalPath.push(target.innerHTML);
		parentalPath = parentalPath.map(e =>
			e.replace(/\([^)]*\)/gi, "").trim().replace(/\s{2,}/gi, " ").replace(/\s/gi, "-").toLocaleLowerCase()
		);

		if (titleItems.includes(parentalPath[1])) parentalPath = parentalPath.slice(1);

		if (parentalPath.length <= 1) return;
		return "/" + parentalPath.join("/");
	}

	public render () {
		return (
			<nav id="navigation" className={this.props.mobileView ? "mobile" : "default"}>
				<div
					className="content-block row"
					id="navigation-content"
					onMouseDown={e => {
						if (e.button == 1) e.preventDefault();
					}}
					onMouseUp={e => {
						const route = this.getParentalRoute(e);
						console.log(e.button);

						if (route) {
							if (e.button === 1)
								window.open("pages/" + route.split("/").filter(e => e.length > 0).join("_"), "_blank");
							else window.location.href = "pages/" + route.split("/").filter(e => e.length > 0).join("_");
						}

						e.preventDefault();
						e.stopPropagation();
					}}
				>
					<div className="point">
						<span className="title">Министерство</span>
						<div className="container">
							<div className="sub-point">
								<span className="sub-title">О Министерстве</span>
								<div className="sub-container">
									<span className="sub-item">Руководство</span>
									<span className="sub-item">Положение</span>
									<span className="sub-item">Структура</span>
								</div>
							</div>
							<span className="item">Государственные услуги</span>
							<span className="item">Государственная гражданская служба</span>
							<span className="item">Общественный экологический совет</span>
							<span className="item">Общественный совет</span>
							<span className="item">СМИ</span>
						</div>
					</div>

					<div className="point">
						<span className="title">Деятельность</span>
						<div className="container">
							<span className="item">Основные направления деятельности</span>
							<span className="item">Инвестиционная деятельность</span>
						</div>
					</div>

					<div className="point">
						<span className="title">Документы</span>
						<div className="container">
							<div className="sub-point">
								<span className="sub-title">Документы министерства</span>
								<div className="sub-container">
									<span className="sub-item">Тендеры</span>
									<span className="sub-item">Конкурсы</span>
									<span className="sub-item">Тарифы</span>
									<span className="sub-item">Закупки</span>
									<span className="sub-item">Формы обращений, заявлений</span>
									<span className="sub-item">Реестры, каталоги, списки, классификаторы</span>
									<span className="sub-item">Зареги-стрированные ветпрепараты</span>
									<div className="sub-point">
										<span className="sub-title no-mobile">Еще...</span>
										<div className="sub-container top">
											<span className="sub-item">План-график нормативно-правовой работы</span>
											<span className="sub-item">Проекты, внесенные в ВС ПМР</span>
											<span className="sub-item">Проекты для общественного обсуждения</span>
											<span className="sub-item">Порядок обжалования правовых актов</span>
											<span className="sub-item">Государственные символы</span>
										</div>
									</div>
								</div>
							</div>
							<div className="sub-point">
								<span className="sub-title">Правовые акты</span>
								<div className="sub-container">
									<span className="sub-item">Агро-промышленный комплекс</span>
									<span className="sub-item">Ветеринария и фитосанитария</span>
									<div className="sub-point">
										<span className="sub-title">Природные ресурсы</span>
										<div className="sub-container top">
											<span className="sub-item">Законы</span>
											<span className="sub-item">Указы Президента</span>
											<span className="sub-item">Постановления</span>
											<span className="sub-item">Распоряжения Президента</span>
											<span className="sub-item">Распоряжения Правительства</span>
											<span className="sub-item">Приказы Министра</span>
											<span className="sub-item">Распоряжения Министра</span>
										</div>
									</div>
									<div className="sub-point">
										<span className="sub-title">Общее направление</span>
										<div className="sub-container top">
											<span className="sub-item">Законы</span>
											<span className="sub-item">Указы Президента</span>
											<span className="sub-item">Постановления Правительства</span>
											<span className="sub-item">Распоряжения Правительства</span>
											<span className="sub-item">Приказы Министра</span>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>

					<div className="point">
						<span className="title">Господдержка</span>
						<div className="container">
							<span className="item">Государственные программы в области АПК</span>
							<span className="item">Планы в области АПК</span>
							<span className="item">Государственные программы в области природопользования</span>
							<span className="item">Планы в области природопользования</span>
							<span className="item">Льготы</span>
						</div>
					</div>

					<div className="point">
						<span className="title">Информация</span>
						<div className="container">
							<div className="sub-point">
								<span className="sub-title">Новости</span>
								<div className="sub-container bottom left">
									<span className="sub-item">Вакансии</span>
									<span className="sub-item">Госуслуги</span>
									<span className="sub-item">Конкурсы</span>
									<span className="sub-item">Статьи</span>
									<span className="sub-item">Тендеры</span>
								</div>
							</div>
							<span className="item">Отчеты</span>
							<span className="item">Доклады</span>
							<span className="item">Мониторинг</span>
							<span className="item">Проверки</span>
							<span className="item">Статистика</span>
							<span className="item">Издания</span>
							<span className="item">Расчетные счета банков при оплате штрафов</span>
							<span className="item">Экологический бюллетень</span>
							<div className="sub-point">
								<span className="sub-title">Помощь</span>
								<div className="sub-container top left">
									<span className="sub-item">Агро-промышленный комплекс</span>
									<span className="sub-item">Ветеринария</span>
									<span className="sub-item">Водные и рыбные ресурсы</span>
									<span className="sub-item">Земельные отношения</span>
									<span className="sub-item">Лесные и охотничьи ресурсы</span>
									<span className="sub-item">Мелиорация</span>
									<span className="sub-item">Фитосанитарное благополучие</span>
								</div>
							</div>
						</div>
					</div>

					<div className="point">
						<span className="title">Контроль</span>
						<div className="container right">
							<span className="item">В области государственного земельного контроля (надзора)</span>
							<span className="item">В области деятельности фитосанитарного контроля (надзора)</span>
						</div>
					</div>

					<div className="point">
						<span className="title">Контакты</span>
						<div className="container right">
							<span className="item">Адрес и схема проезда</span>
							<span className="item">Телефонный справочник Министерства</span>
							<span className="item">Пресс-секретарь министра</span>
							<span className="item">Обращения граждан</span>
							<span className="item no-mobile">Виртуальная приемная</span>
							<span className="item no-mobile">Горячие линии</span>
						</div>
					</div>
				</div>
			</nav>
		);
	}
}
