import { Component, Output, EventEmitter, Input } from '@angular/core';

@Component({
	inputs: ['id', 'name', 'list', 'config'],
	selector: 'waw-radio',
	templateUrl: './radio.component.html',
	styleUrls: ['./radio.component.scss']
})
export class RadioComponent {
	@Input() inputModel;
  	@Output() inputModelChange = new EventEmitter();
	public id;
	public class;
	public name;
	public list = [];
	public config:any = {};
	constructor() {
	}
}
