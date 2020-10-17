import { InjectionToken } from '@angular/core';

export interface Loader {
	loaders?:object;
	component?: any;
	text?:string;
	class?: string;
	progress?: boolean;
	timeout?: number;
}
export const DEFAULT_Alert: Loader = {
	loaders: {},
	text: 'Hello World',
	class: '',
	progress: true,
	timeout: 5000,
}