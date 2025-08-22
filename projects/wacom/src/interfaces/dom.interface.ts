import { ComponentRef } from '@angular/core';

/**
 * Representation of a component that has been dynamically added to the DOM.
 *
 * @template T - Type of the attached component instance.
 */
export interface DomComponent<T> {
	/** The root DOM element of the created component. */
	nativeElement: HTMLElement;
	/** Angular reference to the created component. */
	componentRef: ComponentRef<T>;
	/**
	 * Removes the component from the DOM and cleans up associated resources.
	 */
	remove: () => void;
}
