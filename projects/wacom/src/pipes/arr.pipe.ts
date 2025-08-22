import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
	name: 'arr',
})
export class ArrPipe implements PipeTransform {
	transform(data: any, type?: any, refresh?: any): any {
		if (!data) {
			return [];
		}

		if (typeof data == 'string') return data.split(type || ' ');

		if (Array.isArray(data)) {
			return data;
		}

		if (typeof data != 'object') {
			return [];
		}

		let arr = [];

		for (let each in data) {
			if (!data[each]) continue;

			if (type == 'prop') {
				arr.push(each);
			} else if (type == 'value') {
				arr.push(data[each]);
			} else {
				arr.push({
					prop: each,
					value: data[each],
				});
			}
		}

		return arr;
	}
}
