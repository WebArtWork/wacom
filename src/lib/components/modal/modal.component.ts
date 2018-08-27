import { Component, OnInit } from '@angular/core';
import { ModalService } from '../../services/modal.service';
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
	close(){
		this.mod.close(this.id);
	}

  constructor(private mod: ModalService) { }
  
  ngOnInit() {
  	let obj=this.mod.pull();
  	for(let key in obj){
  		this[key]=obj[key];
  	}
  }
}
