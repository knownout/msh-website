import React from "react";
import Icon from "../../../components/icon";

export default function Empty (props: { accountLevel: number }) {
	return (
		<div className="control-form empty content-block column nowrap">
			<span className="title">Выберите один из пунктов меню в левой части страницы, чтобы начать</span>
			<div className="content content-block column nowrap">
				<div className="table-column content-block row">
					<div className="item" data-access={props.accountLevel >= 1}>
						<span className="level">Доступно на уровне 1</span>
						<div className="title">
							<span className="text">
								<Icon icon="list" /> Список новостей
							</span>
							<span className="description">Список новостных материалов, загруженных на сайт</span>
						</div>
					</div>
					<div className="item" data-access={props.accountLevel >= 2}>
						<span className="level">Доступно на уровне 2</span>
						<div className="title">
							<span className="text">
								<Icon icon="plus" /> Добавить новость
							</span>
							<span className="description">
								Создание нового материала и добавление его в общий список новостей
							</span>
						</div>
					</div>
				</div>
				<div className="table-column content-block row">
					<div className="item" data-access={props.accountLevel >= 3}>
						<span className="level">Доступно на уровне 3</span>
						<div className="title">
							<span className="text">
								<Icon icon="settings" /> Настройки
							</span>
							<span className="description">
								Изменение некоторых параметров сайта, таких, как: контакты, ссылки и др.
							</span>
						</div>
					</div>
					<div className="item" data-access={props.accountLevel >= 3}>
						<span className="level">Доступно на уровне 3</span>
						<div className="title">
							<span className="text">
								<Icon icon="group" /> Управление
							</span>
							<span className="description">Настройка прав пользователей в админ-панели</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
