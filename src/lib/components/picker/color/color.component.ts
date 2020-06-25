import { Component, Output, EventEmitter, Input } from '@angular/core';

@Component({
	inputs: ['id', 'name', 'placeholder'],
	selector: 'waw-color',
	templateUrl: './color.component.html',
	styleUrls: ['./color.component.scss']
})
export class ColorComponent {
	@Input() inputModel;
  	@Output() inputModelChange = new EventEmitter();
	public id;
	public name;
	public placeholder = 'Your placeholder...';
	constructor() { }

}
