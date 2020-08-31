import { InjectionToken } from '@angular/core';

export interface Alert {
	text:string;
	type?: string;
	unique?: string;
	progress?: boolean;
	position?: string; // [bottomRight, bottomLeft, topRight, topLeft, topCenter, bottomCenter or center]
	timeout?: number;
	close?: any;
	buttons?: any; /*[{text,or,html, callback}]*/
}
export const DEFAULT_Alert: Alert = {
	text: 'Hello World',
	type: 'info',
	progress: true,
	position: 'bottomRight',
	timeout: 5000,
	close: true,
	buttons: []
}