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
	socket?: any;
	url?: string;
}
export const CONFIG_TOKEN = new InjectionToken<Config>('config');
export const DEFAULT_CONFIG: Config = {
	meta: {
		useTitleSuffix: false,
		warnMissingGuard: true,
		defaults: {}
	},
	socket: false,
	url: ''
}