export const ALERT_TYPES = ['info', 'error', 'success', 'warning', 'question'];
export type AlertType = (typeof ALERT_TYPES)[number];

export const ALERT_POSITIONS = [
	'bottomRight',
	'bottomLeft',
	'topRight',
	'topLeft',
	'topCenter',
	'bottomCenter',
	'center',
];
export type AlertPosition = (typeof ALERT_POSITIONS)[number];

export interface AlertButton {
	text: string;
	callback?: () => void;
}

export interface AlertConfig {
	text?: string;
	type?: AlertType;
	position?: AlertPosition;
	icon?: string;
	class?: string;
	unique?: string;
	progress?: boolean;
	timeout?: number;
	close?: () => void;
	buttons?: AlertButton[];
}

export interface Alert extends AlertConfig {
	onClose?: () => void;
	closable?: boolean;
	component?: any;
	[x: string]: any;
}

export const DEFAULT_ALERT_CONFIG: Alert = {
	text: '',
	type: 'info',
	class: '',
	progress: true,
	position: 'bottomRight',
	timeout: 3000,
	closable: true,
	buttons: [],
};
