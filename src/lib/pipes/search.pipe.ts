import { Pipe, PipeTransform } from '@angular/core';
/*
*	Author: Honchar Denys
*	Search for any content in any type of given documents
*	Always returning an array, even if nothing is provided
*/
@Pipe({
	name: 'search'
})
export class SearchPipe implements PipeTransform {
	private c = 0;
	transform(given: any, s?:any, f?:any, l?:any, i?:any, reload?:any): any {
		// given stands for the provided array with docs
		// s stands for search
		// f stands for fields
		// l stands for limit
		// i stands for ignore filter
		if(i || !s) return given||[];
		if(typeof f == 'number'){
			l = f;
			f = null;
		}
		let _arr = [], _check = {};
		if(typeof s == 'object'){
			let _s = [];
			for(let key in s){
				if(s[key]) _s.push(key);
			}
			s = _s;
		}
		if(typeof s == 'string'){
			s = [s];
		}		
		if(!f) f = ['name'];
		if(typeof f == 'string') f = f.split(' ');
		let sub_test = function(obj, _f, initObj, check){
			if(!obj) return;
			if(_f.indexOf('.')>-1){
				let sub = _f.split('.');
				let nsub = sub.shift();
				if(Array.isArray(obj[nsub])){
					for(let s = 0; s < obj[nsub].length; s++){
						sub_test(obj[nsub][s], sub.join('.'), initObj, check);
					}
					return;
				}else{
					return sub_test(obj[nsub], sub.join('.'), initObj, check);
				}
			}
			for (let j = 0; j < s.length; j++) {
				let b = false;
				if(typeof obj[_f] == 'string' && typeof s[j] == 'string' &&
					(obj[_f].toLowerCase().indexOf(s[j].toLowerCase())>-1 ||
					 s[j].toLowerCase().indexOf(obj[_f].toLowerCase())>-1)){
					if(!_check[check]) _arr.push(initObj);
					_check[check] = true;
					b = true;
					break;
				}
				if(b) break;
			}
		}
		let test = function(obj, check) {
			for (let i = 0; i < f.length; i++) {
				sub_test(obj, f[i], obj, check);
			}
		}
		if (Array.isArray(given)) {
			for (let i = 0; i < given.length; i++) {
				test(given[i], i);
			}
		} else if (typeof given == 'object') {
			for (let key in given) {
				test(given[key], key);
			}
		}
		if(l) return _arr.splice(0, l);
		return _arr;
	}

}
