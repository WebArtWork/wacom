import { Component, Output, EventEmitter, Input, OnInit } from '@angular/core';

@Component({
	inputs: ['id', 'name', 'placeholder', 'min', 'max', 'step'],
	selector: 'waw-date',
	templateUrl: './date.component.html',
	styleUrls: ['./date.component.scss']
})
export class DateComponent implements OnInit{
	@Input() inputModel;
  	@Output() inputModelChange = new EventEmitter();
	public id;
	public date;
	public name;
	public placeholder = 'Your placeholder...';
	public min;
	public max;
	public step;
	constructor() {
	}
	ngOnInit() {
		if(this.inputModel) this.date = this.inputModel.getUTCFullYear() +'-' + (this.inputModel.getUTCMonth() + 1) + '-' + ((this.inputModel.getUTCDate() < 10)&&('0'+this.inputModel.getUTCDate())||this.inputModel.getUTCDate());
	}
	onChange(e) {
		this.inputModel = new Date(this.date);
		this.inputModelChange.emit(this.inputModel)
	}
}
