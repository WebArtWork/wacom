import { Injectable, WritableSignal, signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import {
	Observable,
	Subject,
	combineLatest,
	filter,
	map,
	merge,
	share,
	skip,
	take,
	takeUntil,
	timeout,
} from 'rxjs';

type Any = unknown;

@Injectable({ providedIn: 'root' })
export class EmitterService {
	private _signals = new Map<string, WritableSignal<Any>>();
	private _closers = new Map<string, Subject<void>>();
	private _streams = new Map<string, Observable<Any>>();

	private _getSignal(id: string): WritableSignal<Any> {
		let s = this._signals.get(id);
		if (!s) {
			// emit even if same payload repeats
			s = signal<Any>(undefined, { equal: () => false });
			this._signals.set(id, s);
		}
		return s;
	}

	private _getCloser(id: string): Subject<void> {
		let c = this._closers.get(id);
		if (!c) {
			c = new Subject<void>();
			this._closers.set(id, c);
		}
		return c;
	}

	private _getStream(id: string): Observable<Any> {
		let obs$ = this._streams.get(id);
		if (!obs$) {
			const sig = this._getSignal(id);
			const closed$ = this._getCloser(id);
			obs$ = toObservable(sig).pipe(
				// Subject-like: don't replay the current value on subscribe
				skip(1),
				takeUntil(closed$),
				share(),
			);
			this._streams.set(id, obs$);
		}
		return obs$;
	}

	/** Emit an event */
	emit<T = Any>(id: string, data?: T): void {
		this._getSignal(id).set(data as Any);
	}

	/** Listen for events (hot, completes when off(id) is called) */
	on<T = Any>(id: string): Observable<T> {
		return this._getStream(id) as Observable<T>;
	}

	/** Complete and remove a channel */
	off(id: string): void {
		const closer = this._closers.get(id);
		if (closer) {
			closer.next();
			closer.complete();
			this._closers.delete(id);
		}
		this._signals.delete(id);
		this._streams.delete(id);
	}

	offAll(): void {
		for (const id of Array.from(this._closers.keys())) this.off(id);
	}

	has(id: string): boolean {
		return this._signals.has(id);
	}

	private _done = new Map<string, WritableSignal<Any | undefined>>();

	private _getDoneSignal(id: string): WritableSignal<Any | undefined> {
		let s = this._done.get(id);
		if (!s) {
			s = signal<Any | undefined>(undefined);
			this._done.set(id, s);
		}
		return s;
	}

	/** Mark task as completed with a payload (default: true) */
	complete<T = Any>(task: string, value: T = true as unknown as T): void {
		this._getDoneSignal(task).set(value as Any);
	}

	/** Clear completion so it can be awaited again */
	clearCompleted(task: string): void {
		const s = this._done.get(task) ?? this._getDoneSignal(task);
		s.set(undefined);
	}

	/** Read current completion payload (undefined => not completed) */
	completed(task: string): Any | undefined {
		return this._getDoneSignal(task)();
	}

	isCompleted(task: string): boolean {
		return this._getDoneSignal(task)() !== undefined;
	}

	onComplete(
		tasks: string | string[],
		opts?: {
			mode?: 'all' | 'any';
			timeoutMs?: number;
			abort?: AbortSignal;
		},
	): Observable<Any | Any[]> {
		const list = (Array.isArray(tasks) ? tasks : [tasks]).filter(Boolean);
		const streams = list.map((id) =>
			toObservable(this._getDoneSignal(id)).pipe(
				filter((v): v is Any => v !== undefined),
				map((v) => v as Any),
			),
		);

		let source$: Observable<Any | Any[]>;

		if (list.length <= 1) {
			// single-task await
			source$ = streams[0]?.pipe(take(1)) ?? new Observable<never>();
		} else if (opts?.mode === 'any') {
			source$ = merge(...streams).pipe(take(1));
		} else {
			source$ = combineLatest(streams).pipe(take(1));
		}

		if (opts?.timeoutMs && Number.isFinite(opts.timeoutMs)) {
			source$ = source$.pipe(timeout({ first: opts.timeoutMs }));
		}

		if (opts?.abort) {
			const abort$ = new Observable<void>((sub) => {
				const handler = () => {
					sub.next();
					sub.complete();
				};
				opts.abort!.addEventListener('abort', handler);
				return () => opts.abort!.removeEventListener('abort', handler);
			});
			source$ = source$.pipe(takeUntil(abort$));
		}

		return source$;
	}
}
