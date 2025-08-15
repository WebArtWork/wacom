import {
        ApplicationRef,
        ComponentRef,
        EmbeddedViewRef,
        EnvironmentInjector,
        Injectable,
        Type,
        createComponent,
} from '@angular/core';

export interface DomComponent<T> {
        nativeElement: HTMLElement;
        componentRef: ComponentRef<T>;
        remove: () => void;
}

@Injectable({
        providedIn: 'root',
})
export class DomService {
        private providedIn: Record<string, boolean> = {};

	constructor(
		private appRef: ApplicationRef,
		private injector: EnvironmentInjector
	) {}

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
                id: string
        ): DomComponent<T> {
		const componentRef = createComponent(component, {
			environmentInjector: this.injector,
		});

		this.projectComponentInputs(componentRef, options);

		this.appRef.attachView(componentRef.hostView);

		const domElem = (componentRef.hostView as EmbeddedViewRef<T>)
			.rootNodes[0] as HTMLElement;

		const element = document.getElementById(id);

		if (element && typeof element.appendChild === 'function') {
			element.appendChild(domElem);
		}

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
                element: HTMLElement = document.body
        ): DomComponent<T> | void {
		if (options.providedIn) {
			if (this.providedIn[options.providedIn]) {
				return;
			}

			this.providedIn[options.providedIn] = true;
		}

		const componentRef = createComponent(component, {
			environmentInjector: this.injector,
		});

		this.projectComponentInputs(componentRef, options);

		this.appRef.attachView(componentRef.hostView);

		const domElem = (componentRef.hostView as EmbeddedViewRef<T>)
			.rootNodes[0] as HTMLElement;

		if (element && typeof element.appendChild === 'function') {
			element.appendChild(domElem);
		}

                return {
                        nativeElement: domElem,
                        componentRef: componentRef,
                        remove: () =>
                                this.removeComponent(
                                        componentRef,
                                        options.providedIn
                                ),
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
		options: Partial<T> = {}
	): ComponentRef<T> {
		const componentRef = createComponent(component, {
			environmentInjector: this.injector,
		});

		this.projectComponentInputs(componentRef, options);

		this.appRef.attachView(componentRef.hostView);

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
                options: Partial<T>
	): ComponentRef<T> {
		if (options) {
			const props = Object.getOwnPropertyNames(options);

			for (const prop of props) {
				(component.instance as any)[prop] = (options as any)[prop];
			}
		}

                return component;
        }

        removeComponent<T>(
                componentRef: ComponentRef<T>,
                providedIn?: string
        ): void {
                this.appRef.detachView(componentRef.hostView);
                componentRef.destroy();
                if (providedIn) {
                        delete this.providedIn[providedIn];
                }
        }
}
