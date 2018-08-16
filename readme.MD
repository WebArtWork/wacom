# wacom waw Angular6 common
Module which support waw project on basic level, elements and scripts which is needed on all projects. 

[Mongo service](https://www.npmjs.com/package/wacom#mongo-service) provide connection between waw crud and everything that will be needed for mongo documents management.

[SD service](https://www.npmjs.com/package/wacom#sd-service) provide collection of functions for general use.

[Modal service](https://www.npmjs.com/package/wacom#modal-service) handling everything that has to be added into modal or alert.

[Popup service](https://www.npmjs.com/package/wacom#popup-service) handling everything that has to be managed as popup on something else.

[Spinner service](https://www.npmjs.com/package/wacom#spinner-service) take care of all loading pieces.

[File service](https://www.npmjs.com/package/wacom#file-service) managing file process, from load any type from user to sent it to server.

[Socket service](https://www.npmjs.com/package/wacom#socket-service) handling the sockets management with server and other clients.

[Image service](https://www.npmjs.com/package/wacom#image-service) take care of everything around pictures on the client side.

[Hash service](https://www.npmjs.com/package/wacom#hash-service) with use of href hash, provide memo sharable points for modals or popups.

Installation:
```bash
$ npm i --save wacom
```


## Mongo Service
Mongo Service is an suportive service for combining angular 6 client with waw CRUD back-end. Which means that you have to use [waw Framework](https://www.npmjs.com/package/waw) or you have to made your back-end routes in a way of waw crud. Example of importing mongo service:
```javascript
import { MongoService } from 'wacom';
constructor(private mongo: MongoService){};
```
### create `function`
connecting with waw CRUD create. As parameters accepting name of mongo collection, object with values for document and optionally callback function which will return the document. Document will be filled inside read callbacks. Example:
```javascript
mongo.create('colName', {
	name: 'docName'
}, created => {
	console.log('document has been created');
});
```
### read `function`
connecting with waw CRUD read. As parameters accepting name of mongo collection, optionally options, optionally callback which will return all documents in array as first parameter and in object with doc._id placeholder for doc as second parameter. Function returning directing array which will host the documents. Example:
```javascript
mongo.get('colName',{
	replace: {
		name: function(val, cb, doc){
			cb(val+'_modified')
		}
	}
}, () => {
	console.log('documents is loaded and field name is modified on each doc.');
})
```
### updateAll `function`
connecting with waw CRUD updateAll. As parameters accepting name of mongo collection, document object, optionally options and optionally callback function which will return the document. Example:
```javascript
mongo.updateAll('colName', {
	name: doc.name,
	_id: doc._id
}, {
	fields: 'name'
}, () => {
	console.log('document is updated');
});
```
### updateUnique `function`
connecting with waw CRUD updateUnique. As parameters accepting name of mongo collection, object with document _id and field value, optionally options and optionally callback function which will return if field has been updated. Example:
```javascript
mongo.updateUnique('colName', {
	name: doc.name,
	_id: doc._id
}, {
	name: 'name'
}, (resp) => {
	if(resp){
		console.log('field is updated');
	}else {
		console.log('field is not updated');
	} 
});
```
### delete `function`
connecting with waw CRUD delete. As parameters accepting name of mongo collection, document object, optionally options and optionally callback function which will return the document. Example:
```javascript
mongo.delate('colName',{
	_id: doc._id
}, {
	name: 'admin'
}, () => {
	console.log('document is deleted');
});
```
### _id `function`
provide new mongo _id. As parameters accepting callback function which will return the _id. Example:
```javascript
mongo._id( _id => {
	console.log(_id);
});
```
### to_id `function`
convert array of documents, object with documents, mixed documents or _id and converting it to array of _id. Example:
```javascript
mongo.to_id([{
	_id: '1'
}, '2']);
// ['1', '2']
mongo.to_id({
	'1': true
	'2': false
});
// ['1']
```
### afterWhile `function`
provide delay on any action, usefull with input and model change. As parameters accepting document, callback and optionally time. Example:
```javascript
mongo.afterWhile(doc, () => {
	console.log('change can be applied');
}, 2000);
```
### populate `function`
making population on specific field with specific collection. Example with doc which will have field as document of part provided: 
```javascript
mongo.populate(doc, 'field', 'colName');
```
### beArr `function`
checking value if it's array then we keep it and in other case, we replace it with new array. Example where each doc will have data as array:
```javascript
mongo.get('colName', {
	replace: {
		data:mongo.beArr
	}
});
```
### beObj `function`
checking value if it's object then we keep it and in other case, we replace it with new object. Example where each doc will have data as array:
```javascript
mongo.get('colName', {
	replace: {
		data:mongo.beObj
	}
});
```
### beDate `function`
making value new Date(valueContent). Example where each doc will have date as date:
```javascript
mongo.get('colName', {
	replace: {
		date:mongo.beDate
	}
});
```
### forceArr `function`
convert any value to array within replace options. Example where each doc will have data as empty array:
```javascript
mongo.get('colName', {
	replace: {
		data:mongo.forceArr
	}
});
```
### forceObj `function`
convert any value to object within replace options. Example where each doc will have data as empty object:
```javascript
mongo.get('colName', {
	replace: {
		data:mongo.forceObj
	}
});
```


## SD Service
## Modal Service
## Popup Service
## Spinner Service
## File Service
## Socket Service
## Image Service
## Hash Service

## License

  [MIT](LICENSE)