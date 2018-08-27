import {
    Injectable,
    Injector,
    ComponentFactoryResolver,
    EmbeddedViewRef,
    ApplicationRef,
    ComponentRef
} from '@angular/core';
import { InputComponent } from '../components/input/input.component';
@Injectable({
	providedIn: 'root'
})
export class FileService {
	
  constructor(
      private componentFactoryResolver: ComponentFactoryResolver,
      private appRef: ApplicationRef,
      private injector: Injector
  ) { }

	add(opts,cb){

		 const componentRef = this.componentFactoryResolver
      	.resolveComponentFactory(InputComponent)
      	.create(this.injector);
    	// Attach component to the appRef so that it's inside the ng component tree
    	this.appRef.attachView(componentRef.hostView)    
    	// Get DOM element from component
    	const input = (componentRef.hostView as EmbeddedViewRef<any>)
      	.rootNodes[0] as HTMLElement;

		document.body.appendChild(input);
	}
}
