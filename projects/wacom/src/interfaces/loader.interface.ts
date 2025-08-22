import { Signal, Type } from '@angular/core';

/**
 * Configuration for a button rendered inside an Loader.
 */
export interface LoaderButton {
	/** Text displayed on the button. */
	text: string;
	/** Optional click handler invoked when the button is pressed. */
	callback?: () => void;
}

/**
 * Base options that can be supplied when showing an Loader.
 */
export interface LoaderConfig {
	/** Message text displayed to the user. */
	text?: string;
	/** Optional action buttons displayed within the Loader. */
	buttons?: LoaderButton[];
	/** Custom CSS class applied to the Loader container. */
	class?: string;
	/** Identifier used to ensure only one Loader with this key exists. */
	unique?: string;
	/** Whether to show a progress bar. */
	progress?: boolean;
	/** Milliseconds before auto dismissal. */
	timeout?: number;
	/** Callback executed when the Loader is closed. */
	close?: () => void;
	closable?: boolean;
}

export interface Loader extends LoaderConfig {
	id?: number;
	progressPercentage?: Signal<number>;
	onClose?: () => void;
	append?: HTMLElement;
	component?: Type<unknown>;
	[x: string]: unknown;
}

/**
 * Default values applied when an Loader is shown without specific options.
 */
export const DEFAULT_LOADER_CONFIG: Loader = {
	text: '',
	class: '',
	progress: false,
	timeout: 0,
	closable: true,
};
