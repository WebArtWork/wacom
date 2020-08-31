import { Injectable } from '@angular/core';
import { AlertComponent } from '../components/alert/alert.component';
import { WrapperComponent } from '../components/alert/wrapper/wrapper.component';
import { DomService } from './dom.service';
import { Alert, DEFAULT_Alert } from '../interfaces/alert.interface';

@Injectable({
	providedIn: 'root'
})
export class AlertService {
	constructor(private dom: DomService) {
		this.dom.appendComponent(WrapperComponent);
	}
	private uniques:any = {};
	private shortcuts:any = {
		br: "bottomRight",
		bl: "bottomLeft",
		bc: "bottomCenter",
		tr: "topRight",
		tl: "topLeft",
		tc: "topCenter",
		c: "center"
	};
	show(obj:Alert = DEFAULT_Alert){
		for (let each in DEFAULT_Alert){
		    if(!obj[each]) obj[each] = DEFAULT_Alert[each];
		}
		if(this.shortcuts[obj.position]) obj.position = this.shortcuts[obj.position];
		if(obj.unique){
			if(this.uniques[obj.unique]) this.uniques[obj.unique].remove();
			this.uniques[obj.unique] = obj;
		}
		if(!obj.position) obj.position='bottomRight';
		return this.dom.appendById(AlertComponent, obj, obj.position);
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
