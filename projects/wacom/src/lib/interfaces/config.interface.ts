import { InjectionToken } from '@angular/core';
import { MetaConfig } from './meta.interface';
import { StoreConfig } from './store.interface';

export interface Config {
	store?: StoreConfig;
	meta?: MetaConfig;
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
	fb?: any;
	http?: {
		headers?: any;
		url?: string;
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
	firebase: false,
	http: {
		url: '',
		headers: {},
	},
	store: {
		prefix: 'waStore',
	},
};
