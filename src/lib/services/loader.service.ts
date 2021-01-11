import { Injectable, Inject, Optional } from '@angular/core';
import { CONFIG_TOKEN, Config, DEFAULT_CONFIG } from '../interfaces/config';
import { LoaderComponent } from '../components/loader/loader.component';
import { DomService } from './dom.service';

@Injectable({
	providedIn: 'root'
})
export class LoaderService {
	constructor(private dom: DomService,
		@Inject(CONFIG_TOKEN) @Optional() private config: Config) {
		/*if(!this.config) this.config = DEFAULT_CONFIG;
		if(!this.config.alert){
			this.config.alert = DEFAULT_Alert;
		}else{
			for (let each in DEFAULT_Alert){
				if(this.config.alert[each]!=undefined) continue;
			    this.config.alert[each] = DEFAULT_Alert[each];
			}
		}
		this.dom.appendComponent(WrapperComponent);*/
	}

	show(opts?){
		/*if(!opts) opts = {};
		for (let each in this.config.alert){
			if(each=="class") opts[each] = opts[each]+" "+this.config.alert[each];
			else if(!opts[each]) opts[each] = this.config.alert[each];
		}
		if(typeof opts.component == 'string' && this.config.alert.alerts[opts.component]){
			opts.component = this.config.alert.alerts[opts.component];
		}*/
		let component;
		if(opts.component){
			component = this.dom.appendComponent(LoaderComponent, {}, opts.component);
			return component.nativeElement;
		}
		else{
			component = this.dom.appendComponent(LoaderComponent, {});
			return component.nativeElement;
		}
	}
	destroy(){

	}
}
