import { DatePipe } from '@angular/common';
import { TimeService } from './time.service';

describe('TimeService', () => {
	let service: TimeService;

	beforeEach(() => {
	        service = new TimeService(new DatePipe('en-US'));
	});

	it('returns long month name', () => {
	        expect(service.getMonthName(0, 'long')).toBe('January');
	});

	it('returns short month name', () => {
	        expect(service.getMonthName(0, 'short')).toBe('Jan');
	});

	it('throws for invalid month index', () => {
	        expect(() => service.getMonthName(12)).toThrowError(RangeError);
	});
});

