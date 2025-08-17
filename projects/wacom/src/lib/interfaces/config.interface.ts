import { InjectionToken } from '@angular/core';
import { AlertConfig } from './alert.interface';
import { MetaConfig } from './meta.interface';
import { StoreConfig } from './store.interface';

export interface Config {
	store?: StoreConfig;
	meta?: MetaConfig;
	alert?: AlertConfig;
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
	store: {
		prefix: 'waStore',
	},
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
};
