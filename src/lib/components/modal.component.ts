import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'modal',
  template: `
  <div>
    <ng-content>
    </ng-content>
  </div>    
  `,
  styles: []
})
export class ModalComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }
}
