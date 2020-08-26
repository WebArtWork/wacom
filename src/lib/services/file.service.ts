import { FilesComponent } from '../components/files/files.component';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { DomService } from './dom.service';
import { Injectable } from '@angular/core';
import { throwError } from 'rxjs'; 
import { catchError } from 'rxjs/operators'; 

@Injectable({
	providedIn: 'root'
})
export class FileService {
	constructor(private dom: DomService, private http: HttpClient) {
		this.dom.appendComponent(FilesComponent, {
			fs: this
		});
	}
	private added:any = {};
	private files:any = [];
	add(opts:any){
		if(typeof opts == 'string'){
			opts = {
				id: opts
			};
		}
		if(!opts.id) return console.log('You have to pass ID into file object');
		if(typeof opts.resize == 'number'){
			opts.resize = {
				width: opts.resize,
				height: opts.resize
			};
		}
		this.files.push(opts);
		this.added[opts.id] = opts;
	}
	remove(_id, part, url, errCb:any=(err:HttpErrorResponse)=>{}){
		this.http.post < any > ('/api/' + part + '/avatar/delete', {
			_id: _id,
			url: url
		}).pipe(catchError(this.handleError(errCb))).subscribe(resp => {});
	}
	change(event, info){
		if(info.part || info.resize){
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
		}else{
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
		}
	}
	private update(dataUrl, info:any, file){
		if(typeof info.cb == 'function'){
			info.cb(dataUrl, file);
		}
		if(typeof info.multiple_cb == 'function'){
			info.multiple_files.push({dataUrl: dataUrl, file: file});
			if(--info.multiple_counter == 0) info.multiple_cb(info.multiple_files);
		}
		if(!info.part) return;
		let obj = info.body && info.body() || {};
		obj.dataUrl = dataUrl;
		this.http.post < any > ('/api/' + info.part + '/avatar' + (info.multiple && 's' || ''), obj).pipe(catchError(this.handleError(info.errCb || function(err:HttpErrorResponse){}))).subscribe(resp => {
			if(resp && typeof info.cb == 'function') info.cb(resp);
		});
	}
	private process(file, info:any){
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
		let reader = new FileReader();
		let update = this.update.bind(this);
		reader.onload = function (loadEvent:any) {
			if(!info.resize){
				return update(loadEvent.target.result, info, file);
			}
			let canvasElement = document.createElement('canvas');
			let imageElement = document.createElement('img');
			imageElement.onload = function() {
				let infoRatio = info.resize.width / info.resize.height;
				let imgRatio = imageElement.width / imageElement.height;
				let width, height;
				if (imgRatio > infoRatio) {
					width = info.resize.width;
					height = width / imgRatio;
				} else {
					height = info.resize.height;
					width = height * imgRatio;
				}
				canvasElement.width = width;
				canvasElement.height = height;
				let context = canvasElement.getContext('2d');
				context.drawImage(imageElement, 0, 0 , width, height);
				let dataUrl = canvasElement.toDataURL('image/jpeg', 1);
				return update(dataUrl, info, file);
			};
			imageElement.src = loadEvent.target.result;
		};
		reader.readAsDataURL(file);
	}
	private handleError(cb = err=>{}) {
		return function(error: HttpErrorResponse){
			cb(error);
			return throwError("We can't connect to the server");
		}
	};
}