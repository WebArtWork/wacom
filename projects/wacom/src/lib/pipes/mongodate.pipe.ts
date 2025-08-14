import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
        name: 'mongodate',
        standalone: true,
})
export class MongodatePipe implements PipeTransform {
	transform(_id: any) {
		if (!_id) return new Date();
		let timestamp = _id.toString().substring(0, 8);
		return new Date(parseInt(timestamp, 16) * 1000);
	}
}
