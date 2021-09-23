import React from "react";
import "./auth-form.less";
import { TAccountAuthData, TAuthRequestResult } from "../cms";
import CryptoJS from "crypto-js";

interface IAuthFormProps {
	updateAuthState({ authState, accountLevel, fullName }: TAccountAuthData): void;
	verification({ login, hash }: { login: string; hash: string }): Promise<TAuthRequestResult>;
}

export default function AuthForm ({ updateAuthState, verification }: IAuthFormProps) {
	const attributesList = {
		login: {
			type: "text",
			placeholder: "Логин пользователя",
			tabIndex: 1,
			ref: React.createRef<HTMLInputElement>()
		},

		password: {
			type: "password",
			placeholder: "Пароль",
			tabIndex: 2,
			ref: React.createRef<HTMLInputElement>()
		},

		shared: { maxLength: 20, required: true }
	};

	const shakeSubmitButton = (button: HTMLElement) => {
		setTimeout(() => button.classList.remove("fail"), 310);
		button.classList.add("fail");

		const element = attributesList.login.ref.current;
		if (element) element.focus();
		button.classList.remove("wait");
	};

	const submitAuthData = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
		const target = event.target as HTMLElement;
		target.classList.add("wait");

		const [ login, password ] = [ attributesList.login, attributesList.password ].map(
			e => (e.ref.current ? e.ref.current.value.trim() : String())
		);

		if (!login || !password) return shakeSubmitButton(target);
		verification({ login, hash: CryptoJS.MD5(password).toString() }).then(result => {
			if (result.success) {
				localStorage.setItem("cmsAccountData", `${login};${password}`);
				updateAuthState({ authState: true, ...result.meta });
			} else shakeSubmitButton(target);
		});

		target.classList.remove("wait");
	};

	return (
		<div id="auth-form" className="form content-block column no-centering">
			<span className="form-title">Авторизация</span>
			<div className="form-content content-block column nowrap no-centering">
				<input {...attributesList.login} {...attributesList.shared} />
				<input {...attributesList.password} {...attributesList.shared} />
				<div className="form-submit button" tabIndex={3} onClick={submitAuthData}>
					Подтвердить
				</div>
			</div>
		</div>
	);
}
