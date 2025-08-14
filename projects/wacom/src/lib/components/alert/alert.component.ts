import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
	selector: 'alert',
        templateUrl: './alert.component.html',
        styleUrls: ['./alert.component.scss'],
        standalone: true,
        imports: [CommonModule],
})
export class AlertComponent {
	@ViewChild('alert', { static: false }) alert: any;
	component: any;
	text: string = '';
	class: string = '';
	type: string = 'info';
	progress: boolean = true;
	position: string = 'bottomRight'; // [bottomRight, bottomLeft, topRight, topLeft, topCenter, bottomCenter or center]
	icon: string = '';
	timeout: any = 5000;
	close: any;
	closable: any = true;
	buttons: any = []; /*[{text, callback}]*/

	constructor() {
		setTimeout(() => {
			if (this.timeout) {
				let remaining = JSON.parse(JSON.stringify(this.timeout));

				let timer = setTimeout(() => {
					this.remove();
				}, remaining);

				let start = new Date();

				this.alert.nativeElement.addEventListener(
					'mouseenter',
					() => {
						clearTimeout(timer);

						remaining -= new Date().getTime() - start.getTime();
					},
					false
				);
				this.alert.nativeElement.addEventListener(
					'mouseleave',
					() => {
						start = new Date();

						clearTimeout(timer);

						timer = window.setTimeout(() => {
							this.remove();
						}, remaining);
					},
					false
				);
			}
		});
	}
	public delete_animation = false;
	remove() {
		this.delete_animation = true;
		setTimeout(() => {
			this.close();
			this.delete_animation = false;
		}, 350);
	}
}
