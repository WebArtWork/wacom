import { Component, OnInit, ViewChild } from '@angular/core';
import { PopupService } from '../../services/popup.service';

@Component({
  selector: 'popup',
  inputs: ['config'],
  templateUrl: './popup.component.html',
  styleUrls: ['./popup.component.scss']
})
export class PopupComponent implements OnInit {
  private id;
  addToBody(event){
    this.pop.addToBody(event);
  }
    close(){
    this.pop.close(this.id);
  }
  constructor(private pop: PopupService) { }
  
  ngOnInit() {
    let obj=this.pop.pull();
    for(let key in obj){
      this[key]=obj[key];
    }
  }
}
