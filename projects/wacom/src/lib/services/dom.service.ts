import {
	ApplicationRef,
	ComponentFactoryResolver,
	ComponentRef,
	EmbeddedViewRef,
	Injectable,
	Injector,
} from '@angular/core';

@Injectable({
	providedIn: 'root',
})
export class DomService {
	private providedIn: Record<string, boolean> = {};

	constructor(
		private componentFactoryResolver: ComponentFactoryResolver,
		private appRef: ApplicationRef,
		private injector: Injector
	) {}

	/**
	 * Appends a component to a specified element by ID.
	 *
	 * @param component - The component to append.
	 * @param options - The options to project into the component.
	 * @param id - The ID of the element to append the component to.
	 * @returns An object containing the native element and the component reference.
	 */
	appendById(
		component: any,
		options: any = {},
		id: string
	): { nativeElement: HTMLElement; componentRef: ComponentRef<any> } {
		const componentRef = this.componentFactoryResolver
			.resolveComponentFactory(component)
			.create(this.injector);

		this.projectComponentInputs(componentRef, options);
		this.appRef.attachView(componentRef.hostView);
		const domElem = (componentRef.hostView as EmbeddedViewRef<any>)
			.rootNodes[0] as HTMLElement;
		const element = document.getElementById(id);
		if (element && typeof element.appendChild === 'function') {
			element.appendChild(domElem);
		}
		return {
			nativeElement: domElem,
			componentRef: componentRef,
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
	appendComponent(
		component: any,
		options: any = {},
		element: HTMLElement = document.body
	): { nativeElement: HTMLElement; componentRef: ComponentRef<any> } | void {
		if (options.providedIn) {
			if (this.providedIn[options.providedIn]) {
				return;
			}
			this.providedIn[options.providedIn] = true;
		}

		const componentRef = this.componentFactoryResolver
			.resolveComponentFactory(component)
			.create(this.injector);
		this.projectComponentInputs(componentRef, options);
		this.appRef.attachView(componentRef.hostView);
		const domElem = (componentRef.hostView as EmbeddedViewRef<any>)
			.rootNodes[0] as HTMLElement;
		if (element && typeof element.appendChild === 'function') {
			element.appendChild(domElem);
		}
		return {
			nativeElement: domElem,
			componentRef: componentRef,
		};
	}

	/**
	 * Gets a reference to a dynamically created component.
	 *
	 * @param component - The component to create.
	 * @param options - The options to project into the component.
	 * @returns The component reference.
	 */
	getComponentRef(component: any, options: any = {}): ComponentRef<any> {
		const componentRef = this.componentFactoryResolver
			.resolveComponentFactory(component)
			.create(this.injector);

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
	private projectComponentInputs(
		component: ComponentRef<any>,
		options: any
	): ComponentRef<any> {
		if (options) {
			const props = Object.getOwnPropertyNames(options);
			for (const prop of props) {
				component.instance[prop] = options[prop];
			}
		}
		return component;
	}
}

/*
https://stackoverflow.com/questions/39857222/angular2-dynamic-component-injection-in-root/40687392#40687392
https://gist.github.com/reed-lawrence/1f6b7c328ad3886e60dc2b0adcf75a97
*/
