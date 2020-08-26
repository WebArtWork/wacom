import { Injectable } from '@angular/core';

@Injectable({
	providedIn: 'root'
})
export class StoreService {
	constructor(){}
	set(hold, value, callback){}
	get(hold, callback){}
}
