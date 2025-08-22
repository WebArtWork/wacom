import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
	name: 'splice',
})
export class SplicePipe implements PipeTransform {
	transform(from: any, which: any, refresh?: number): any {
		if (Array.isArray(from)) from = { arr: from, prop: '_id' };

		let arr = (which.keep && []) || from.arr.slice();

		if (Array.isArray(which)) which = { arr: which, prop: '_id' };

		for (let i = from.arr.length - 1; i >= 0; i--) {
			for (let j = 0; j < which.arr.length; j++) {
				if (from.prop && which.prop) {
					if (from.arr[i][from.prop] == which.arr[j][which.prop]) {
						if (which.keep) {
							arr.push(from.arr[i]);
						} else {
							arr.splice(i, 1);
						}

						break;
					}
				} else if (from.prop) {
					if (from.arr[i][from.prop] == which.arr[j]) {
						if (which.keep) {
							arr.push(from.arr[i]);
						} else {
							arr.splice(i, 1);
						}

						break;
					}
				} else if (which.prop) {
					if (from.arr[i] == which.arr[j][which.prop]) {
						if (which.keep) {
							arr.push(from.arr[i]);
						} else {
							arr.splice(i, 1);
						}

						break;
					}
				} else if (from.arr[i] == which.arr[j]) {
					if (which.keep) {
						arr.push(from.arr[i]);
					} else {
						arr.splice(i, 1);
					}

					break;
				}
			}
		}

		return arr;
	}
}
