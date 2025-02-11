import { Injectable } from '@angular/core';
import { DatePipe } from '@angular/common';

@Injectable({
	providedIn: 'root',
})
export class TimeService {
	private weekDays = [
		'Sunday',
		'Monday',
		'Tuesday',
		'Wednesday',
		'Thursday',
		'Friday',
		'Saturday',
	];

	constructor(private datePipe: DatePipe) {}

	/**
	 * Returns the name of the day of the week for a given date.
	 *
	 * @param date - The date for which to get the day of the week.
	 * @param format - The format in which to return the day name. Default is 'long'.
	 * @returns The name of the day of the week.
	 */
	getDayName(date: Date, format: 'short' | 'long' = 'long'): string {
		const dayIndex = date.getDay();
		return format === 'short'
			? this.weekDays[dayIndex].substring(0, 3)
			: this.weekDays[dayIndex];
	}

	/**
	 * Formats a date according to the specified format and timezone.
	 *
	 * @param date - The date to format.
	 * @param format - The format string (see Angular DatePipe documentation for format options).
	 * @param timezone - The timezone to use for formatting.
	 * @returns The formatted date string.
	 */
	formatDate(
		date: Date,
		format: string = 'mediumDate',
		timezone: string = 'UTC'
	): string {
		return this.datePipe.transform(date, format, timezone) || '';
	}

	/**
	 * Converts a date to a different timezone.
	 *
	 * @param date - The date to convert.
	 * @param timezone - The timezone to convert to.
	 * @returns The date in the new timezone.
	 */
	convertToTimezone(date: Date, timezone: string): Date {
		return new Date(date.toLocaleString('en-US', { timeZone: timezone }));
	}

	/**
	 * Returns the start of the day for a given date.
	 *
	 * @param date - The date for which to get the start of the day.
	 * @returns The start of the day (midnight) for the given date.
	 */
	startOfDay(date: Date): Date {
		const newDate = new Date(date);
		newDate.setHours(0, 0, 0, 0);
		return newDate;
	}

	/**
	 * Returns the end of the day for a given date.
	 *
	 * @param date - The date for which to get the end of the day.
	 * @returns The end of the day (one millisecond before midnight) for the given date.
	 */
	endOfDay(date: Date): Date {
		const newDate = new Date(date);
		newDate.setHours(23, 59, 59, 999);
		return newDate;
	}

	/**
	 * Returns the number of days in a given month and year.
	 *
	 * @param month - The month (0-11).
	 * @param year - The year.
	 * @returns The number of days in the month.
	 */
	getDaysInMonth(month: number, year: number): number {
		return new Date(year, month + 1, 0).getDate();
	}

	/**
	 * Checks if a given year is a leap year.
	 *
	 * @param year - The year to check.
	 * @returns True if the year is a leap year, false otherwise.
	 */
	isLeapYear(year: number): boolean {
		return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
	}

	/**
	 * Adds a specified number of days to a date.
	 *
	 * @param date - The date to which to add days.
	 * @param days - The number of days to add.
	 * @returns The new date with the added days.
	 */
	addDays(date: Date, days: number): Date {
		const newDate = new Date(date);
		newDate.setDate(newDate.getDate() + days);
		return newDate;
	}

	/**
	 * Adds a specified number of months to a date.
	 *
	 * @param date - The date to which to add months.
	 * @param months - The number of months to add.
	 * @returns The new date with the added months.
	 */
	addMonths(date: Date, months: number): Date {
		const newDate = new Date(date);
		newDate.setMonth(newDate.getMonth() + months);
		return newDate;
	}

	/**
	 * Adds a specified number of years to a date.
	 *
	 * @param date - The date to which to add years.
	 * @param years - The number of years to add.
	 * @returns The new date with the added years.
	 */
	addYears(date: Date, years: number): Date {
		const newDate = new Date(date);
		newDate.setFullYear(newDate.getFullYear() + years);
		return newDate;
	}

	/**
	 * Subtracts a specified number of days from a date.
	 *
	 * @param date - The date from which to subtract days.
	 * @param days - The number of days to subtract.
	 * @returns The new date with the subtracted days.
	 */
	subtractDays(date: Date, days: number): Date {
		return this.addDays(date, -days);
	}

	/**
	 * Subtracts a specified number of months from a date.
	 *
	 * @param date - The date from which to subtract months.
	 * @param months - The number of months to subtract.
	 * @returns The new date with the subtracted months.
	 */
	subtractMonths(date: Date, months: number): Date {
		return this.addMonths(date, -months);
	}

	/**
	 * Subtracts a specified number of years from a date.
	 *
	 * @param date - The date from which to subtract years.
	 * @param years - The number of years to subtract.
	 * @returns The new date with the subtracted years.
	 */
	subtractYears(date: Date, years: number): Date {
		return this.addYears(date, -years);
	}

	/**
	 * Checks if two dates are on the same day.
	 *
	 * @param date1 - The first date.
	 * @param date2 - The second date.
	 * @returns True if the dates are on the same day, false otherwise.
	 */
	isSameDay(date1: Date, date2: Date): boolean {
		return (
			date1.getFullYear() === date2.getFullYear() &&
			date1.getMonth() === date2.getMonth() &&
			date1.getDate() === date2.getDate()
		);
	}

	/**
	 * Returns the ISO week number for a given date.
	 *
	 * @param date - The date for which to get the week number.
	 * @returns The ISO week number (1-53).
	 */
	getWeekNumber(date: Date): number {
		const tempDate = new Date(date.getTime());
		tempDate.setHours(0, 0, 0, 0);
		// Set to nearest Thursday: current date + 4 - current day number, making Thursday day 4
		tempDate.setDate(tempDate.getDate() + 4 - (tempDate.getDay() || 7));
		const yearStart = new Date(tempDate.getFullYear(), 0, 1);
		// Calculate full weeks to nearest Thursday
		return Math.ceil(
			((tempDate.getTime() - yearStart.getTime()) / 86400000 + 1) / 7
		);
	}

	/**
	 * Returns the number of weeks in a month for a given month and year.
	 *
	 * @param month - The month (0-11).
	 * @param year - The year.
	 * @returns The number of weeks in the month.
	 */
	getWeeksInMonth(month: number, year: number): number {
		const firstDayOfMonth = new Date(year, month, 1);
		const lastDayOfMonth = new Date(year, month + 1, 0);
		// Get ISO week numbers for the first and last day of the month
		const firstWeek = this.getWeekNumber(firstDayOfMonth);
		let lastWeek = this.getWeekNumber(lastDayOfMonth);
		// Special case: when January 1st is in the last week of the previous year
		if (firstWeek > lastWeek) {
			lastWeek = this.getWeekNumber(new Date(year, 11, 31)); // Get week of the last day of the year
		}
		return lastWeek - firstWeek + 1;
	}
}
