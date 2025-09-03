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

		this.loaded.then(() => {
			console.log(this.getDocs());

			console.time('time');

			this.loaded.then(() => {
				console.timeEnd('time');
				console.log(this.getDocs());
			});
		});

		this.get();

		this.create({ name: 'test', description: 'test' });
	}
}
