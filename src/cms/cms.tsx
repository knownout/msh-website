// Основные модули
import React from "react";

// Подключение общего контента
import { TAccountData, CMSInternalConfiguration as config, Request } from ".";
import { configuration as app_config } from "../utils";

// Библиотеки
import CryptoJS from "crypto-js";

// Подключение внутренних компонентов
import MessageBox, { MessageBoxWorker, TMessageBoxData } from "./components/message-box";
import AuthForm from "./forms/auth-form/auth-form";

// Подключение стилей
import "./shared.less";
import ControlForm from "./forms/control-form/control-form";

interface IProps {}
interface IState {
	/**
     * Данные о текущем аккаунте
     */
	accountData?: TAccountData;

	/**
     * Данные о состоянии контента страницы
     */
	contentLoaded?: boolean;

	/**
	 * Контейнер всплывающего окна
	 */
	messageBox: TMessageBoxData;
}

export const AccountDataContext = React.createContext<TAccountData | null>(null);
export default class CMSRoot extends React.PureComponent<IProps, IState> {
	state: IState = { messageBox: { state: false } };
	constructor (props: IProps) {
		super(props);
	}

	/**
     * Функция обновления состояния данных об аккаунте,
     * передается в компонент формы входа
     *
     * @param login логин для авторизации
     * @param password пароль
     * @returns true если удалось войти в аккаунт
     */
	private readonly updateAccountData = async (login: string, password: string) => {
		const accountData = await this.requestAccountData(login, CryptoJS.MD5(password).toString());
		if (!accountData || !accountData.success) return false;

		localStorage.setItem(config.localSessionKey, `${login};${password}`);
		this.setState({ accountData: accountData.meta as TAccountData });

		return true;
	};

	/**
     * Функция отправляет запрос авторизации серверу и возвращает данные
     * об аккаунте, если логи и хэш пароля верны.
     *
     * @param login логин текущего пользователя
     * @param hash пароль
     * @returns данные об аккаунте в виде TAccountData
     */
	private readonly requestAccountData = (login: string, hash: string) => {
		return fetch(app_config.api.server_path + app_config.api.authorization + `${login}&hash=${hash}`)
			.then(req => req.json() as Promise<Request.TRequestResult<TAccountData>>)
			.catch(() => {
				this.messageBoxWorker
					.updateContent({
						title: "Ошибка подключения",
						message:
							"Ошибка при получении данных аккаунта: не удалось соединиться с сервером, " +
							"попробуйте зайти позже или сообщите администратору"
					})
					.updateState(true);
			});
	};

	componentDidMount () {
		/**
         * Чисто техническая функция для более красивой организации
         * анонимной функции определения SessionData
         * @param callback по названию переменной понятно 😐
         * @returns как ни странно, но null 😑
         */
		const setNull = (callback?: () => any) => {
			if (callback) callback();
			return null;
		};

		/**
         * Функция проверяет, существует ли локальная запись о каком-либо аккаунте и, если
         * такая запись существует, преобразует ее в логин и хэш
         *
         * @returns null или массив с паролем и логином
         */
		const sessionData = (() => {
			const sessionKey = localStorage.getItem(config.localSessionKey);
			if (!sessionKey) return null;

			const sessionData = sessionKey.split(";");
			if (sessionData.length != 2) return setNull(() => localStorage.removeItem(config.localSessionKey));

			return sessionData;
		})();

		// Проверка на существование данных сессии и вход по ним
		if (!sessionData) this.setState({ contentLoaded: true });
		else {
			const [ login, hash ] = [ sessionData[0], CryptoJS.MD5(sessionData[1]).toString() ];

			// Запрос данных о аккаунте с сервера
			this.requestAccountData(login, hash).then(data => {
				if (!data) return this.setState({ contentLoaded: true });
				if (data.success) this.setState({ accountData: data.meta as TAccountData });

				// При любом результате помечаем страницу загруженной
				this.setState({ contentLoaded: true });
			});
		}
	}

	// Обслуживающие функции для всплывающего окна
	private readonly updateMessageBox = (box: TMessageBoxData) => this.setState({ messageBox: { ...box } });
	private readonly messageBoxWorker = new MessageBoxWorker(this.updateMessageBox, this.state.messageBox);

	render () {
		// Установка текущего управляющего компонента (форма входа или панель управления)
		let currentControlComponent = <AuthForm updateData={this.updateAccountData} />;
		if (this.state.accountData) currentControlComponent = <ControlForm updateData={this.updateAccountData} />;

		return (
			<div id="cms-root">
				<MessageBox messageBox={this.state.messageBox} worker={this.messageBoxWorker} />
				{this.state.contentLoaded ? (
					<div id="cms-content-wrapper">
						<AccountDataContext.Provider value={this.state.accountData || null}>
							{currentControlComponent}
						</AccountDataContext.Provider>
					</div>
				) : (
					<div id="cms-loading-handler">Loading</div>
				)}
			</div>
		);
	}
}
