import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
	selector: 'wframe',
	templateUrl: './wframe.component.html',
	styleUrls: ['./wframe.component.scss']
})
export class WframeComponent implements OnInit {
	@Input() src: any;
	public set(src){
		this.src = src;
	}
	@Output() change = new EventEmitter<string>();
	constructor() {}
	ngOnInit() {}
}
