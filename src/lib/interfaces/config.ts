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
	database?: {
		_id?: string;
		collections?: [{
			_id?: string;
			name: string;
			opts?: {
				replace?:any;
				sort?: any;
				query?: any;
				groups?: any;
			};
			all?: [];
			by_id?: object;
			query?: object;
			groups?: object;
		}];
	};
	alert?: {
		alerts?:object;
		text?:string;
		type?: string;
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
		class?:string;
		modals?:object;
		position?: string;
		closable?: boolean;
		unique?: string;
	};
	socket?: any;
	http?: {
		replace?: any;
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