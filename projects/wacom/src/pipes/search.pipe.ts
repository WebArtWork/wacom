import { Pipe, PipeTransform, Signal, isSignal } from '@angular/core';

type Query =
	| string
	| string[]
	| Record<string, unknown>
	| Signal<string | string[] | Record<string, unknown> | undefined>;

type Field =
	| string
	| string[]
	| number
	| Signal<string | string[] | number | undefined>;

@Pipe({ name: 'search', pure: true })
export class SearchPipe implements PipeTransform {
	transform<T>(
		items: T[] | Record<string, T>,
		query?: Query,
		fields?: Field,
		limit?: number,
		ignore = false,
		_reload?: unknown
	): T[] {
		/* unwrap signals */
		const q = isSignal(query) ? query() : query;

		let f = isSignal(fields) ? fields() : fields;

		/* allow “fields” to be a number (=limit) */
		if (typeof f === 'number') {
			limit = f;

			f = undefined;
		}

		const docs = Array.isArray(items) ? items : Object.values(items);

		if (ignore || !q) return limit ? docs.slice(0, limit) : docs;

		/* normalise fields */
		const paths: string[] = !f
			? ['name']
			: Array.isArray(f)
			? f
			: f.trim().split(/\s+/);

		/* normalise query */
		const needles: string[] = Array.isArray(q)
			? q.map((s) => s.toLowerCase())
			: typeof q === 'object'
			? Object.keys(q)
					.filter((k) => (q as any)[k])
					.map((k) => k.toLowerCase())
			: [q.toLowerCase()];

		const txtMatches = (val: any) => {
			if (val == null) return false;

			const hay = val.toString().toLowerCase();

			return needles.some((n) => hay.includes(n) || n.includes(hay));
		};

		const walk = (obj: any, parts: string[]): boolean => {
			if (!obj) return false;

			const [head, ...rest] = parts;

			const next = obj[head];

			if (Array.isArray(next))
				return next.some((v) =>
					rest.length ? walk(v, rest) : txtMatches(v)
				);

			return rest.length ? walk(next, rest) : txtMatches(next);
		};

		const out: T[] = [];

		const seen = new Set<number | string>();

		const check = (doc: T, key: number | string) => {
			for (const p of paths) {
				if (walk(doc, p.split('.'))) {
					if (!seen.has(key)) {
						out.push(doc);

						seen.add(key);
					}

					break;
				}
			}
		};

		Array.isArray(items)
			? docs.forEach((d, i) => check(d, i))
			: Object.entries(items).forEach(([k, v]) => check(v, k));

		return limit ? out.slice(0, limit) : out;
	}
}
