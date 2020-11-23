import { Component, ElementRef, ViewChild} from '@angular/core';

@Component({
    selector: 'alert',
    templateUrl: './alert.component.html',
    styleUrls: ['./alert.component.scss']
})

export class AlertComponent {
    public component: any;
    public text: string = "Hello, World!";
    public class: string = "";
    public type: string = "info";
    public progress: boolean = true;
    public position: string = 'bottomRight'; // [bottomRight, bottomLeft, topRight, topLeft, topCenter, bottomCenter or center]
    public timeout: any = 5000;
    public close: any = true;
    public buttons: any = []; /*[{text, callback}]*/

    constructor(private elementRef: ElementRef) {
        setTimeout(()=>{
            if(this.timeout){
                setTimeout(() => {
                    this.remove();
                }, this.timeout);
            }
        });
    }
    public delete_animation=false;
    remove(){
        this.delete_animation=true;
        setTimeout(()=>{
            this.elementRef.nativeElement.remove();
            this.delete_animation=false;
        },350);

    }
}
