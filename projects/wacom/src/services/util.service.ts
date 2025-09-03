import { Injectable, WritableSignal, signal } from '@angular/core';

type Dict<T = unknown> = Record<string, T>;

@Injectable({ providedIn: 'root' })
export class UtilService {
	// --- CSS variables (persisted) ---
	private readonly _storageKey = 'css_variables';
	private _css: Dict<string> = {};
	private _cssSig = signal<Dict<string>>({});

	// --- Forms store ---
	private _forms = new Map<string, WritableSignal<any>>();

	// --- Global bag for design/debug ---
	var: Dict = {};

	/**
	 * Initialize service state: load persisted CSS variables from localStorage
	 * and apply them to the document root. Emits the initial CSS snapshot.
	 */
	constructor() {
		this._loadCss();
		// apply on boot
		for (const k of Object.keys(this._css))
			this._setProperty(k, this._css[k]);
		this._cssSig.set({ ...this._css });
	}

	// ===== Forms Management =====

	/** Get or create a form state as a writable signal */
	formSignal<T = any>(id: string): WritableSignal<T> {
		let s = this._forms.get(id);
		if (!s) {
			s = signal<T>({} as T);
			this._forms.set(id, s);
		}
		return s as WritableSignal<T>;
	}

	/** Back-compat: returns the current form object (mutable reference). Prefer formSignal(). */
	form<T = any>(id: string): T {
		const s = this.formSignal<T>(id);
		const v = s();
		if (v && typeof v === 'object') return v;
		const obj = {} as T;
		s.set(obj);
		return obj;
	}

	/**
	 * Check whether a form signal has been created for the given id.
	 * @param id Unique form identifier.
	 * @returns True if a signal exists for the id.
	 */
	hasForm(id: string): boolean {
		return this._forms.has(id);
	}

	/**
	 * Remove form state associated with the given id.
	 * @param id Unique form identifier to clear.
	 */
	clearForm(id: string): void {
		this._forms.delete(id);
	}

	// ===== Validation =====

