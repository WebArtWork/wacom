import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
	name: 'number',
})
export class NumberPipe implements PipeTransform {
	transform(value: unknown): number {
		const result = Number(value); // Convert value to a number

		return isNaN(result) ? 0 : result; // Return 0 if conversion fails
	}
}
