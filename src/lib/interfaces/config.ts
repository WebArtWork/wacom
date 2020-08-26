import { InjectionToken } from '@angular/core';

export interface Config {
	socket: any,
	url: string
}
export const CONFIG_TOKEN = new InjectionToken<Config>('config');
export const DEFAULT_CONFIG: Config = {
	socket: false,
	url: ''
}