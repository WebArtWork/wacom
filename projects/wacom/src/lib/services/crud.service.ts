import { Injectable, Inject } from '@angular/core';
import { MongoService } from './mongo.service';
import { AlertService } from './alert.service';
import { BaseService } from './base.service';

@Injectable({
	providedIn: 'root'
})
export class CrudService extends BaseService {
	constructor(
		@Inject(String) private collection: string,
		private mongo: MongoService,
		private alert: AlertService
	) {
		super();
	}
	public docs = [];
	public _docs: any = {};
	public doc = (doc_id: string) => {
		if (!this._docs[doc_id]) {
			this._docs[doc_id] = this.mongo.fetch(this.collection, {
				query: {
					_id: doc_id
				}
			});
		}
		return this._docs[doc_id];
	}
	public create = (doc: object = {}, callback: Function = (obj: object) =>{}, text: string = '')=>{
		if((doc as any)._id) return this.save(doc, callback);
		this.mongo.create(this.collection, doc, (created: object) => {
			if(typeof callback === 'function') callback(created);
			if(text) this.alert.show({ text });
		});
	}
	public read = (params: object = {}, callback: Function = (obj: object) =>{}, text: string = '')=>{
		this.docs = this.mongo.get(this.collection, params, (arr: any, obj: object)=>{
			this._docs = obj;
			if(typeof callback === 'function') callback(obj);
			if(text) this.alert.show({ text });
		});
	}
	public update = (doc: object, callback: Function = (obj: object) =>{}, text: string = '')=>{
		this.mongo.afterWhile(doc, () => {
			this.save(doc, callback, text);
		});
	}
	public save = (doc: object, callback: Function = (obj: object) =>{}, text: string = '')=>{
		this.mongo.update(this.collection, doc, (updated: object)=>{
			if(typeof callback === 'function') callback(updated);
			if(text) this.alert.show({ text });
		});
	}
	public delete = (doc: object, callback: Function = (obj: object) =>{}, text: string = '')=>{
		this.mongo.delete(this.collection, doc, (deleted: object)=>{
			if(typeof callback === 'function') callback(deleted);
			if(text) this.alert.show({ text });
		});
	}
}
