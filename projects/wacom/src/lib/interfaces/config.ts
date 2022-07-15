import { InjectionToken } from '@angular/core';

export interface Config {
	meta?: {
		useTitleSuffix?: boolean;
		warnMissingGuard?: boolean;
		defaults?: {
			title?: string;
			titleSuffix?: string;
		} & { [key: string]: string | undefined; };
	};
	alert?: {
		alerts?:object;
		text?:string;
		type?: string;
		icon?: string;
		class?: string;
		unique?: string;
		progress?: boolean;
		position?: string;
		timeout?: number;
		close?: any;
		buttons?: any;
	};
	modal?: {
		size?: any;
		timeout?: any;
		timestart?: any;
		class?:string;
		modals?:object;
		position?: string;
		closable?: boolean;
		unique?: string;
	};
	popup?: {
		popups?: object;
	};
	loader?: {
		loaders?: object;
	};
	socket?: any;
	http?: {
		headers?: any;
		replace?: any;
		err?: any;
		url?: string;
	}
}
export const CONFIG_TOKEN = new InjectionToken<Config>('config');
export const DEFAULT_CONFIG: Config = {
	meta: {
		useTitleSuffix: false,
		warnMissingGuard: true,
		defaults: {}
	},
	socket: false,
	http: {
		url: ''
	}
}
