import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
	name: 'ota'
})
export class OtaPipe implements PipeTransform {
	transform(obj: any, holder?: any, refresh?: any): any {
		if(Array.isArray(obj)) return obj;
		if(typeof obj != 'object') return [];
		let arr = [];
		for(let each in obj){
			if(obj[each]){
				if(holder) arr.push(each);
				else arr.push(obj[each]);
			}
		}
		return arr;
	}
}
