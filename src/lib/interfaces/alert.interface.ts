import { InjectionToken } from '@angular/core';

export interface Alert {
	alerts?:object;
	component?: any;
	text?:string;
	type?: string;
	class?: string;
	unique?: string;
	progress?: boolean;
	position?: string;
	timeout?: number;
	closable?: boolean;
	close?: any;
	buttons?: any;
}
export const DEFAULT_Alert: Alert = {
	alerts: {},
	text: 'Hello World',
	type: 'info',
	class: '',
	progress: true,
	position: 'bottomRight',
	timeout: 5000,
	closable: true,
	buttons: []
}