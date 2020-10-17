import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
	name: 'each'
})
export class EachPipe implements PipeTransform {
	transform(obj: any, holder?: any, refresh?): any {
		if (!obj) { return []; }
		if (Array.isArray(obj)) { return obj; }
		if (typeof obj != 'object') { return []; }
		const arr = [];
		for (const each in obj) {
			if (holder == 2) { arr.push({holder: each, value: obj[each]}); }
			else if (holder) { arr.push(each); } else { arr.push(obj[each]); }
		}
		return arr;
	}
}