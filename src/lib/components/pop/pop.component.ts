import { Component, OnInit, ViewChild } from '@angular/core';
import { PopupService } from '../../services/popup.service';

@Component({
  selector: 'pop',
  templateUrl: './pop.component.html',
  styleUrls: ['./pop.component.scss']
})
export class PopComponent implements OnInit {
  constructor(private pop: PopupService) { }
  private id;
  public config = {
    pos : ''
  };

  public left = -5000;
  public top= -5000;
  public postion;

  @ViewChild('pops') pops;
  

  close(){
    this.pop.close(this.id);
  }
  ngOnInit() {
    this.postion=this.pop.open(this.pops, this.config);
    if(this.postion){
          this.left = this.postion[0];
    this.top = this.postion[1];
    }


    let obj=this.pop.pull();
    for(let key in obj){
      this[key]=obj[key];
    } 
  }
}
