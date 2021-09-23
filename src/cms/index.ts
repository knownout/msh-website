/**
 * Объект конфигурации CMS
 */
export const CMSInternalConfiguration = {
	localSessionKey: "cmsAccountData"
};

/**
 * Тип для данных об аккаунте (НЕ данные с сервера)
 * @param fullName полное име пользователя (НЕ логин)
 * @param accountLevel уровень доступа аккаунта
 * @param token токен для отправки API-запросов серверу
 */
export type TAccountData = {
	fullName: string;
	accountLevel: number;
	token: string;
};

/**
 * Стандартный интерфейс формы
 * @param updateData функция для отправки в корневой компонент данных об аккаунте
 */
export interface IFormProps {
	updateData: (login: string, password: string) => Promise<boolean>;
}

/**
 * Пространство имён для типов данных, возвращаемых сервером
 */
export namespace Request {
	/**
     * Мета-данные ошибки запроса
     */
	export type TRequestErrorMeta = {
		reason: string;
	};

	/**
     * Тип данных ответа на запрос сервера
     * @param success результат выполнения запроса
     * @param meta мета-данные запроса
     */
	export type TRequestResult<T> = {
		success: boolean;
		meta: T | TRequestErrorMeta;
	};
}
