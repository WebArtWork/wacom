import {
    Injectable,
    Injector,
    ComponentFactoryResolver,
    EmbeddedViewRef,
    ApplicationRef,
    ComponentRef
} from '@angular/core';
import { ModalComponent } from '../components/modal/modal.component';


@Injectable({
  providedIn: 'root'
})
export class ModalService {
  
  constructor(
      private componentFactoryResolver: ComponentFactoryResolver,
      private appRef: ApplicationRef,
      private injector: Injector
  ) { }
  private data = {};
  private last;
  open(component: any, obj:any = {}) {
    if(!obj.id) obj.id = new Date().getTime();

    // Create a component reference from the component 
    const componentRef = this.componentFactoryResolver
      .resolveComponentFactory(component)
      .create(this.injector);
    // Attach component to the appRef so that it's inside the ng component tree
    this.appRef.attachView(componentRef.hostView)    
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
    // Append DOM element to the body
    document.body.appendChild(domElem);
    // Append DcontentElemOM element to the body
    domElem.querySelector("#modalHoster").appendChild(contentElem);
    // Wait some time and remove it from the component tree and from the DOM

    this.data[obj.id]={
      appRef:this.appRef,
      componentRefer:componentRefer
    }
    this.last=obj;
    return obj.id;
        
  }
  pull(){
    return this.last;
  }
  close(id){
    this.data[id].appRef.detachView(this.data[id].componentRefer.hostView);
  }

}
