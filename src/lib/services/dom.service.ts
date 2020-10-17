import {
	Injectable,
	Injector,
	ComponentFactoryResolver,
	ComponentRef,
	EmbeddedViewRef,
	ApplicationRef
} from '@angular/core';

@Injectable({
	providedIn: 'root'
})
export class DomService {
	constructor(private componentFactoryResolver: ComponentFactoryResolver,
		private appRef: ApplicationRef,
		private injector: Injector) { }
	/**
	* Appends a component to body currently
	*/
		appendById(component: any, options: any = {}, id) {
			const componentRef = this.componentFactoryResolver.resolveComponentFactory(component).create(this.injector);
			this.projectComponentInputs(componentRef, options);
			this.appRef.attachView(componentRef.hostView);
			const domElem = (componentRef.hostView as EmbeddedViewRef<any>).rootNodes[0] as HTMLElement;
			let element = document.getElementById(id);
			if(element){
				element.appendChild(domElem);
			}
			return domElem;
		}
	/**
	* Appends a component to body currently
	*/
		private providedIn:any = {};
		appendComponent(component: any, options: any = {}, element = document.body) {
			if(options.providedIn){
				if(this.providedIn[options.providedIn]) return;
				this.providedIn[options.providedIn] = true;
			}
			const componentRef = this.componentFactoryResolver.resolveComponentFactory(component).create(this.injector);
			this.projectComponentInputs(componentRef, options);
			this.appRef.attachView(componentRef.hostView);
			const domElem = (componentRef.hostView as EmbeddedViewRef<any>).rootNodes[0] as HTMLElement;
			element.appendChild(domElem);
			return domElem;
		}
	/**
	* Projects the inputs onto the component
	*/
		projectComponentInputs(component: ComponentRef<any>, options: any): ComponentRef<any> {
			if(options) {
				const props = Object.getOwnPropertyNames(options);
				for(const prop of props) {
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