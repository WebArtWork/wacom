import { InjectionToken } from '@angular/core';
import { AlertConfig } from './alert.interface';
import { HttpConfig } from './http.interface';
import { LoaderConfig } from './loader.interface';
import { MetaConfig } from './meta.interface';
import { ModalConfig } from './modal.interface';
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
	/** Global settings for the alert service. */
	alert?: AlertConfig;
	/** Default options for loader overlays. */
	loader?: LoaderConfig;
	/** Configuration for modal dialogs. */
	modal?: ModalConfig;
	/** Base HTTP settings such as API URL and headers. */
	http?: HttpConfig;
	/** Optional socket connection configuration. */
	socket?: any;
	/** Raw Socket.IO client instance, if used. */
	io?: any;
	theme?: {
		primary: string;
		secondary: string;
		info: string;
		error: string;
		success: string;
		warning: string;
		question: string;
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
	theme: {
		primary: '#fff',
		secondary: '#000',
		info: '#9ddeff',
		error: '#ffafb4',
		success: '#a6efb8',
		warning: '#ffcfa5',
		question: '#fff9b2',
	},
};
