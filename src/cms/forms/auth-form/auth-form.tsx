// Основные модули
import React from "react";
import { IFormProps } from "../..";

// Подключение стилей
import "./auth-form.less";

interface IProps {}

export default function AuthForm (props: IProps & IFormProps) {
	const loginInputRef = React.createRef<HTMLInputElement>(),
		passInputRef = React.createRef<HTMLInputElement>(),
		buttonRef = React.createRef<HTMLDivElement>();

	/**
     * Эффект "встряхивания" кнопки; говорит пользователю о том, что
     * произошла какая-либо ошибка при входе (лень делать popup)
     * @returns void
     */
	const shakeButton = () => {
		if (!buttonRef.current) return;

		// Удалить эффект встряхивания через некоторое время
		setTimeout(() => buttonRef.current && buttonRef.current.classList.remove("fail"), 310);

		// Сделать кнопку доступной и добавить эффект встряхивания
		buttonRef.current.classList.remove("disabled");
		buttonRef.current.classList.add("fail");

		// Изменение фокуса и удаление пароля
		if (passInputRef.current) passInputRef.current.value = "";
		if (loginInputRef.current) loginInputRef.current.focus();
	};

	/**
     * Обработчик события нажатия на кнопку входа по данным формы
     * @param event событие нажатия на кнопку (Mouse- или KeyboardEvent)
     * @returns void
     */
	const onButtonClick = (event?: React.KeyboardEvent | React.MouseEvent) => {
		/**
         * Сделано для того, чтобы при нажатии кнопки посредством клавиатуры,
         * символы не появлялись в поле для ввода логина
         */
		if (event) event.preventDefault();

		// Преобразуем ссылки в значения полей
		if (!loginInputRef.current || !passInputRef.current) return shakeButton();
		const [ login, password ] = [ loginInputRef, passInputRef ].map(i => (i.current ? i.current.value.trim() : ""));

		if (!login || !password) return shakeButton();

		// Отключаем кнопку и отправляем запрос в корневой компонент
		if (buttonRef.current) buttonRef.current.classList.add("disabled");

		// Если пришла ошибка, встряхиваем кнопку и по новой
		props.updateData(login, password).then(result => (result ? null : shakeButton()));
	};

	/**
     * Список атрибутов и событий кнопки входа
     */
	const buttonAttributesList = {
		onClick: onButtonClick,
		onKeyPress: (e: React.KeyboardEvent<HTMLDivElement>) => [ " ", "Enter" ].includes(e.key) && onButtonClick(e),

		tabIndex: 3,
		ref: buttonRef
	};

	return (
		<div className="form content-block column no-centering" id="auth-form">
			<span className="form-title">Авторизация</span>
			<div className="form-content styled-block content-block column gap-10 no-centering">
				<input type="text" placeholder="Логин пользователя" maxLength={20} ref={loginInputRef} tabIndex={1} />
				<input type="password" placeholder="Пароль" maxLength={20} ref={passInputRef} tabIndex={2} />
				<div className="button cms-button" {...buttonAttributesList}>
					Продолжить
				</div>
			</div>
		</div>
	);
}
