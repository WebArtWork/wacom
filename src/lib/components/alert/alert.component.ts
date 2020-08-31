import { Component, ViewChild} from '@angular/core';

@Component({
    selector: 'alert',
    templateUrl: './alert.component.html',
    styleUrls: ['./alert.component.scss']
})

export class AlertComponent {
    @ViewChild('alert', { static: false })  alert: any;
    public text: string = "Hello, World!";
    public type: string = "info";
    public progress: boolean = true;
    public position: string = 'bottomRight'; // [bottomRight, bottomLeft, topRight, topLeft, topCenter, bottomCenter or center]
    public timeout: number = 50000;
    public close: any = true;
    public buttons: any = []; /*[{text, callback}]*/
	
    constructor() {
        if(this.timeout){
            setTimeout(() => {
                this.remove();
            }, this.timeout);
        }
    }
    public delete_animation=false;
    remove(){
        this.delete_animation=true;
        setTimeout(()=>{
            this.alert.nativeElement.remove();
            this.delete_animation=false;
        },350);
		
    }
}
