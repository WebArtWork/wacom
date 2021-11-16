import { Injectable } from '@angular/core';

@Injectable({
	providedIn: 'root'
})
export class RenderService {
	private now = new Date().getTime();
	private sectors:any = {};
	constructor() {}
	render(section = ''){
		if(section){
			this.sectors[section] = new Date().getTime();
		}else{
			this.now = new Date().getTime();
		}
	}
	on(cdr:any, section = ''){
		if(typeof cdr != 'object' || typeof cdr.markForCheck != 'function') return;
		let now = this.sectors[section];
		if(section){
			setInterval(()=>{
				if(now != this.sectors[section]){
					now = this.sectors[section];
					cdr.markForCheck();
				}
			}, 500);
		}else{
			setInterval(()=>{
				if(now != this.now){
					now = this.now;
					cdr.markForCheck();
				}
			}, 500);
		}
	}
}
