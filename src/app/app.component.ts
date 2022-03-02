import { Component } from '@angular/core';
import { StoreService, ModalService, MongoService } from 'wacom';
import { LocalComponent } from './modals/local/local.component';
import { ManagerService } from './manager.service';
@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.scss']
})
export class AppComponent {
	local_modal(){
		this.modal.show({
			component: LocalComponent
		});
	}
	constructor(
		public store: StoreService,
		public modal: ModalService,
		private _managerService: ManagerService,
		public mongo: MongoService
	){
		this.store.get('test', (message:any)=>{
			console.log('GET: ', message);
		});
		this.store.set('test', 'Hello World');
	}
}