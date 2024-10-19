import { Injectable } from '@angular/core';
@Injectable({
	providedIn: 'root'
})
export class BaseService {
	now = new Date().getTime();

	refreshNow(): void {
		this.now = new Date().getTime();
	}
}
