import { InjectionToken } from '@angular/core';

export interface Loader {
	onClose?: any;
	loaders?: object;
	component?: any;
	append?: any;
	text?: string;
	class?: string;
	progress?: boolean;
	timeout?: number;
	closable?: boolean;
	close?: any;
	[x: string]: any;
}
export const DEFAULT_Alert: Loader = {
	loaders: {},
	text: '',
	class: '',
	progress: true,
	timeout: 5000,
};
