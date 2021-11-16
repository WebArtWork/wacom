import { InjectionToken } from '@angular/core';

export interface Modal {
	onOpen?: any;
	onClose?: any;
	onClickOutside?: any;
	id?: number;
	close?: any;
	component?: any;
	size?: any;
	timeout?: any;
	timestart?: any;
	class?:string;
	modals?:object;
	position?: string;
	closable?: boolean;
	unique?: string;
	[x: string]: any;
}
export const DEFAULT_Modal: Modal = {
	size: 'mid',
	timeout: 0,
	timestart: 0,
	class: '',
	modals: {},
	position: 'tc',
	closable: true
}