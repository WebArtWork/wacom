import { Signal, Type } from '@angular/core';

/**
 * Possible alert variants that control styling and default icons.
 */
export const ALERT_TYPES = ['info', 'error', 'success', 'warning', 'question'];
export type AlertType = (typeof ALERT_TYPES)[number];

export const ALERT_POSITIONS = [
	'topLeft',
	'top',
	'topRight',
	'left',
	'center',
	'right',
	'bottomLeft',
	'bottom',
	'bottomRight',
];
export type AlertPosition = (typeof ALERT_POSITIONS)[number];

/**
 * Configuration for a button rendered inside an alert.
 */
export interface AlertButton {
	/** Text displayed on the button. */
	text: string;
	/** Optional click handler invoked when the button is pressed. */
	callback?: () => void;
}

/**
 * Base options that can be supplied when showing an alert.
 */
export interface AlertConfig {
	/** Message text displayed to the user. */
	text?: string;
	/** One of {@link ALERT_TYPES} determining alert style. */
	type?: AlertType;
	/** Location on screen where the alert should appear. */
	position?: AlertPosition;
	/** Optional action buttons displayed within the alert. */
	buttons?: AlertButton[];
	/** Optional icon name to show with the message. */
	icon?: string;
	/** Custom CSS class applied to the alert container. */
	class?: string;
	/** Identifier used to ensure only one alert with this key exists. */
	unique?: string;
	/** Whether to show a progress bar. */
	progress?: boolean;
	/** Milliseconds before auto dismissal. */
	timeout?: number;
	/** Callback executed when the alert is closed. */
	close?: () => void;
	closable?: boolean;
}

export interface Alert extends AlertConfig {
	id?: number;
	progressPercentage?: Signal<number>;
	onClose?: () => void;
	component?: Type<unknown>;
	[x: string]: unknown;
}

/**
 * Default values applied when an alert is shown without specific options.
 */
export const DEFAULT_ALERT_CONFIG: Alert = {
	text: '',
	type: 'info',
	class: '',
	progress: true,
	position: 'bottom',
	timeout: 3000,
	closable: true,
	buttons: [],
};
