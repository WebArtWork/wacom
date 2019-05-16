import {
	Injectable,
	Injector,
	ComponentFactoryResolver,
	EmbeddedViewRef,
	ApplicationRef,
	ComponentRef
} from '@angular/core';
//import { SpinnerComponent } from '../components/spinner/spinner.component';


@Injectable({
	providedIn: 'root'
})
export class SpinnerService {
	/*
	constructor(
			private componentFactoryResolver: ComponentFactoryResolver,
			private appRef: ApplicationRef,
			private injector: Injector
	) { }
	private data = {};
	open(component: any = null, obj:any = {}) {
		if(!component) component = SpinnerComponent;
		if(!obj.id) obj.id = new Date().getTime();

		// Create a component reference from the component 
		let componentRefer = this.componentFactoryResolver
			.resolveComponentFactory(component)
			.create(this.injector);
		// Attach component to the appRef so that it's inside the ng component tree
		this.appRef.attachView(componentRefer.hostView);
		// Get DOM element from component
		const domElem = (componentRefer.hostView as EmbeddedViewRef<any>)
			.rootNodes[0] as HTMLElement;
		// Append DOM element to the body
		document.body.appendChild(domElem);
		// Wait some time and remove it from the component tree and from the DOM

		this.data[obj.id]={
			appRef:this.appRef,
			componentRefer:componentRefer
		}
		return obj.id;
				
	}
	close(id){
		this.data[id].appRef.detachView(this.data[id].componentRefer.hostView);
	}
	*/
}
