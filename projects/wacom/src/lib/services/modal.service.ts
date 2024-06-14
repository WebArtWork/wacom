import { Injectable, Inject, Optional } from '@angular/core';
import { DomService } from './dom.service';
import { CoreService } from './core.service';
import { ModalComponent } from '../components/modal/modal.component';
import { CONFIG_TOKEN, Config } from '../interfaces/config';
import { Modal } from '../interfaces/modal.interface';
@Injectable({
	providedIn: 'root'
})
export class ModalService {
	private _modal: any;
	constructor(private dom: DomService, private core: CoreService,
		@Inject(CONFIG_TOKEN) @Optional() private config: Config) {
		if(!this.config) this.config={};
		if(!this.config.modal) this.config.modal={};
		if(!this.config.modal.modals) this.config.modal.modals={};
		this._modal = config.modal;
	}

	show(opts: Modal | any){
		if(typeof opts == 'string' || typeof opts == 'function'){
			opts = {
				component: opts
			}
		}
		if(!opts || typeof opts != 'object') opts = {};
		if(typeof opts.component == 'string' && this._modal.modals[opts.component]){
			opts.component = this._modal.modals[opts.component];
		}
		if(typeof opts.component != 'function'){
			console.log("This component does not exists.");
			return;
		}
		if(!opts.class) opts.class='';
		for (let each in this.config.modal){
			if(each=="class") opts.class += (opts.class&&' '||'') + this.config.modal.class;
			else if(!opts[each]) opts[each] = this._modal[each];
		}
		opts.id = Math.floor(Math.random() * Date.now()) + Date.now();
		this.opened[opts.id] = opts;
		this.core.document.body.classList.add("modalOpened");
		let component:any;
		let content:any;
		opts.close = ()=>{
			content.componentRef.destroy();
			component.nativeElement.remove();
			if(typeof opts.onClose == 'function') opts.onClose();
			delete this.opened[opts.id];
			if(!Object.keys(this.opened).length){
				this.core.document.body.classList.remove("modalOpened");
			}
		};
		if(typeof opts.timeout == 'number' && opts.timeout>0){
			setTimeout(opts.close, opts.timeout);
		}
		component = this.dom.appendComponent(ModalComponent, opts);
		content = this.dom.appendComponent(opts.component, opts, component.nativeElement.children[0].children[0].children[0] as HTMLElement);
		return component.nativeElement;
	}
	open(opts: Modal){ this.show(opts); }
	small(opts: Modal){
		if(typeof opts == 'string' || typeof opts == 'function'){
			opts = {
				component: opts
			}
		}
		opts.size = 'small';
		this.show(opts);
	}
	mid(opts: Modal){
		if(typeof opts == 'string' || typeof opts == 'function'){
			opts = {
				component: opts
			}
		}
		opts.size = 'mid';
		this.show(opts);
	}
	big(opts: Modal){
		if(typeof opts == 'string' || typeof opts == 'function'){
			opts = {
				component: opts
			}
		}
		opts.size = 'big';
		this.show(opts);
	}
	full(opts: Modal){
		if(typeof opts == 'string' || typeof opts == 'function'){
			opts = {
				component: opts
			}
		}
		opts.size = 'full';
		this.show(opts);
	}
	private opened:any = {};
	allCanBeDestroyed = true;
	destroy() {
		if (!this.allCanBeDestroyed) {
			return;
		}
		for (let each in this.opened){
		    this.opened[each].close();
		}
		this.core.document.body.classList.remove("modalOpened");
	}
}
