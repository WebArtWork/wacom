import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpService } from './http.service';
import { StoreService } from './store.service';

@Injectable({
	providedIn: 'root',
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
	private _perPage = 20;
	setPerPage(_perPage: number) {
		this._perPage = _perPage;
	}
	get(page: number | undefined): Observable<Document> {
		if (typeof page === 'number') {
			const obs = this._http.get(
				`${this._url}/get?skip=${this._perPage * (page - 1)}&limit=${
					this._perPage
				}`
			);
			return obs;
		} else {
			const obs = this._http.get(`${this._url}/get`);
			return obs;
		}
	}

	create(doc: Document): Observable<Document> {
		const obs = this._http.post(this._url + '/create', doc);
		return obs;
	}

	update(doc: Document): Observable<Document> {
		const obs = this._http.post(this._url + '/update', doc);
		return obs;
	}

	delete(doc: Document): Observable<Document> {
		const obs = this._http.delete(this._url + '/delete/id');
		return obs;
	}
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
