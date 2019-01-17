import { Component, OnInit } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Component({
	selector: 'modal',
	templateUrl: './modal.component.html',
	styleUrls: ['./modal.component.scss']
})
export class ModalComponent implements OnInit {
	private id;
	public full;
	public cover;
	public header;
	public content;
	constructor(){}
	ngOnInit(){}
	private modalClose: Subject<any> = new Subject();
	close(){
		this.modalClose.next();
		this.modalClose.complete();
	}
	onModalClose(): Observable<any> {
		return this.modalClose.asObservable();
	}
}
 