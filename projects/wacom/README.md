# Angular (ngx) common
Module which has common services and components which can be used on all projects.

## Getting Started

### License
[MIT](LICENSE)

### Instalation
```bash
$ npm i --save wacom
```

### Services
| Name | Description |
| ------- |:-----:|
| [**`Core`**](https://www.npmjs.com/package/wacom#core-service) | Common supportive function which can be used in any service |
| [**`Http`**](https://www.npmjs.com/package/wacom#http-service) | Http layer for HttpClient |
| [**`Store`**](https://www.npmjs.com/package/wacom#store-service) | Service will is responsible for keeping information on the device |
| [**`Hash`**](https://www.npmjs.com/package/wacom#hash-service) | Hash management for easily use, storage which stay in url |
| [**`Render`**](https://www.npmjs.com/package/wacom#render-service) | Make not automated render management well structured |
| [**`Meta`**](https://www.npmjs.com/package/wacom#meta-service) | Website meta tags management within router |
| [**`Alert`**](https://www.npmjs.com/package/wacom#alert-service) | Alerts management |
| [**`Modal`**](https://www.npmjs.com/package/wacom#modal-service) | Modals management |
| [**`Loader`**](https://www.npmjs.com/package/wacom#loader-service) | Loaders management |
| [**`UI`**](https://www.npmjs.com/package/wacom#ui-service) | Supportive UI/UX service |

### Components
| Name | Description |
| ------- |:-----:|
| [**`Picker`**](https://www.npmjs.com/package/wacom#picker-component) | Huge common component which is used to take information from user |

## Core Service
### device
### version
### set_version
### host
### parallel
### serial
### each
### afterWhile
### emit
### on
### done
### ready
### next
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
	},
	name: 'me',
	next: {
		name: 'friends',
		next: {
			name: 'near',
			next: {
				name: 'city',
				next: {
					name: 'country'
				}
			}
		}
	},
	populate: [{
		field: 'author',
		part: 'user'
	}],
	groups: 'city name' || ['city', 'name'] || {
		first_name: {
			field: function(doc, cb){
				if(doc.name.split(' ').length>1) cb(doc.name.split(' ')[1]);
				retun doc.name.split(' ')[0];
			},
			allow: function(doc){
				return !!doc.name;
			},
			ignore: function(){
				return false;
			},
			sort: function(){

			}
		}
	},
	query: {
		male: function(doc){
			return doc.gender;
		},
		female: {
			allow: function(doc){
				return !doc.gender;
			},
			ignore: function(){
				return typeof doc.gender != 'boolean';
			},
			sort: function(a, b){
				if(a.order > b.order) return -1;
				return 1;
			}
		}
	}
}, (arr, obj, name, resp) => {
/*
*	arr will be array with total docs from that part
*	obj will be object with total docs from that part binded by _id
*	groups will be saved into obj in the way: obj.name['Denys'] or obj.city['Kiev']
*	name is the name of current pull from server
*	resp is the array of responsinse with documents queried
*/
})
```
#### replace `options`
work as filler of each doc for cases when we can calculate things to use in website. Good example can be currencies which change each moment, we have product in one currency and we want to show it in different currrencies. Other good example can be date fields, which is saved as string and we need them in `new Date()` format.
#### populate `options`
works in the same way as populate of mongodb but in the client side. This works great when you need documents inside other documents and put on them sorting or other things.
#### groups `options`
makings arrays which show different documents inside specific placeholders. As example we can have list of users in specific town or country, so we don't have to create pipes for that.
#### next `options`
works as level of pulling different documents from the server. This is mostly made for performance, so user can have the info he needs directly.
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
### on `function`
accepting array or string of parts and callback which will be called when all parts will be loaded.
Example:
```javascript
mongo.on('user post', () => {
	console.log('user and post part has been loaded');
});
```
## Sort
Set of functions, which are accepted by th function ```array.sort()``` as a parameter. Each of these functions is for sorting documents(objects).
### sortAscId `function`
accepting array of objects and return it sorted in ascending order by _id
Example:
```javascript
array.sort(mongo.sortAscId());
```
### sortDescId `function`
accepting array of objects and return it sorted in descending order by _id
Example:
```javascript
mongo.sortDescId();
```
### sortAscString `function`
accepting array of object and return it sorted in ascending order by alphabet
Example:
```javascript
mongo.sortAscString();
```
### sortDescString `function`
accepting array of object and return it sorted in descending order by alphabet
Example:
```javascript
mongo.sortDescString();
```
### sortAscDate `function`
accepting array of object and return it sorted in ascending order by date
Example:
```javascript
mongo.sortAscDate();
```
### sortDescDate `function`
accepting array of object and return it sorted in descending order by date
Example:
```javascript
mongo.sortDescDate();
```
### sortAscNumber `function`
accepting array of object and return it sorted in ascending order by number
Example:
```javascript
mongo.sortAscNumber();
```
### sortDescNumber `function`
accepting array of object and return it sorted in descending order by number
Example:
```javascript
mongo.sortDescNumber();
```
### sortAscBoolean `function`
accepting array of object and return it sorted: first - true, second - false
Example:
```javascript
mongo.sortAscBoolean();
```
### sortDescBoolean `function`
accepting array of object and return it sorted: first - false, second - true
Example:
```javascript
mongo.sortDescBoolean();
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
## Alert Service
Alert Service is an suportive service for alerts manamanagement. Example of importing alert service:
```javascript
import { AlertService } from 'wacom';
constructor(private alert: AlertService){};
```
### show `function`
Opens the alert and return htmlElement of this alert.
Example 1:
```javascript
let my_alert = alert.show({
	text: 'Are you sure?',
	type: 'question',
	timeout: 5000,
	class: 'myClass',
	position: 'bottomRight',
	buttons: [{
		text: 'YES',
		callback: ()=>{
			console.log("YES!");
		}
	},{
		text: 'NO',
		callback: ()=>{
			console.log("NO!");
		}
	}]
});
```
Example 2:
```javascript
let my_alert = alert.show({
	component: MyCustomComponent,
	timeout: 5000,
	class: 'myClass',
	position: 'center',
	closable: true
});
```
### options
|  Name            | Type     | Description     |
| ---------------  |--------- | --------------- |
| `text`           | string   | Text of alert. |
| `type`           | string   | Type of alert(etc `info`, `success`, `warning`, `error`, `question`). |
| `class`          | string   | Custom class for your alert. |
| `unique`         | string   | Identificator for your alerts. |
| `progress`       | boolean  | Enable timeout progress bar. |
| `position`       | string   | Position of the alert(`topLeft`, `topCenter`, `topRight`, `right`, `bottomRight`, `bottomCenter`, `bottomLeft`, `left`, `center`). |
| `timeout`        | number   | Amount in milliseconds to close the alert, 0 to disable. |
| `closable`       | boolean  | Show "x" close button. |
| `buttons`        | number   | Array of buttons for your alerts. |
| `component`      | string or @Component | Component which will be appended into the alert. |
| `close`            | function | custom function for close alert. |
| `onClose`          | function | Capture when the alert is closing. |
### destroy `function`
Close all alerts. Example:
```javascript
alert.destroy();
```
## Modal Service
Modal Service is an suportive service for modals manamanagement. Example of importing modal service:
```javascript
import { ModalService } from 'wacom';
constructor(private modal: ModalService){};
```
### show `function`
Opens the modal and return htmlElement of this modal. Example:
```javascript
let my_modal = modal.show({
	component: MyCustomComponent,
	size: 'mid',
	timeout: 5000,
	class: 'myClass',
	position: 'center',
	closable: true
});
```
### options
|  Name              | Type     | Description     |
| ---------------    |--------- | --------------- |
| `id`               | string   |  |
| `component`        | string or @Component   | Component which will be appended into the modal. |
| `size`             | string   | Size of the modal. |
| `timeout`          | number  | Amount in milliseconds to close the modal, 0 to disable. |
| `class`            | string   | Custom class for your modal. |
| `closable`         | boolean  | Show "x" close button. |
| `unique`           | string | Identificator for your modals. |
| `close`            | function | custom function for close modal. |
| `onOpen`           | function | Capture when the modal is opening. |
| `onClose`          | function | Capture when the modal is closing. |
### destroy `function`
Close all modals. Example:
```javascript
modal.destroy();
```
## Loader Service
Loader Service is an suportive service for loaders manamanagement.Example of importing loader service:
```javascript
import { LoaderService } from 'wacom';
constructor(private load: LoaderService){};
```
### show `function`
Opens the loader and return htmlElement of this loader. Example:
```javascript
let my_loader = load.show({
	timeout: 5000,
	class: 'myClass',
	closable: true
});
```
### options
|  Name              | Type     | Description     |
| ---------------    |--------- | --------------- |
| `append`           | @Component   | Component where the loader will be appended. |
| `component`        | string or @Component   | Component which will be appended into the loader. |
| `timeout`          | number  | Amount in milliseconds to close the loader, 0 to disable. |
| `progress`         | boolean  | Enable timeout progress bar. |
| `class`            | string   | Custom class for your loader. |
| `closable`         | boolean  | Show "x" close button. |
| `close`            | function | custom function for close loader. |
| `onClose`          | function | Capture when the loader is closing. |
### destroy `function`
Close all loaders. Example:
```javascript
loader.destroy();
```
## UI/UX Service
UI/UX Service is supportive service for front-end features. This service provides saving css varibles and containes helpful tools for the front developer.
### var
Object which can be used to contain all needed fields for front-end.
### get `function`
Returns Object with all saved css viriables.
Example:
```javascript
ui.get();
```
Result example:
```javascript
{
  test: '15px solid'
}
```
### remove `function`
Removes css varible by the key.
Example:
```javascript
ui.remove('css');
```
### set `function`
Method interface sets a new value for a property on a CSS style declaration object and saves all css variables which you have passed.
Example:
```javascript
ui.set(variables, options);
```
```variables``` - All css varibles you want to pass. If you want to set array of variables you'll need to have specific structure of the array. Example: ```[{key: 'name', value: example}]```. Object will be saved with the same structure.

```options``` - If you want to save css variables to the localStorage you should pass ```local: true```. Also if you want to save variables only for specific host you should pass ```host: 'hostname'```
### arr `function`
Helps developer to generate array with custom length and with elements of specific type.
Example:
```html
<div *ngFor="let obj of ui.arr(length, type)"></div>
```
```length``` - Length of generated array.
```type``` - ```'number'||'text'||'date'``` Will set elements with random content at choosed type. 'number' is default type of elements.
### text `function`
Helps developer to generate random string with specific length.
Example:
```html
<span>{{ui.text(length)}}</span>
```
