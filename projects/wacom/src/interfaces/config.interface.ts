import { InjectionToken } from '@angular/core';
import { AlertConfig } from './alert.interface';
import { HttpConfig } from './http.interface';
import { LoaderConfig } from './loader.interface';
import { MetaConfig } from './meta.interface';
import { ModalConfig } from './modal.interface';
import { StoreConfig } from './store.interface';

export interface Config {
	store?: StoreConfig;
	meta?: MetaConfig;
	alert?: AlertConfig;
	loader?: LoaderConfig;
	modal?: ModalConfig;
	http?: HttpConfig;
	socket?: any;
	io?: any;
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
