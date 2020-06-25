import { Component } from '@angular/core';

@Component({
    selector: 'alert',
    templateUrl: './alert.component.html',
    styleUrls: ['./alert.component.scss']
})


export class AlertComponent {
    show: any;
    height = true;
    public text: string = "Hello, World!";
    public type: string = "success";
    public progress: boolean = true;
    public position: string = 'bottomRight'; // [bottomRight, bottomLeft, topRight, topLeft, topCenter, bottomCenter or center]
    public timeout: number = 3000;
    public close: any = true;
    public buttons: any = [];/*[{text,or,html, callback}]*/
    constructor() {
        setTimeout(() => {
            this.show = true;
        }, 300);
    }
}
