import {
    Injectable,
    Injector,
    ComponentFactoryResolver,
    EmbeddedViewRef,
    ApplicationRef,
    ComponentRef,
    ViewChild
} from '@angular/core';
import { PopComponent } from '../components/pop/pop.component';

@Injectable({
	providedIn: 'root'
})
export class PopupService {
       constructor(
        private componentFactoryResolver:ComponentFactoryResolver,
        private appRef: ApplicationRef,
        private injector: Injector
        ) { }
  private data = {};
  private last;
  private event;
  private config;
  private pops;
  private left;
  private top;

  addToBody(event, component: any = null, obj:any = {}) {
    if(!obj.id) obj.id = new Date().getTime();
    if(!component) component = PopComponent;
    // Create a component reference from the component 
    let componentRefer = this.componentFactoryResolver
      .resolveComponentFactory(PopComponent)
      .create(this.injector);
    // Attach component to the appRef so that it's inside the ng component tree
    this.appRef.attachView(componentRefer.hostView);
    // Get DOM element from component
    const domElem = (componentRefer.hostView as EmbeddedViewRef<any>)
      .rootNodes[0] as HTMLElement;
    // Append DOM element to the body
    document.body.appendChild(domElem);

    this.data[obj.id]={
      appRef:this.appRef,
      componentRefer:componentRefer
    }
    this.last=obj;
    this.event = event;


    return obj.id;   
  }

  pull(){
    return this.last;
  }
  close(id){
    this.data[id].appRef.detachView(this.data[id].componentRefer.hostView);
  }
  open(pops, config){
        this.pops = pops;
        this.config = config;

        switch(this.config.pos){
          case 'rt':
            this.left = this.event.clientX-this.event.offsetX + this.event.target.offsetWidth;
            this.top = this.event.clientY-this.event.offsetY - (this.event.target.offsetHeight*2);
            break;
          case 'r':
            this.left = this.event.clientX-this.event.offsetX + this.event.target.offsetWidth;
            this.top = this.event.clientY-this.event.offsetY - (this.event.target.offsetHeight/2);
            break;
          case 'rb':
            this.left = this.event.clientX-this.event.offsetX + this.event.target.offsetWidth;
            this.top = this.event.clientY-this.event.offsetY + this.event.target.offsetHeight;
            break;
          case 'b':
            this.left = this.event.clientX-this.event.offsetX + (this.event.target.offsetWidth/2) - (this.pops.nativeElement.offsetWidth/2);
            this.top = this.event.clientY-this.event.offsetY + this.event.target.offsetHeight;
            break;
          case 'lb':
            this.left = this.event.clientX-this.event.offsetX - this.pops.nativeElement.offsetWidth;
            this.top = this.event.clientY-this.event.offsetY + this.event.target.offsetHeight;
            break;
          case 'l':
            this.left = this.event.clientX-this.event.offsetX - this.pops.nativeElement.offsetWidth;
            this.top = this.event.clientY-this.event.offsetY - (this.event.target.offsetHeight/2);
            break;
          case 'lt':
            this.left = this.event.clientX-this.event.offsetX - this.pops.nativeElement.offsetWidth;
            this.top = this.event.clientY-this.event.offsetY - (this.event.target.offsetHeight*2);
            break;
          case 't':
            this.left = this.event.clientX-this.event.offsetX + (this.event.target.offsetWidth/2) - (this.pops.nativeElement.offsetWidth/2);
            this.top = this.event.clientY-this.event.offsetY - this.pops.nativeElement.offsetHeight;
            break;
          default: this.default();
        }
        if(this.left&&this.top){
          return [this.left,this.top];
        }
        
      }

   default(){

      let top = this.event.clientY-this.event.offsetY>this.pops.nativeElement.offsetHeight;
      
      let left = this.event.clientX-this.event.offsetX>this.pops.nativeElement.offsetWidth;
      
      let bottom = document.documentElement.clientHeight-((this.event.clientX-this.event.offsetX)+this.event.target.offsetHeight)>this.pops.nativeElement.offsetHeight;
      
      let right = document.documentElement.clientWidth-((this.event.clientX-this.event.offsetX)+this.event.target.offsetWidth)>this.pops.nativeElement.offsetWidth;
      console.log(top);
      console.log(left);
      console.log(bottom);
      console.log(right);

      if(left&&top){
        this.config.pos = 'lt';
      } else if(right&&top) {
        this.config.pos = 'rt';
      } else if(right&&bottom) {
        this.config.pos = 'rb';
      } else if(left&&bottom) {
        this.config.pos = 'lb';
      } else if(top) {
        this.config.pos = 't';
      } else if(right) {
        this.config.pos = 'r';
      }else if(bottom) {
        this.config.pos = 'b';
      }else if(left) {
        this.config.pos = 'l';
      } else this.config.pos = 'b';


      this.open(this.pops, this.config);
    }
}

