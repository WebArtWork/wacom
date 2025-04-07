import { InjectionToken } from '@angular/core';
export interface Any {
	[key: string]: string;
}
export interface Config {
	meta?: {
		useTitleSuffix?: boolean;
		warnMissingGuard?: boolean;
		defaults?: {
			title?: string;
			titleSuffix?: string;
		} & { [key: string]: string | undefined };
	};
	alert?: {
		alerts?: object;
		text?: string;
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
		class?: string;
		modals?: object;
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
	io?: any;
	http?: {
		headers?: any;
		url?: string;
	};
	store?: {
		prefix?: string;
		set?: (
			hold: any,
			value: any,
			cb?: () => void,
			errCb?: () => void
		) => Promise<boolean>;
		get?: (
			hold: any,
			cb?: (value: string) => void,
			errCb?: () => void
		) => Promise<string>;
		remove?: (
			hold: any,
			cb?: () => void,
			errCb?: () => void
		) => Promise<boolean>;
		clear?: (cb?: () => void, errCb?: () => void) => Promise<boolean>;
	};
}
export const CONFIG_TOKEN = new InjectionToken<Config>('config');
export const DEFAULT_CONFIG: Config = {
	meta: {
		useTitleSuffix: false,
		warnMissingGuard: true,
		defaults: {},
	},
	socket: false,
	http: {
		url: '',
		headers: {},
	},
	store: {
		prefix: '',
	},
};
