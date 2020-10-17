import { Injectable, Inject, Optional } from '@angular/core';
import { DomService } from './dom.service';
import { ModalComponent } from '../components/modal/modal.component';
import { CONFIG_TOKEN, Config, DEFAULT_CONFIG } from '../interfaces/config';
import { Modal, DEFAULT_Modal } from '../interfaces/modal.interface';
@Injectable({
	providedIn: 'root'
})
export class ModalService {
	constructor(private dom: DomService,
		@Inject(CONFIG_TOKEN) @Optional() private config: Config) {
		if(!this.config.modal) this.config.modal={};
		if(!this.config.modal.modals) this.config.modal.modals={};
	}
	private opened:any = {};
	show(opts: Modal){
		if(!opts) opts = {};
		if(typeof opts.component == 'string' && this.config.modal.modals[opts.component]){
			opts.component = this.config.modal.modals[opts.component];
		}
		if(typeof opts.component != 'function'){
			console.log("This component does not exists.");
			return;
		}
		if(!opts.class) opts.class='';
		for (let each in this.config.modal){
			if(each=="class") opts.class += (opts.class&&' '||'') + this.config.modal.class;
			else if(!opts[each]) opts[each] = this.config.modal[each];
		}
		opts.id = Math.floor(Math.random() * Date.now()) + Date.now();
		this.opened[opts.id] = opts;
		document.body.classList.add("modalOpened");
		let component:any;
		opts.close = ()=>{
			component.remove();
			if(typeof opts.onClose == 'function') opts.onClose();
			delete this.opened[opts.id];
			if(!Object.keys(this.opened).length){
				document.body.classList.remove("modalOpened");
			}
		};
		if(typeof opts.timeout == 'number' && opts.timeout>0){
			setTimeout(opts.close, opts.timeout);
		}
		component = this.dom.appendComponent(ModalComponent, opts);
		let content = component.children[0].children[0].children[0];
		this.dom.appendComponent(opts.component, opts, content as HTMLElement);
		return component;
	}
	destroy(){
		for (let each in this.opened){
		    this.opened[each].close();
		}
		document.body.classList.remove("modalOpened");
	}
}
