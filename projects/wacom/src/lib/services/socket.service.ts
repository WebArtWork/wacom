import { CONFIG_TOKEN, Config, DEFAULT_CONFIG } from '../interfaces/config';
import { Injectable, Inject, Optional } from '@angular/core';
import { CoreService } from './core.service';
import * as io from "socket.io-client";

@Injectable({
	providedIn: 'root'
})
export class SocketService {
	public url = '';
	private io:any;
	private connected = false;
	load(){
		if (!this.config.socket || !io) return;
		const ioFunc = (io as any).default ? (io as any).default : io;
		if (typeof this.config.socket == 'object' && this.config.socket.url) {
			this.url = this.config.socket.url;
		}
		let opts = {};
		if (typeof this.config.socket == 'object' && this.config.socket.opts) {
			opts = this.config.socket.opts;
		}
		this.io = ioFunc(this.url, opts);
		this.io.on('connect', (socket:any) => {
			this.connected = true;
		});

	}
	constructor(public core: CoreService, @Inject(CONFIG_TOKEN) @Optional() private config: Config){
		this.core.done('socket', this);
		this.url=core.window.location.origin.replace('4200', '8080')
		if(!this.config) this.config = DEFAULT_CONFIG;
		if(this.config.socket){
			this.load();
		}
	}
	on(to:any, cb = (message:any)=>{}):any{
		if(!this.config.socket) return;
		if(!this.connected){
			return setTimeout(()=>{
				this.on(to, cb);
			}, 100);
		}
		this.io.on(to, cb);
	}
	emit(to:any, message:any, room:any = false):any{
		if(!this.config.socket) return;
		if(!this.connected){
			return setTimeout(()=>{
				this.emit(to, message, room);
			}, 100);
		}
		this.io.emit(to, message, room);
	}
}
