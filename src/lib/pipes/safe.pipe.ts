import { Pipe } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
@Pipe({name: 'safe'})
export class SafePipe {
	constructor(private sanitizer: DomSanitizer){}
	transform(html) {
		return this.sanitizer.bypassSecurityTrustResourceUrl(html);
	}
}