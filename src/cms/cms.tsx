import React from "react";
import { configuration } from "../utils";
import "./cms.less";

import CryptoJS from "crypto-js";
import AuthForm from "./auth-form/auth-form";
import MainForm from "./main-form/main-form";

export type TAccountAuthData = {
	authState: boolean;
	accountLevel?: number;
	fullName?: string;
};

export type TAuthRequestResult = {
	success: boolean;
	meta: {
		accountLevel: number;
		fullName: string;
	};
};

interface IProps {}
interface IState {
	accountAuthData: TAccountAuthData;
}

export const AccountDataContext = React.createContext<TAccountAuthData>({
	authState: false
});

export default class CMS extends React.PureComponent<IProps, IState> {
	public readonly state: IState = { accountAuthData: { authState: false } };
	public constructor (props: IProps) {
		super(props);
		this.updateAuthState = this.updateAuthState.bind(this);
	}

	private updateAuthState ({ authState, accountLevel, fullName }: TAccountAuthData) {
		if (authState === false) localStorage.removeItem("cmsAccountData");
		this.setState({ accountAuthData: { authState, accountLevel, fullName } });
	}

	private readonly authDataVerification = async ({ login, hash }: { login: string; hash: string }) => {
		const resultContent = await fetch(
			configuration.api.server_path + configuration.api.authorization + login + "&hash=" + hash
		).then(req => req.json());

		return resultContent as TAuthRequestResult;
	};

	public componentDidMount () {
		const storageKey = localStorage.getItem("cmsAccountData");
		if (!storageKey) return;

		const [ login, password ] = storageKey.split(";");
		this.authDataVerification({ login, hash: CryptoJS.MD5(password).toString() }).then(result => {
			if (!result.success) return localStorage.removeItem("cmsAccountData");
			this.updateAuthState({ authState: true, ...result.meta });
		});
	}

	public render () {
		return (
			<div id="cms-root" className="content-block nowrap w-100 h-100">
				<AccountDataContext.Provider value={this.state.accountAuthData}>
					{this.state.accountAuthData.authState ? (
						<MainForm updateAuthState={this.updateAuthState} />
					) : (
						<AuthForm updateAuthState={this.updateAuthState} verification={this.authDataVerification} />
					)}
				</AccountDataContext.Provider>
			</div>
		);
	}
}
