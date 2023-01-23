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
| [**`UI`**](https://www.npmjs.com/package/wacom#ui-service) | Supportive UI/UX service |

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
