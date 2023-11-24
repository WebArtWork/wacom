import { Component } from '@angular/core';
import { StoreService, ModalService, UiService, AlertService } from 'wacom';
import { LocalComponent } from './modals/local/local.component';
@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.scss']
})
export class AppComponent {
	public password = '';
	local_modal(){
		this.modal.show({
			component: LocalComponent
		});
	}
	constructor(
		public store: StoreService,
		public modal: ModalService,
		public ui: UiService,
		private _alert: AlertService
	) {
		this._alert.show({
			text: 'Hello World',
			timeout: 0
		});
		this.store.get('test', (message:any)=>{
			console.log('GET: ', message);
		});
		this.store.set('test', 'Hello World');
	}
}
