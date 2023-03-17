import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpService } from './http.service';
import { StoreService } from './store.service';

interface CrudOptions {
	replace: string;
	query: string;
	group: string;
}

@Injectable({
	providedIn: 'root'
})
export default abstract class CrudService<Document> {
	private _url = '/api/';

	constructor(
		private _module: string,
		private _http: HttpService,
		private _store: StoreService
	) {
		this._url += this._module;
	}
	/*
		doc should be able to:
		1) stored locally
		2) send into back-end into different ways [http,socket]
		3) have temporary id {MODULE_Date.now()}
		4) work as MongoService via read function
	*/

	create(doc: Document): Observable<Document> {
		const obs = this._http.post(this._url + '/create', doc);
		return obs;
	}

	read(opts: CrudOptions): Observable<Document> {
		const obs = this._http.get(this._url + '/get');
		return obs;
	}

	update(doc: Document): Observable<Document> {
		const obs = this._http.put(this._url + '/update', doc);
		return obs;
	}

	delete(doc: Document): Observable<Document> {
		const obs = this._http.delete(this._url + '/delete/id');
		return obs;
	}

	set(doc: Document): void { }

	// get(module: string, id: string): Document {}
	// getAll(module: string): Document[] {}
}


/*
Create -> Post
Read   -> Get
Update -> Put
Delete -> Delete


import { Injectable } from "@angular/core";
import { HttpService, StoreService } from "wacom";
import CrudService from "./crud.service";

interface Bird {
	name: string;
	description: string;
}

@Injectable({
	providedIn: 'root'
})
export class BirdService extends CrudService<Bird> {
	constructor(
		_http: HttpService,
		_store: StoreService
	) {
		super('bird', _http, _store);
		console.log(this.create);
	}
}

*/
