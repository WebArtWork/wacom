import { Component, ViewChild} from '@angular/core';

@Component({
    selector: 'lib-loader',
    templateUrl: './loader.component.html',
    styleUrls: ['./loader.component.scss']
})

export class LoaderComponent {
    @ViewChild('loader', { static: false })  loader: any;
    public text: string = "Hello, World!";
    public class: string = "";
    public progress: boolean = true;
    public timeout: number = 5000;
    public close: any = true;
    constructor() {
        /*if(this.timeout){
            setTimeout(() => {
                this.loader.nativeElement.remove();
            }, this.timeout);
        }*/
    }
}
