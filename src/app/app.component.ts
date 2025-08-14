import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StoreService, ModalService, UiService, AlertService } from 'wacom';
import { LocalComponent } from './modals/local/local.component';
import { CoreComponent } from './doc/service/core/core.component';
@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    standalone: true,
    imports: [CommonModule, FormsModule, CoreComponent]
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
			component: 'test',
			timeout: 0
		});

		// this._alert.show({
		// 	text: 'Hello World',
		// 	timeout: 0
		// });

		this.store.get('test', (message:any)=>{
			console.log('GET: ', message);
		});
		this.store.set('test', 'Hello World');
	}
}
