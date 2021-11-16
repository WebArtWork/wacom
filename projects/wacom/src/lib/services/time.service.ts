import { Injectable } from '@angular/core';

@Injectable({
	providedIn: 'root'
})
export class TimeService {
	constructor() {}
	day(which:any, format='WeekDay'){
		return this.WeekDay[which];
	}
	private WeekDay:any = {
		"0": "Monday",
		"1": "Tuesday",
		"2": "Wednesday",
		"3": "Thursday",
		"4": "Friday",
		"5": "Saturday",
		"6": "Sunday"
	};
}
