import { Injectable, Inject, Optional } from '@angular/core';
import { CONFIG_TOKEN, Config, DEFAULT_CONFIG } from '../interfaces/config';
import { AlertComponent } from '../components/alert/alert.component';
import { WrapperComponent } from '../components/alert/wrapper/wrapper.component';
import { DomService } from './dom.service';
import { Alert, DEFAULT_Alert } from '../interfaces/alert.interface';

@Injectable({
	providedIn: 'root'
})
export class AlertService {
	constructor(private dom: DomService,
		@Inject(CONFIG_TOKEN) @Optional() private config: Config) {
		if(!this.config) this.config = DEFAULT_CONFIG;
		if(!this.config.alert){
			this.config.alert = DEFAULT_Alert;
		}else{
			for (let each in DEFAULT_Alert){
				if(this.config.alert[each]!=undefined) continue;
			    this.config.alert[each] = DEFAULT_Alert[each];
			}
		}
		this.dom.appendComponent(WrapperComponent);
	}
	private uniques:any = {};
	private shortcuts:any = {
		tl: "topLeft",
		tc: "topCenter",
		tr: "topRight",
		r: "right",
		br: "bottomRight",
		bc: "bottomCenter",
		bl: "bottomLeft",
		l: "left",
		c: "center"
	};
	show(opts: Alert){
		if(!opts) opts = {};
		for (let each in this.config.alert){
			if(each=="class") opts[each] = opts[each]+" "+this.config.alert[each];
			else if(!opts[each]) opts[each] = this.config.alert[each];
		}
		if(this.shortcuts[opts.position]) opts.position = this.shortcuts[opts.position];
		if(opts.unique){
			if(this.uniques[opts.unique]) this.uniques[opts.unique].remove();
			this.uniques[opts.unique] = opts;
		}
		if(!opts.position) opts.position='bottomRight';
		let component = this.dom.appendById(AlertComponent, opts, opts.position);
		if(typeof opts.component == 'string' && this.config.alert.alerts[opts.component]){
			opts.component = this.config.alert.alerts[opts.component];
		}
		if(typeof opts.component == 'function'){
			let content = component.children[0].children[0].children[0];
			this.dom.appendComponent(opts.component, opts, content as HTMLElement);
		}
		return component;
	}
	destroy(){
		document.getElementById("bottomRight").innerHTML = ""; 
		document.getElementById("bottomLeft").innerHTML = ""; 
		document.getElementById("bottomCenter").innerHTML = ""; 
		document.getElementById("topRight").innerHTML = ""; 
		document.getElementById("topLeft").innerHTML = ""; 
		document.getElementById("topCenter").innerHTML = ""; 
		document.getElementById("center").innerHTML = ""; 
	}
}
