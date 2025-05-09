import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'split',
    standalone: false
})
export class SplitPipe implements PipeTransform {
	transform(value: string, index = 0, devider = ':'): unknown {
		const arr = value.split(devider);

		return arr.length > index ? arr[index] : '';
	}
}
