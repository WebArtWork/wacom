import { Injectable } from '@angular/core';
import { CoreService } from './core.service';

@Injectable({
	providedIn: 'root',
})
export class HashService {
	private replacements = [
		{
			from: '%20',
			to: ' ',
		},
	];
	public hash: { [key: string]: string } = {};
	private done: boolean = false;

	constructor(private core: CoreService) {
		this.initialize();
	}

	/**
	 * Initializes the hash service by loading the current hash from the URL.
	 */
	private initialize(): void {
		if (!this.core.window.location.hash) {
			this.done = true;
			return;
		}
		this.load();
		this.done = true;
	}

	/**
	 * Loads the current hash from the URL into the hash object.
	 */
	private load(): void {
		this.hash = {};
		const hashArray = this.core.window.location.hash
			.replace('#!#', '')
			.replace('#', '')
			.split('&');

		for (const hashItem of hashArray) {
			let [holder, value] = hashItem.split('=');
			holder = this.applyReplacements(holder);
			value = this.applyReplacements(value);
			this.hash[holder] = value;
		}
	}

	/**
	 * Applies replacements to a given string based on the replacements array.
	 *
	 * @param str - The string to apply replacements to.
	 * @returns The string with replacements applied.
	 */
	private applyReplacements(str: string | undefined): string {
		if (!str) return '';
		for (const replacement of this.replacements) {
			str = str.split(replacement.from).join(replacement.to);
		}
		return str;
	}

	/**
	 * Executes a callback with the value of a specific hash field once the hash is loaded.
	 *
	 * @param field - The hash field to get the value for.
	 * @param cb - The callback to execute with the value.
	 */
	on(field: string, cb: (value: string) => void): void {
		if (!this.done) {
			setTimeout(() => this.on(field, cb), 100);
			return;
		}
		cb(this.hash[field]);
	}

	/**
	 * Saves the current hash object to the URL.
	 */
	save(): void {
		const hash = Object.entries(this.hash)
			.map(([key, value]) => `${key}=${value}`)
			.join('&');
		this.core.window.location.hash = hash;
	}

	/**
	 * Sets a value for a specific hash field and updates the URL.
	 *
	 * @param field - The hash field to set the value for.
	 * @param value - The value to set.
	 */
	set(field: string, value: string): void {
		this.hash[field] = value;
		this.save();
	}

	/**
	 * Gets the value of a specific hash field.
	 *
	 * @param field - The hash field to get the value for.
	 * @returns The value of the hash field.
	 */
	get(field: string): string | undefined {
		return this.hash[field];
	}

	/**
	 * Clears a specific hash field or all hash fields and updates the URL.
	 *
	 * @param field - The hash field to clear. If not provided, clears all hash fields.
	 */
	clear(field?: string): void {
		if (field) {
			delete this.hash[field];
		} else {
			this.hash = {};
		}
		this.save();
	}
}
