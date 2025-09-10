import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
	name: 'page',
	pure: false,
})
export class PaginationPipe implements PipeTransform {
	transform(arr: any, config: any, sort: any, search = ''): any {
		if (!Array.isArray(arr)) return [];

		arr = arr.slice();

		for (let i = 0; i < arr.length; i++) {
			arr[i].num = i + 1;
		}

		if (sort.direction) {
			arr.sort((a: any, b: any) => {
				if (a[sort.title] < b[sort.title]) {
					return sort.direction == 'desc' ? 1 : -1;
				}

				if (a[sort.title] > b[sort.title]) {
					return sort.direction == 'desc' ? -1 : 1;
				}

				return 0;
			});
		}

		return arr.slice(
			(config.page - 1) * config.perPage,
			config.page * config.perPage,
		);
	}
}
