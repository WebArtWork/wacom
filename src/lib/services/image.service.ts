import { Injectable } from '@angular/core';

@Injectable({
	providedIn: 'root'
})
export class ImageService {
	
resizeUpTo(info, callback){
	if(!info) return console.log('No image');
	info.width = info.width || 1920;
	info.height = info.height || 1080;
	if(info.type!="image/jpeg" && info.type!="image/png")
	    return console.log("You must upload file only JPEG or PNG format.");
	let reader = new FileReader();
	reader.onload = function(loadEvent) {
	    let canvasElement = document.createElement('canvas');
	    let imageElement = document.createElement('img');
	    let width;
	    let height;
	    imageElement.onload = function() {
	        let infoRatio = info.width / info.height;
	        let imgRatio = imageElement.width / imageElement.height;
	        if (imgRatio > infoRatio) {
	            width = info.width;
	            height = width / imgRatio;
	        } else {
	            height = info.height;
	            width = height * imgRatio;
	        }
	        canvasElement.width = width;
	        canvasElement.height = height;
	        let context = canvasElement.getContext('2d');
	        context.drawImage(imageElement, 0, 0 , width, height);
	        callback(canvasElement.toDataURL('image/png', 1));
	    };
	    imageElement.src = reader.result;
	};
	reader.readAsDataURL(info);
}

	constructor() {}
}
