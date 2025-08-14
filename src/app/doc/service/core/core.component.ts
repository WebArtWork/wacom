import { Component } from '@angular/core';

@Component({
    selector: 'app-core',
    templateUrl: './core.component.html',
    styleUrls: ['./core.component.scss'],
    standalone: true
})
export class CoreComponent {
	public value:any = 'Ace Editor';
	constructor(){}

	log(event:any, txt:any) {
		console.log('ace event', event);
		let selector:any = document.querySelector('#log');
		selector.value += `${txt}\n`;
	}
}
