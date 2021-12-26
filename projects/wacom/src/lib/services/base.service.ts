import { Injectable } from '@angular/core';
@Injectable({
	providedIn: 'root'
})
export class BaseService {
	public now = new Date().getTime();
	public _now = ()=>{
		this.now = new Date().getTime();
	}
	constructor() {}
}
