import { Injectable } from '@angular/core';
import { CrudService, AlertService, MongoService } from 'wacom';

@Injectable({
	providedIn: 'root'
})
export class ManagerService extends CrudService {
	constructor(
		public override mongo: MongoService,
		public override alert: AlertService
	){
		super('manager', mongo, alert);
	}
}
