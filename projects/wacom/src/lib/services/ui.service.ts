import { Injectable } from '@angular/core';

@Injectable({
	providedIn: 'root',
})
export class UiService {
	private variables: { [key: string]: string } = {};
	private _forms: { [key: string]: any } = {};
	// global variable use for design purposes
	var: Record<string, unknown> = {};

	constructor() {
		const storedVariables = localStorage.getItem('css_variables');
		this.variables = storedVariables ? JSON.parse(storedVariables) : {};
		for (const key in this.variables) {
			this.setProperty(key, this.variables[key]);
		}
	}

	/* Forms Management */
	/**
	 * Manages form states.
	 *
	 * @param id - The form identifier.
	 * @returns The form state object.
	 */
	public form(id: string): any {
		if (typeof id !== 'string') return {};
		if (!this._forms[id]) this._forms[id] = {};
		return this._forms[id];
	}

	/**
	 * Validates input values based on the specified type.
	 *
	 * @param value - The value to validate.
	 * @param kind - The type of validation.
	 * @param extra - Additional validation criteria.
	 * @returns True if the value is valid, false otherwise.
	 */
	public valid(value: any, kind = 'email', extra = 0): boolean {
		const validators: { [key: string]: (value: any) => boolean } = {
			email: (value) =>
				/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,10})+$/.test(
					value || ''
				),
			text: (value) => typeof value === 'string',
			array: (value) => Array.isArray(value),
			object: (value) =>
				typeof value === 'object' &&
				!Array.isArray(value) &&
				value !== null,
			number: (value) => typeof value === 'number',
			password: (value) => {
				if (!value) return false;
				switch (extra) {
					case 1:
						return /^((?=.*[a-z])(?=.*[0-9]))|((?=.*[A-Z])(?=.*[0-9]))/.test(
							value || ''
						);
					case 2:
						return /^(((?=.*[a-z])(?=.*[0-9]))|((?=.*[A-Z])(?=.*[0-9])))(?=.{8,})/.test(
							value || ''
						);
					case 3:
						return /^((?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]))(?=.{8,})/.test(
							value || ''
						);
					case 4:
						return /^((?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[@#$%&!-_]))(?=.{8,})/.test(
							value || ''
						);
					default:
						return !!value;
				}
			},
		};
		return validators[kind] ? validators[kind](value) : false;
	}

	/**
	 * Determines the strength of a password.
	 *
	 * @param value - The password to evaluate.
	 * @returns The strength level of the password.
	 */
	public level(value = ''): number {
		if (!value) return 0;
		let level = 0;
		if (value.length > 8) level++;
		if (/[a-z]/.test(value)) level++;
		if (/[A-Z]/.test(value)) level++;
		if (/[1-9]/.test(value)) level++;
		if (/[`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/.test(value)) level++;
		return level;
	}

	/* CSS Management */
	/**
	 * Saves the CSS variables to local storage.
	 */
	private save(): void {
		localStorage.setItem('css_variables', JSON.stringify(this.variables));
	}

	/**
	 * Sets a CSS variable.
	 *
	 * @param key - The CSS variable name.
	 * @param value - The CSS variable value.
	 */
	private setProperty(key: string, value: string): void {
		document.documentElement.style.setProperty(key, value);
	}

	/**
	 * Sets multiple CSS variables.
	 *
	 * @param variables - The CSS variables to set.
	 * @param opts - Options for setting the variables.
	 */
	public set(variables: { [key: string]: string }, opts: any = {}): void {
		if (typeof opts === 'string') {
			opts = opts === 'local' ? { local: true } : { host: opts };
		}
		if (opts.host && window.location.host !== opts.host) return;
		for (const key in variables) {
			if (opts.local) {
				this.variables[key] = variables[key];
			} else if (this.variables[key]) {
				continue;
			}
			this.setProperty(key, variables[key]);
		}
		if (opts.local) this.save();
	}

	/**
	 * Retrieves the stored CSS variables.
	 *
	 * @returns The stored CSS variables.
	 */
	public get(): { [key: string]: string } {
		return this.variables;
	}

	/**
	 * Removes specified CSS variables.
	 *
	 * @param keys - The keys of the CSS variables to remove.
	 */
	public remove(keys: string | string[]): void {
		const keyArray = Array.isArray(keys) ? keys : keys.split(' ');
		for (const key of keyArray) {
			delete this.variables[key];
		}
		this.save();
	}

	/**
	 * Generates an array of sample data.
	 *
	 * @param arrLen - The length of the array.
	 * @param type - The type of data to generate.
	 * @returns An array of sample data.
	 */
	public arr(arrLen = 10, type: string = 'number'): any[] {
		const arr = [];
		for (let i = 0; i < arrLen; i++) {
			switch (type) {
				case 'number':
					arr.push(i + 1);
					break;
				case 'text':
					arr.push(this.text());
					break;
				case 'date':
					arr.push(new Date(new Date().getTime() + i * 86400000));
					break;
				default:
					arr.push(type);
			}
		}
		return arr;
	}

	/**
	 * Generates a random text string.
	 *
	 * @param length - The length of the text string.
	 * @returns A random text string.
	 */
	public text(length = 10): string {
		const characters =
			'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
		let result = '';
		for (let i = 0; i < length; i++) {
			result += characters.charAt(
				Math.floor(Math.random() * characters.length)
			);
		}
		return result;
	}
}
