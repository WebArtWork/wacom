import { Component, ElementRef, ViewChild} from '@angular/core';
import { CoreService } from '../../services/core.service';

@Component({
	selector: 'alert',
	templateUrl: './alert.component.html',
	styleUrls: ['./alert.component.scss']
})

export class AlertComponent {
	@ViewChild('alert', {static:false}) alert:any;
	public component: any;
	public text: string = "Hello, World!";
	public class: string = "";
	public type: string = "info";
	public progress: boolean = true;
	public position: string = 'bottomRight'; // [bottomRight, bottomLeft, topRight, topLeft, topCenter, bottomCenter or center]
	public icon: string = '';
	public timeout: any = 5000;
	public close: any;
	public closable: any = true;
	public buttons: any = []; /*[{text, callback}]*/

	constructor(private elementRef: ElementRef, public core: CoreService) {
		setTimeout(()=>{
			if(this.timeout){
				let remaining=JSON.parse(JSON.stringify(this.timeout));
				let timer=setTimeout(()=>{this.remove()}, remaining);
				let start = new Date();
				this.alert.nativeElement.addEventListener("mouseenter", ()=>{
					clearTimeout(timer);
					remaining -= new Date().getTime() - start.getTime();
				}, false);
				this.alert.nativeElement.addEventListener("mouseleave", ()=>{
					start = new Date();
					clearTimeout(timer);
					timer = core.window.setTimeout(()=>{this.remove()}, remaining);
				}, false);
			}
		});
	}
	public delete_animation=false;
	remove(){
		this.delete_animation=true;
		setTimeout(()=>{
			this.close();
			this.delete_animation=false;
		},350);

	}
}
