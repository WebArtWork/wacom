import { InjectionToken } from '@angular/core';
import { Meta } from './meta.interface';

export interface Config {
	meta?: Meta;
	alert?: {
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
		position?: string;
		closable?: boolean;
		unique?: string;
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
		defaults: { links: {} },
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
