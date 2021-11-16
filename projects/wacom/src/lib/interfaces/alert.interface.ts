import { InjectionToken } from '@angular/core';

export interface Alert {
	onClose?: any;
	alerts?:object;
	component?: any;
	text?:string;
	icon?:string;
	type?: string;
	class?: string;
	unique?: string;
	progress?: boolean;
	position?: string;
	timeout?: any;
	closable?: boolean;
	close?: any;
	buttons?: any;
	[x: string]: any;
}
export const DEFAULT_Alert: Alert = {
	alerts: {},
	text: '',
	type: 'info',
	class: '',
	progress: true,
	position: 'bottomRight',
	timeout: 5000,
	closable: true,
	buttons: []
}
