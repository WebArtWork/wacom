import { Injectable } from '@angular/core';
import { AlertComponent } from '../components/alert/alert.component';
import { WrapperComponent } from '../components/alert/wrapper/wrapper.component';
import { DomService } from './dom.service';

interface AlertOptions {
	text:string;
	type?: string;
	unique?: string;
	progress?: boolean;
	position?: string; // [bottomRight, bottomLeft, topRight, topLeft, topCenter, bottomCenter or center]
	timeout?: number;
	close?: any;
	buttons?: any; /*[{text,or,html, callback}]*/
}

@Injectable({
	providedIn: 'root'
})
export class AlertService {
	constructor(private dom: DomService) {
		this.dom.appendComponent(WrapperComponent);
	}
	private uniques:any = {};
	show(obj:AlertOptions){
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
