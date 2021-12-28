import { Injectable } from '@angular/core';
import { CrudService, AlertService, MongoService } from 'wacom';

@Injectable({
	providedIn: 'root'
})
export class ManagerService extends CrudService {
	constructor(
		private mongo: MongoService,
		private alert: AlertService
	){
		super('manager');
	}
}
