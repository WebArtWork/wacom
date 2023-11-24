import {
	Injectable,
	Injector,
	ComponentFactoryResolver,
	ComponentRef,
	EmbeddedViewRef,
	ApplicationRef,
	ViewContainerRef
} from '@angular/core';
import { CoreService } from './core.service';
@Injectable({
	providedIn: 'root',
})
export class DomService {
	constructor(
		private componentFactoryResolver: ComponentFactoryResolver,
		private viewContainerRef: ViewContainerRef,
		private appRef: ApplicationRef,
		private injector: Injector,
		private core: CoreService
	) { }

	/**
	 * Appends a component to body currently
	 */
	appendById(component: any, options: any = {}, id: any) {
		const componentRef = this.viewContainerRef.createComponent(component);
		// const componentRef = this.componentFactoryResolver
		// 	.resolveComponentFactory(component)
		// 	.create(this.injector);
		this.projectComponentInputs(componentRef, options);
		this.appRef.attachView(componentRef.hostView);
		const domElem = (componentRef.hostView as EmbeddedViewRef<any>)
			.rootNodes[0] as HTMLElement;
		let element = this.core.document.getElementById(id);
		if (element && typeof element.appendChild == 'function') {
			element.appendChild(domElem);
		}
		return {
			nativeElement: domElem,
			componentRef: componentRef,
		};
	}

	/**
	 * Appends a component to body currently
	 */
	private providedIn: any = {};
	appendComponent(
		component: any,
		options: any = {},
		element = this.core.document.body
	) {
		if (options.providedIn) {
			if (this.providedIn[options.providedIn]) return;
			this.providedIn[options.providedIn] = true;
		}
		const componentRef = this.viewContainerRef.createComponent(component);
		// const componentRef = this.componentFactoryResolver
		// 	.resolveComponentFactory(component)
		// 	.create(this.injector);
		this.projectComponentInputs(componentRef, options);
		this.appRef.attachView(componentRef.hostView);
		const domElem = (componentRef.hostView as EmbeddedViewRef<any>)
			.rootNodes[0] as HTMLElement;
		if (element && typeof element.appendChild == 'function') {
			element.appendChild(domElem);
		}
		return {
			nativeElement: domElem,
			componentRef: componentRef,
		};
	}

	/**
	 * get a Component Ref
	 */
	getComponentRef(
		component: any,
		options: any = {}
	) {
		const componentRef = this.componentFactoryResolver
			.resolveComponentFactory(component)
			.create(this.injector);

		this.projectComponentInputs(componentRef, options);

		this.appRef.attachView(componentRef.hostView);

		return componentRef;
	}

	/**
	 * Projects the inputs onto the component
	 */
	projectComponentInputs(
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
	/*
	 *	End of Dom Service
	 */
}

/*
https://stackoverflow.com/questions/39857222/angular2-dynamic-component-injection-in-root/40687392#40687392
https://gist.github.com/reed-lawrence/1f6b7c328ad3886e60dc2b0adcf75a97
*/
