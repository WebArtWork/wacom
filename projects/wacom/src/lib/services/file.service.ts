import { FilesComponent } from '../components/files/files.component';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { HttpService } from './http.service';
import { DomService } from './dom.service';
import { CoreService } from './core.service';
import { Injectable } from '@angular/core';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
	providedIn: 'root'
})
export class FileService {
	private added:any = {};
	private files:any = [];
	constructor(private dom: DomService, private core: CoreService, private http: HttpService) {
		this.dom.appendComponent(FilesComponent, {
			fs: this
		});
	}
	/*
	*	Input Management
	*/
		public add(opts:any){
			if(typeof opts == 'string'){
				opts = {
					id: opts
				};
			}
			if(!opts.id) return console.log('You have to pass ID into file object');
			if(!opts.type) opts.type='image';
			if(typeof opts.resize == 'number'){
				opts.resize = {
					width: opts.resize,
					height: opts.resize
				};
			}
			if(this.added[opts.id]){
				for (let i = this.files.length-1; i >= 0; i--){
				    if(this.files[i].id == opts.id){
				    	this.files.splice(i, 1);
				    }
				}
			}
			this.files.push(opts);
			this.added[opts.id] = opts;
			if(opts.save){
				return ()=>{ opts.complete(); };
			}
		};
		public change(event:any, info:any){
			if(info.type == 'image'){
				if(info.multiple){
					if(typeof info.multiple_cb == 'function'){
						info.multiple_files = [];
						info.multiple_counter = event.target.files.length;
					}
					for (let i = 0; i < event.target.files.length; i++){
						this.process(event.target.files[i], info);
					}
				}else{
					this.process(event.target.files[0], info);
				}
			}else if(info.type == 'file'){
				if(info.multiple){
					if(typeof info.multiple_cb == 'function'){
						info.multiple_cb(event.target.files);
					}
					for (let i = 0; i < event.target.files.length; i++){
						if(typeof info.cb == 'function'){
							info.cb(event.target.files[i]);
						}
					}
				}else{
					if(typeof info.cb == 'function'){
						info.cb(event.target.files[0]);
					}
				}
				if(info.part || info.url){
					this.file(info, event.target.files);
				}
			}else console.log('Provide type `image` or `file` ');
		};
		public remove(part:any, url:any, opts:any={}, cb:any=(resp:any)=>{}):any{
			opts.url = url;
			if(opts.save){
				return ()=>{
					this.http.post(opts.api || '/api/'+part+'/file/delete', opts, cb);
				};
			}else{
				this.http.post(opts.api || '/api/'+part+'/file/delete', opts, cb);
			}
		};
		public file(info:any, files:any, cb:any=()=>{}){
			let formData: FormData = new FormData();
			if(typeof info.append == 'function'){
				info.append(formData, files);
			}else{
				for (let i = 0; i < files.length; i++){
					formData.append('file['+i+']', files[i]);
				}
			}
			let body = typeof info.body == 'function' && info.body() ||  (typeof info.body == 'object' && info.body || {});
			for (let each in body){
			    formData.append(each, body[each]);
			}
			if(info.save){
				info.complete = ()=>{
					this.http.post(info.api || '/api/' + info.part + '/file'+(info.name&&('/'+info.name)||''), formData, resp => {
						if(resp && typeof info.resp == 'function') info.resp(resp);
						if(resp && typeof cb == 'function') cb(resp);
					});
				}
			}else{
				this.http.post(info.api || '/api/' + info.part + '/file'+(info.name&&('/'+info.name)||''), formData, resp => {
					if(resp && typeof info.resp == 'function') info.resp(resp);
					if(resp && typeof cb == 'function') cb(resp);
				});
			}
		};
		public image(info:any, resp:any=()=>{}):any{
			if(info.save){
				return ()=>{
					this.http.post(info.api||'/api/'+info.part+'/file'+(info.name&&('/'+info.name)||''), info, resp);
				};
			}else{
				this.http.post(info.api||'/api/'+info.part+'/file'+(info.name&&('/'+info.name)||''), info, resp);
			}

		};
	/*
	*	Common Management
	*/
		private update(dataUrl:any, info:any, file:any){
			if(typeof info.cb == 'function'){
				info.cb(dataUrl, file);
			}
			if(typeof info.multiple_cb == 'function'){
				info.multiple_files.push({dataUrl: dataUrl, file: file});
				if(--info.multiple_counter == 0) info.multiple_cb(info.multiple_files);
			}
			if(!info.part) return;
			let obj = typeof info.body == 'function' && info.body() || {};
			obj.dataUrl = dataUrl;
			if(info.save){
				info.complete = ()=>{
					this.http.post(info.api||'/api/'+info.part+'/file'+(info.name&&('/'+info.name)||''), obj, resp => {
						if(resp && typeof info.cb == 'function') info.cb(resp);
					});
				};
			}else{
				this.http.post(info.api||'/api/'+info.part+'/file'+(info.name&&('/'+info.name)||''), obj, resp => {
					if(resp && typeof info.cb == 'function') info.cb(resp);
				});
			}
		};
		private process(file:any, info:any){
			if(file.type.indexOf("image/")!=0){
				if(typeof info.cb == 'function'){
					info.cb(false, file);
				}
				if(typeof info.multiple_cb == 'function'){
					info.multiple_files.push({file: file});
					if(--info.multiple_counter == 0) info.multiple_cb(info.multiple_files);
				}
				return;
			}
			if(info.resize){
				info.resize.width = info.resize.width || 1920;
				info.resize.height = info.resize.height || 1080;
			}
			const reader = new FileReader();
			reader.onload = (loadEvent:any)=>{
				if(!info.resize){
					return this.update(loadEvent.target.result, info, file);
				}
				const canvasElement = this.core.document.createElement('canvas');
				const imageElement = this.core.document.createElement('img');
				imageElement.onload = () => {
					if (
						imageElement.width < info.resize.width &&
						imageElement.height < info.resize.height
					) {
						return this.update(loadEvent.target.result, info, file);
					}
					const infoRatio = info.resize.width / info.resize.height;
					const imgRatio = imageElement.width / imageElement.height;
					let width, height;
					if (imgRatio > infoRatio) {
						width = Math.min(info.resize.width, imageElement.width);
						height = width / imgRatio;
					} else {
						height = Math.min(info.resize.height, imageElement.height);
						width = height * imgRatio;
					}
					canvasElement.width = width;
					canvasElement.height = height;
					let context = canvasElement.getContext('2d');
					context.drawImage(imageElement, 0, 0 , width, height);
					let dataUrl = canvasElement.toDataURL('image/jpeg', 1);
					return this.update(dataUrl, info, file);
				};
				imageElement.src = loadEvent.target.result;
			};
			reader.readAsDataURL(file);
		};
	/*
	*	End Of
	*/
}
