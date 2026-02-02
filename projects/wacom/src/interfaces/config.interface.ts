import { InjectionToken } from '@angular/core';
import { MetaConfig } from '../meta/meta.interface';
import { HttpConfig } from './http.interface';
import { NetworkConfig } from './network.interface';
import { StoreConfig } from './store.interface';

/**
 * Root configuration object used to initialize the library.
 * Each property allows consumers to override the default
 * behavior of the corresponding service.
 */
export interface Config {
	/** Options for the key‑value storage service. */
	store?: StoreConfig;
	/** Defaults applied to page metadata handling. */
	meta?: MetaConfig;
	/** Base HTTP settings such as API URL and headers. */
	http?: HttpConfig;
	/** Optional socket connection configuration. */
	socket?: any;
	/** Raw Socket.IO client instance, if used. */
	io?: any;
	network?: NetworkConfig;
}

export const CONFIG_TOKEN = new InjectionToken<Config>('config');

export const DEFAULT_CONFIG: Config = {
	store: {
		prefix: 'waStore',
	},
	meta: {
		useTitleSuffix: false,
		defaults: { links: {} },
	},
	socket: false,
	http: {
		url: '',
		headers: {},
	},
};
