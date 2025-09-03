import { Injectable } from '@angular/core';
import { CrudDocument, CrudService } from 'projects/wacom/public-api';

export interface Bird extends CrudDocument<Bird> {
	name: string;
	description: string;
}

@Injectable({
	providedIn: 'root',
})
export class AppCrudService extends CrudService<Bird> {
	constructor() {
		super({
			name: 'bird',
			unauthorized: true,
		});

		console.log(this.getDocs());

		this.create({ name: 'test', description: 'test' });
	}
}
