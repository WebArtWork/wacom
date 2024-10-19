import { Injectable } from '@angular/core';
@Injectable({
	providedIn: 'root'
})
export class BaseService {
	now = new Date().getTime();

	_now = ()=>{
		this.now = new Date().getTime();
	}

	constructor() {}
}
