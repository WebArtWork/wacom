import { Component, Output, EventEmitter, Input } from '@angular/core';

@Component({
	inputs: ['id', 'name', 'list', 'config'],
	selector: 'waw-check',
	templateUrl: './checkbox.component.html',
	styleUrls: ['./checkbox.component.scss']
})
export class CheckboxComponent {
	@Input() inputModel;
  	@Output() inputModelChange = new EventEmitter();
	public id;
	public class;
	public name;
	public list = [];
	public config:any = {
		format: 'object_by_true'
	};
	public data: any = {};
	constructor() {
		console.log(this.inputModel);
	}
	format() {
		if(this.config) {
			if(this.config.format == 'object_by_true') {
				this.inputModel = {...this.inputModel, ...this.data};
			} else if(this.config.format == 'object_by_number'){
				let obj = {};
				for (var key in this.data){
				    if(this.data[key]) {
				    	obj[key] = 1;
				    } else {
				    	obj[key] = 0;
				    }
				}
				this.inputModel = {...this.inputModel, ...obj};
			}
		}
		this.inputModelChange.emit(this.inputModel)
	}
}
