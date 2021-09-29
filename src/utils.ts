export function getTextTime (timestamp: number) {
	const date = new Date(timestamp);
	let monthName = configuration.monthsName[date.getMonth()];

	let lastCharacter = monthName.slice(-1);
	monthName = monthName.slice(0, -1);

	if (lastCharacter == "т") lastCharacter = "а";
	else lastCharacter = "я";

	monthName = monthName + lastCharacter;

	return `${date.getDay()} ${monthName} ${date.getFullYear()}`;
}

export function getHelloText () {
	const hours = new Date().getHours();
	if (hours >= 17 && hours <= 23) return "Добрый вечер";
	else if (hours >= 24 || hours <= 4) return "Доброй ночи";
	else if (hours >= 13 && hours <= 16) return "Добрый день";
	else if (hours <= 12 && hours >= 5) return "Доброе утро";
	return "Добро пожаловать";
}

export const configuration = {
	minHeight: 520,
	minWidth: 320,

	titleNames: {
		short: "МСХиПР ПМР",
		middle: "МИНИСТЕРСТВО СЕЛЬСКОГО ХОЗЯЙСТВА И ПРИРОДНЫХ РЕСУРСОВ ПМР",
		full: "МИНИСТЕРСТВО СЕЛЬСКОГО ХОЗЯЙСТВА И ПРИРОДНЫХ РЕСУРСОВ ПРИДНЕСТРОВСКОЙ МОЛДАВСКОЙ РЕСПУБЛИКИ"
	},
	contacts: {
		email: "minagro@ecology-pmr.org",
		phone: "+373 (533) 26-74-5",
		fax: "+373 (533) 27-89-6"
	},

	exceptionMessages: {
		404: [
			"Запрошенная страница не найдена или удалена. Проверьте правильность введенной ссылки и повторите попытку.",
			"Если ссылка введена верно и Вы в этом уверены, сообщите в основной аппарат Министерства."
		],
		500: [
			"Произошла внутренняя ошибка сервера, попробуйте обновить страницу через некоторое время.",
			"Если проблема не исчезнет, сообщите в основной аппарат Министерства"
		]
	} as { [key: number]: string[] },

	socialLinks: {
		telegram: "https://web.telegram.org/",
		viber: "https://www.viber.com/ru/",
		facebook: "https://www.facebook.com/"
	},

	monthsName: [
		"январь",
		"февраль",
		"март",
		"апрель",
		"май",
		"июнь",
		"июль",
		"август",
		"сентябрь",
		"октябрь",
		"ноябрь",
		"декабрь"
	],

	api: {
		get_articles: "api/articles.php?action=get&path=",
		server_path: "http://192.168.100.170/",
		fetch_title_page: "api/fetch-title-page-data.php",
		authorization: "api/auth.php?login=",
		temp_upload: "api/temp_upload.php"
	}
};
