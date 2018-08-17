import {
    Injectable,
    Injector,
    ComponentFactoryResolver,
    EmbeddedViewRef,
    ApplicationRef,
    ComponentRef
} from '@angular/core';
import { ModalComponent } from '../components/modal.component';

@Injectable({
  providedIn: 'root'
})
export class ModalService {
  
  constructor(
      private componentFactoryResolver: ComponentFactoryResolver,
      private appRef: ApplicationRef,
      private injector: Injector
  ) { }
  
  appendComponentToBody(component: any) {
    // Create a component reference from the component 
    const componentRef = this.componentFactoryResolver
      .resolveComponentFactory(component)
      .create(this.injector);
    
    // Attach component to the appRef so that it's inside the ng component tree
    this.appRef.attachView(componentRef.hostView);
    
    // Get DOM element from component
    const contentElem = (componentRef.hostView as EmbeddedViewRef<any>)
      .rootNodes[0] as HTMLElement;
    
         // Create a component reference from the component 
    let componentRefer = this.componentFactoryResolver
      .resolveComponentFactory(ModalComponent)
      .create(this.injector);
    
    // Attach component to the appRef so that it's inside the ng component tree
    this.appRef.attachView(componentRefer.hostView);
    
    // Get DOM element from component
    const domElem = (componentRefer.hostView as EmbeddedViewRef<any>)
      .rootNodes[0] as HTMLElement;
    

    domElem.appendChild(contentElem);

    // Append DOM element to the body
    document.body.appendChild(domElem);
    
    // Wait some time and remove it from the component tree and from the DOM
   /* setTimeout(() => {
        this.appRef.detachView(componentRef.hostView);
        componentRef.destroy();
    }, 3000);*/
  }
}