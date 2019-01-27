import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';


@Injectable({
	providedIn: 'root'
})
export class FileService {
	constructor(private http: HttpClient) {}
	public upload : any = (file, cb : any = resp=>{} ) => {
		const formData: FormData = new FormData();
		formData.append('file', file, file.name);
		this.http.post<any>('/waw/file/upload', formData).subscribe(cb);
	}
}
