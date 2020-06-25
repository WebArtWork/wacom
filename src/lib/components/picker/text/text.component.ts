import { Component, Output, EventEmitter, Input } from '@angular/core';

@Component({
	inputs: ['id', 'name', 'placeholder'],
	selector: 'waw-text',
	templateUrl: './text.component.html',
	styleUrls: ['./text.component.scss']
})
export class TextComponent {
	@Input() inputModel;
  	@Output() inputModelChange = new EventEmitter();
	public id;
	public name;
	public placeholder = 'Your placeholder...';
	constructor() { }
}
