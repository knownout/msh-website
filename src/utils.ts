export function getTextTime (rawDate: Date | string | number) {
	const date = new Date(rawDate);
	let monthName = configuration.monthsName[date.getMonth()];

	let lastCharacter = monthName.slice(-1);
	monthName = monthName.slice(0, -1);

	if (lastCharacter == "т") lastCharacter = "а";
	else lastCharacter = "я";

	monthName = monthName + lastCharacter;

	return `${date.getDate()} ${monthName} ${date.getFullYear()}`;
}

export function setLeadingZeros (number: number, length: number = 2) {
	let content = String(number);

	if (content.length < length) content = Array(length - content.length).fill("0").join("") + content;
	return content;
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
		get_info_content: "api/articles.php?action=get&type=info&path=",
		POST_upload_article: "api/upload.php",
		server_path: "http://192.168.100.170/",
		fetch_title_page: "api/fetch-title-page-data.php",
		authorization: "api/auth.php?login=",
		temp_upload: "api/temp_upload.php",
		get_image: "api/image.php?parent="
	}
};