	/**
	 * Validate a value against a specific kind.
	 * - email: RFC-light pattern check.
	 * - text: typeof string.
	 * - array: Array.isArray.
	 * - object: non-null plain object.
	 * - number: finite number.
	 * - password: strength tiers (extra 0..4).
	 * @param value Input to validate.
	 * @param kind Validation kind.
	 * @param extra Additional constraint for passwords: 0..4 increasing strength.
	 * @returns True if value passes validation.
	 */
	valid(
		value: any,
		kind:
			| 'email'
			| 'text'
			| 'array'
			| 'object'
			| 'number'
			| 'password' = 'email',
		extra = 0,
	): boolean {
		switch (kind) {
			case 'email':
				return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,10})+$/.test(
					value || '',
				);
			case 'text':
				return typeof value === 'string';
			case 'array':
				return Array.isArray(value);
			case 'object':
				return (
					typeof value === 'object' &&
					!Array.isArray(value) &&
					value !== null
				);
			case 'number':
				return typeof value === 'number' && Number.isFinite(value);
			case 'password':
				if (!value) return false;
				switch (extra) {
					case 1:
						return /^((?=.*[a-z])(?=.*[0-9]))|((?=.*[A-Z])(?=.*[0-9]))/.test(
							value,
						);
					case 2:
						return /^(((?=.*[a-z])(?=.*[0-9]))|((?=.*[A-Z])(?=.*[0-9])))(?=.{8,})/.test(
							value,
						);
					case 3:
						return /^((?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]))(?=.{8,})/.test(
							value,
						);
					case 4:
						return /^((?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[@#$%&!\-_]))(?=.{8,})/.test(
							value,
						);
					default:
						return !!value;
				}
		}
	}

	/** Password strength: 0..5 */
	level(value = ''): number {
		if (!value) return 0;
		let lvl = 0;
		if (value.length > 8) lvl++;
		if (/[a-z]/.test(value)) lvl++;
		if (/[A-Z]/.test(value)) lvl++;
		if (/[0-9]/.test(value)) lvl++;
		if (/[`~!@#$%^&*()_\-+=\[\]{};:'",.<>/?\\|]/.test(value)) lvl++;
		return lvl;
	}

	// ===== CSS Variables Management =====

	/** Set multiple CSS vars. opts: { local?: boolean; host?: string } */
	setCss(
		vars: Dict<string>,
		opts: { local?: boolean; host?: string } | string = {},
	): void {
		if (typeof opts === 'string') {
			opts = opts === 'local' ? { local: true } : { host: opts };
		}
		const { local = false, host } = opts as {
			local?: boolean;
			host?: string;
		};
		if (
			host &&
			typeof window !== 'undefined' &&
			window.location.host !== host
		)
			return;

		for (const k of Object.keys(vars)) {
			const v = vars[k];
			if (local) {
				this._css[k] = v;
			} else if (this._css[k]) {
				// keep persisted value unless explicitly local
				this._setProperty(k, this._css[k]);
				continue;
			}
			this._setProperty(k, v);
		}

		if (local) {
			this._saveCss();
			this._cssSig.set({ ...this._css });
		}
	}

	/** Current persisted CSS vars snapshot */
	getCss(): Dict<string> {
		return { ...this._css };
	}

	/** Reactive signal with current persisted CSS vars */
	cssSignal(): WritableSignal<Dict<string>> {
		return this._cssSig;
	}

	/** Remove persisted vars by key(s) and save */
	removeCss(keys: string | string[]): void {
		const list = Array.isArray(keys) ? keys : keys.split(' ');
		for (const k of list) delete this._css[k];
		this._saveCss();
		this._cssSig.set({ ...this._css });
	}

	// ===== Generators =====

	/**
	 * Generate an array of given length filled with sequential numbers (1..n),
	 * random text, dates from today, or a constant value.
	 * @param len Desired array length.
	 * @param type 'number' | 'text' | 'date' | any other constant value to repeat.
	 * @returns Generated array.
	 */
	arr(len = 10, type: 'number' | 'text' | 'date' | string = 'number'): any[] {
		const out: any[] = [];
		for (let i = 0; i < len; i++) {
			switch (type) {
				case 'number':
					out.push(i + 1);
					break;
				case 'text':
					out.push(this.text());
					break;
				case 'date':
					out.push(new Date(Date.now() + i * 86_400_000));
					break;
				default:
					out.push(type);
			}
		}
		return out;
	}

	/**
	 * Create a random alphanumeric string.
	 * @param length Number of characters to generate.
	 * @returns Random string of requested length.
	 */
	text(length = 10): string {
		const chars =
			'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
		let res = '';
		for (let i = 0; i < length; i++)
			res += chars.charAt(Math.floor(Math.random() * chars.length));
		return res;
	}

	// ===== Internals =====

	/** Persist current CSS variables to localStorage. */
	private _saveCss(): void {
		try {
			if (typeof localStorage !== 'undefined') {
				localStorage.setItem(
					this._storageKey,
					JSON.stringify(this._css),
				);
			}
		} catch {}
	}

	/** Load CSS variables snapshot from localStorage into memory. */
	private _loadCss(): void {
		try {
			if (typeof localStorage !== 'undefined') {
				const raw = localStorage.getItem(this._storageKey);
				this._css = raw ? JSON.parse(raw) : {};
			}
		} catch {
			this._css = {};
		}
	}

	/**
	 * Apply a CSS variable to the :root element.
	 * @param key CSS custom property name (e.g., --brand-color).
	 * @param value CSS value to set.
	 */
	private _setProperty(key: string, value: string): void {
		try {
			if (typeof document !== 'undefined') {
				document.documentElement.style.setProperty(key, value);
			}
		} catch {}
	}
}
