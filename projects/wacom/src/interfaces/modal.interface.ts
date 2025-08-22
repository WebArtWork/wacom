import { Signal, Type } from '@angular/core';

export const MODAL_SIZES = ['small', 'mid', 'big', 'full'];
export type ModalSizes = (typeof MODAL_SIZES)[number];

/**
 * Configuration for a button rendered inside an modal.
 */
export interface ModalButton {
	/** Text displayed on the button. */
	text: string;
	/** Optional click handler invoked when the button is pressed. */
	callback?: () => void;
}

export interface ModalConfig {
	size?: ModalSizes;
	/** Optional action buttons displayed within the Modal. */
	buttons?: ModalButton[];
	/** Custom CSS class applied to the Modal container. */
	class?: string;
	/** Identifier used to ensure only one Modal with this key exists. */
	unique?: string;
	/** Whether to show a progress bar. */
	progress?: boolean;
	/** Milliseconds before auto dismissal. */
	timeout?: number;
	/** Callback executed when the Modal is closed. */
	close?: () => void;
	closable?: boolean;
}

export interface Modal extends ModalConfig {
	component: Type<unknown>;
	id?: number;
	progressPercentage?: Signal<number>;
	onClickOutside?: () => void;
	onClose?: () => void;
	onOpen?: () => void;
	[x: string]: unknown;
}

export const DEFAULT_MODAL_CONFIG: ModalConfig = {
	size: 'mid',
	timeout: 0,
	class: '',
	closable: true,
};
