import {
	ApplicationRef,
	ComponentRef,
	EmbeddedViewRef,
	EnvironmentInjector,
	Injectable,
	Type,
	createComponent,
	inject,
} from '@angular/core';
import { DomComponent } from '../interfaces/dom.interface';

@Injectable({
	providedIn: 'root',
})
/**
 * Utility service for programmatically creating and interacting with Angular
 * components within the DOM.
 */
export class DomService {
	/**
	 * Appends a component to a specified element by ID.
	 *
	 * @param component - The component to append.
	 * @param options - The options to project into the component.
	 * @param id - The ID of the element to append the component to.
	 * @returns An object containing the native element and the component reference.
	 */
	appendById<T>(
		component: Type<T>,
		options: Partial<T> = {},
		id: string,
	): DomComponent<T> {
		const componentRef = createComponent(component, {
			environmentInjector: this._injector,
		});

		this.projectComponentInputs(componentRef, options);

		this._appRef.attachView(componentRef.hostView);

		const domElem = (componentRef.hostView as EmbeddedViewRef<T>)
			.rootNodes[0] as HTMLElement;

		const element = document.getElementById(id);

		if (element && typeof element.appendChild === 'function') {
			element.appendChild(domElem);
		}

		componentRef.changeDetectorRef.detectChanges();

		return {
			nativeElement: domElem,
			componentRef: componentRef,
			remove: () => this.removeComponent(componentRef),
		};
	}

	/**
	 * Appends a component to a specified element or to the body.
	 *
	 * @param component - The component to append.
	 * @param options - The options to project into the component.
	 * @param element - The element to append the component to. Defaults to body.
	 * @returns An object containing the native element and the component reference.
	 */
	appendComponent<T>(
		component: Type<T>,
		options: Partial<T & { providedIn?: string }> = {},
		element: HTMLElement = document.body,
	): DomComponent<T> | void {
		if (options.providedIn) {
			if (this._providedIn[options.providedIn]) {
				return;
			}

			this._providedIn[options.providedIn] = true;
		}

		const componentRef = createComponent(component, {
			environmentInjector: this._injector,
		});

		this.projectComponentInputs(componentRef, options);

		this._appRef.attachView(componentRef.hostView);

		const domElem = (componentRef.hostView as EmbeddedViewRef<T>)
			.rootNodes[0] as HTMLElement;

		if (element && typeof element.appendChild === 'function') {
			element.appendChild(domElem);
		}

		componentRef.changeDetectorRef.detectChanges();

		return {
			nativeElement: domElem,
			componentRef: componentRef,
			remove: () =>
				this.removeComponent(componentRef, options.providedIn),
		};
	}

	/**
	 * Gets a reference to a dynamically created component.
	 *
	 * @param component - The component to create.
	 * @param options - The options to project into the component.
	 * @returns The component reference.
	 */
	getComponentRef<T>(
		component: Type<T>,
		options: Partial<T> = {},
	): ComponentRef<T> {
		const componentRef = createComponent(component, {
			environmentInjector: this._injector,
		});

		this.projectComponentInputs(componentRef, options);

		this._appRef.attachView(componentRef.hostView);

		componentRef.changeDetectorRef.detectChanges();

		return componentRef;
	}

	/**
	 * Projects the inputs onto the component.
	 *
	 * @param component - The component reference.
	 * @param options - The options to project into the component.
	 * @returns The component reference with the projected inputs.
	 */
	private projectComponentInputs<T>(
		component: ComponentRef<T>,
		options: Partial<T>,
	): ComponentRef<T> {
		if (options) {
			const props = Object.getOwnPropertyNames(options);

			for (const prop of props) {
				(component.instance as any)[prop] = (options as any)[prop];
			}
		}

		return component;
	}

	/**
	 * Removes a previously attached component and optionally clears its
	 * unique `providedIn` flag.
	 *
	 * @param componentRef - Reference to the component to be removed.
	 * @param providedIn - Optional key used to track unique instances.
	 */
	removeComponent<T>(
		componentRef: ComponentRef<T>,
		providedIn?: string,
	): void {
		this._appRef.detachView(componentRef.hostView);

		componentRef.destroy();

		if (providedIn) {
			delete this._providedIn[providedIn];
		}
	}

	/** Reference to the root application used for view attachment. */
	private _appRef = inject(ApplicationRef);

	/** Injector utilized when creating dynamic components. */
	private _injector = inject(EnvironmentInjector);

	/**
	 * Flags to ensure components with a specific `providedIn` key are only
	 * instantiated once at a time.
	 */
	private _providedIn: Record<string, boolean> = {};
}
