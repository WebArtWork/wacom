import { isPlatformBrowser } from '@angular/common';
import {
	Inject,
	Injectable,
	Optional,
	PLATFORM_ID,
	inject,
} from '@angular/core';
import {
	Config,
	CONFIG_TOKEN,
	DEFAULT_CONFIG,
} from '../interfaces/config.interface';
import { EmitterService } from './emitter.service';

@Injectable({
	providedIn: 'root',
})
export class SocketService {
	private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

	private _url = '';

	private _io: any;

	private _connected = false;

	private _opts: any = {};

	constructor(@Inject(CONFIG_TOKEN) @Optional() private _config: Config) {
		this._config = { ...DEFAULT_CONFIG, ...(this._config || {}) };

		if (!this.isBrowser) {
			return;
		}

		if (!this._config.io) {
			return;
		}

		const url = new URL(window.location.origin);

		if (typeof this._config.socket === 'object') {
			if (this._config.socket.port) {
				url.port = this._config.socket.port;
			}

			if (this._config.socket.opts) {
				this._opts = this._config.socket.opts;
			}

			this._url = this._config.socket.url ?? url.origin;
		} else {
			this._url = url.origin;
		}

		if (this._config.socket) {
			this.load();
		}
	}

	/**
	 * Sets the URL for the WebSocket connection and reloads the socket.
	 * @param url - The URL of the WebSocket server.
	 */
	setUrl(url: string): void {
		this._url = url;

		if (!this._config.socket) {
			this._config.socket = true;
		}

		if (this.isBrowser) {
			this.load();
		}
	}

	/**
	 * Loads and initializes the WebSocket connection.
	 */
	private load(): void {
		if (!this.isBrowser) return;

		if (this._config.io) {
			const ioFunc = this._config.io.default
				? this._config.io.default
				: this._config.io;

			this._io = ioFunc(this._url, this._opts);

			this._io.on('connect', () => {
				this._connected = true;

				this._emitterService.complete('socket');
			});

			this._io.on('disconnect', (reason: any) => {
				this._connected = false;

				this._emitterService.emit('socket_disconnect', reason);

				console.warn('Socket disconnected', reason);
			});

			this._io.on('error', (err: any) => {
				this._connected = false;

				this._emitterService.emit('socket_error', err);

				console.warn('Socket error', err);
			});
		}
	}

	/**
	 * Disconnects the WebSocket connection and resets the connection state.
	 */
	disconnect(): void {
		if (this._io) {
			this._io.disconnect();
		}

		this._connected = false;
	}

	/**
	 * Subscribes to a WebSocket event.
	 * @param to - The event to subscribe to.
	 * @param cb - The callback function to execute when the event is received.
	 */
	on(to: string, cb: (message: any) => void = () => {}): void {
		if (!this._config.socket) {
			return;
		}

		if (!this._io) {
			console.warn('Socket client not loaded.');
			return;
		}

		if (!this._connected) {
			setTimeout(() => {
				this.on(to, cb);
			}, 100);
			return;
		}

		this._io.on(to, cb);
	}

	/**
	 * Emits a message to a WebSocket event.
	 * @param to - The event to emit the message to.
	 * @param message - The message to emit.
	 * @param room - Optional room to emit the message to.
	 */
	emit(to: string, message: any, room: any = false): void {
		if (!this._config.socket) {
			return;
		}

		if (!this._io) {
			console.warn('Socket client not loaded.');
			return;
		}

		if (!this._connected) {
			setTimeout(() => {
				this.emit(to, message, room);
			}, 100);
			return;
		}

		this._io.emit(to, message, room);
	}

	private _emitterService = inject(EmitterService);
}
