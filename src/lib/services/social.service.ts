import { Injectable } from '@angular/core';
import { CoreService } from './core.service';
import { HttpService } from './http.service';
declare var facebookConnectPlugin:any;
@Injectable({
	providedIn: 'root'
})
export class SocialService {
	constructor(private core: CoreService, private http: HttpService){}
	facebook(cb=(user:any)=>{}){
		if(this.core.ready('mobile') && facebookConnectPlugin){
			facebookConnectPlugin.login('profile', (resp:any)=>{
				this.http.post('/api/user/facebook/token', {
					access_token: resp.authResponse.accessToken
				}, cb);
			}, ()=>{

			});
		}else{
			window.location.replace('/api/user/facebook');
		}
	}
}
