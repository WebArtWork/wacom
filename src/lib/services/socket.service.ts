import { CONFIG_TOKEN, Config, DEFAULT_CONFIG } from '../interfaces/config';
import { Injectable, Inject, Optional } from '@angular/core';
import * as io from "socket.io-client";

@Injectable({
	providedIn: 'root'
})
export class SocketService {
	public url = window.location.origin.replace('4200', '8080');
	private io:any;
	private connected = false;
	load(){
		if(!this.config.socket) return;
		const ioFunc = (io as any).default ? (io as any).default : io;
		if(typeof this.config.socket == 'object' && this.config.socket.url){
			this.url = this.config.socket.url;
		}
		let opts = {};
		if(typeof this.config.socket == 'object' && this.config.socket.opts){
			opts = this.config.socket.opts;
		}
		this.io = ioFunc(this.url, opts);
		this.io.on('connect', ()=>{
			this.connected = true;
		});
	}
	constructor(@Inject(CONFIG_TOKEN) @Optional() private config: Config){
		if(!this.config) this.config = DEFAULT_CONFIG;
		if(this.config.socket){
			this.load();
		}
	}
	on(to, cb = message=>{}){
		if(!this.config.socket) return;
		if(!this.connected){
			return setTimeout(()=>{
				this.on(to, cb);
			}, 100);
		}
		this.io.on(to, cb);
	}
	emit(to, message, room:any = false){
		if(!this.config.socket) return;
		if(!this.connected){
			return setTimeout(()=>{
				this.emit(to, message, room);
			}, 100);
		}
		this.io.emit(to, message, room);
	}
}