# Angular (ngx) common
Module which has common services and components which can be used on all projects.

## License
[MIT](LICENSE)

## Instalation
```bash
$ npm i --save wacom
```

## Services
| Name | Description |
| ------- |:-----:|
| [**`Core`**](https://www.npmjs.com/package/wacom#core-service) | Common supportive function which can be used in any service |
| [**`Http`**](https://www.npmjs.com/package/wacom#http-service) | Http layer for HttpClient |
| [**`Store`**](https://www.npmjs.com/package/wacom#store-service) | Service will is responsible for keeping information on the device |
| [**`Hash`**](https://www.npmjs.com/package/wacom#hash-service) | Hash management for easily use, storage which stay in url |
| [**`Meta`**](https://www.npmjs.com/package/wacom#meta-service) | Website meta tags management within router |
| [**`UI`**](https://www.npmjs.com/package/wacom#ui-service) | Supportive UI/UX service |
| [**`Crud`**](https://www.npmjs.com/package/wacom#crud-service) | Modals management |

## [Core Service](#core-service)

### SSR and Platform Services Initialization
The `CoreService` manages the initialization of various platform-specific services depending on whether the application is running on the server or the client.
#### Properties
- `ssr` (boolean): Indicates whether the application is running on the server side.
- `localStorage` (any): Local storage object. Uses a mock object on the server side.
- `navigator` (any): Navigator object. Uses a mock object on the server side.
- `document` (any): Document object. Uses a mock object on the server side.
- `window` (any): Window object. Uses a mock object on the server side.

### String Prototype Extension
The `CoreService` extends the `String` prototype with a `capitalize` method, allowing you to capitalize the first letter of any string instance.
#### `capitalize(): string`
Capitalizes the first letter of the string and makes the rest of the string lowercase.
- **Example**:
  const exampleString = "hellO";
  console.log(exampleString.capitalize()); // Output: "Hello"

### Object to Array Function
The `CoreService` provides an `ota` method to convert an object to an array. Optionally, it can hold keys instead of values.
#### `ota(obj: any, holder?: boolean): any[]`
Converts an object to an array. Optionally holds keys instead of values.
- **Parameters**:
  - `obj` (any): The object to be converted.
  - `holder` (boolean): If true, the keys will be held in the array; otherwise, the values will be held. Default is `false`.

- **Returns**:
  - `any[]`: The resulting array.

- **Example**:
```Typescript
const exampleObj = { a: 1, b: 2, c: 3 };
const resultValues = coreService.ota(exampleObj);
console.log(resultValues); // Output: [1, 2, 3]
const resultKeys = coreService.ota(exampleObj, true);
console.log(resultKeys); // Output: ['a', 'b', 'c']
```

### Array Splice Function
The `CoreService` provides a `splice` method to remove elements from one array that are present in another array based on a comparison field.
#### `splice(removeArray: any[], fromArray: any[], compareField: string = '_id'): any[]`
Removes elements from `fromArray` that are present in `removeArray` based on a comparison field.
- **Parameters**:
  - `removeArray` (any[]): The array of elements to remove.
  - `fromArray` (any[]): The array from which to remove elements.
  - `compareField` (string): The field to use for comparison. Default is `_id`.

- **Returns**:
  - `any[]`: The modified `fromArray` with elements removed.

- **Example**:
```
const removeArray = [{ _id: '1' }, { _id: '3' }];
const fromArray = [{ _id: '1' }, { _id: '2' }, { _id: '3' }, { _id: '4' }];

const result = coreService.splice(removeArray, fromArray);
console.log(result); // Output: [{ _id: '2' }, { _id: '4' }]
```

### ID Unification Function
The `CoreService` provides an `ids2id` method to unite multiple _id values into a single unique _id. The resulting _id is unique regardless of the order of the input _id values.
#### `ids2id(...args: string[]): string`
Unites multiple _id values into a single unique _id. The resulting _id is unique regardless of the order of the input _id values.

- **Parameters**:
  - `...args` (string[]): The _id values to be united.

- **Returns**:
  - `string`: The unique combined _id.

- **Example**:
```Typescript
const id1 = "20230101abc";
const id2 = "20230102xyz";
const id3 = "20230101def";

const result = coreService.ids2id(id1, id2, id3);
console.log(result); // Output will be the ids sorted by the first 8 characters and joined
```

### Delayed Execution Function
The `CoreService` provides an `afterWhile` method to delay the execution of a callback function for a specified amount of time. If called again within that time, the timer resets.

#### `afterWhile(doc: string | object | (() => void), cb?: () => void, time: number = 1000): void`
Delays the execution of a callback function for a specified amount of time. If called again within that time, the timer resets.
- **Parameters**:
  - `doc` (string | object | (() => void)): A unique identifier for the timer, an object to host the timer, or the callback function.
  - `cb` (() => void): The callback function to execute after the delay.
  - `time` (number): The delay time in milliseconds. Default is 1000.

- **Example**:
```Typescript
coreService.afterWhile('example', () => {
	console.log('This message is delayed by 1 second');
}, 1000);

const obj = {};
coreService.afterWhile(obj, () => {
	console.log('This message is delayed by 1 second and stored in obj.__afterWhile');
}, 1000);

coreService.afterWhile(() => {
	console.log('This message is delayed by 1 second using the default doc "common"');
}, 1000);
```

### Copy Function
The `CoreService` provides a `copy` method to recursively copy properties from one object to another.
#### `copy<T>(from: T, to: T): void`
Recursively copies properties from one object to another.

- **Parameters**:
  - `from`: The source object from which properties are copied.
  - `to`: The target object to which properties are copied.

- **Example**:
```Typescript
const source = { a: 1, b: { c: 2 } };
const target = {};
coreService.copy(source, target);
console.log(target); // Output: { a: 1, b: { c: 2 } }
```

### Device Detection
The `CoreService` provides methods to detect the client's device type (mobile, tablet, or web).
#### Properties
- `device` (string): The detected device type.
#### Methods
##### `detectDevice(): void`
Detects the device type based on the user agent.
- **Example**:
```Typescript
coreService.detectDevice();
```

##### `isMobile(): boolean`
Checks if the device is a mobile device.
- **Returns**:
  - `boolean`: Returns true if the device is a mobile device.

- **Example**:
```Typescript
console.log(coreService.isMobile()); // Output: true or false
```

##### `isTablet(): boolean`
Checks if the device is a tablet.
- **Returns**:
  - `boolean`: Returns true if the device is a tablet.

- **Example**:
```Typescript
console.log(coreService.isTablet()); // Output: true or false
```

##### `isWeb(): boolean`
Checks if the device is a web browser.
- **Returns**:
  - `boolean`: Returns true if the device is a web browser.

- **Example**:
```Typescript
console.log(coreService.isWeb()); // Output: true or false
```

##### `isAndroid(): boolean`
Checks if the device is an Android device.
- **Returns**:
  - `boolean`: Returns true if the device is an Android device.

- **Example**:
```Typescript
console.log(coreService.isAndroid()); // Output: true or false
```

##### `isIos(): boolean`
Checks if the device is an iOS device.
- **Returns**:
  - `boolean`: Returns true if the device is an iOS device.

- **Example**:
```Typescript
console.log(coreService.isIos()); // Output: true or false
```

### Version Management
The `CoreService` provides methods for managing the application's version. The version is dynamically constructed from the app version and the date version.
#### Properties
- `version` (string): The combined version string of the application.
- `appVersion` (string): The application version.
- `dateVersion` (string): The date version.
#### Methods
##### `setVersion(): void`
Sets the combined version string based on `appVersion` and `dateVersion`.
- **Example**:
```Typescript
coreService.setVersion();
```
##### `setAppVersion(appVersion: string): void`
Sets the app version and updates the combined version string.
- **Parameters**:
  - `appVersion` (string): The application version to set.

- **Example**:
```Typescript
coreService.setAppVersion('1.2.3');
```
##### `setDateVersion(dateVersion: string): void`
Sets the date version and updates the combined version string.
- **Parameters**:
  - `dateVersion` (string): The date version to set.

- **Example**:
```Typescript
coreService.setDateVersion('2023-01-01');
```


### Signal Management
The `CoreService` provides methods for managing signals (events) to facilitate communication between different parts of the application. This allows multiple components or services to subscribe to signals and be notified when those signals are emitted.
#### Methods
##### `emit(signal: string, data?: any): void`
Emits a signal, optionally passing data to the listeners.
- **Parameters**:
  - `signal` (string): The name of the signal to emit.
  - `data` (any): Optional data to pass to the listeners.

- **Example**:
  coreService.emit('mySignal', { key: 'value' });

##### `on(signal: string): Observable<any>`
Returns an Observable that emits values when the specified signal is emitted. Multiple components or services can subscribe to this Observable to be notified of the signal.
- **Parameters**:
  - `signal` (string): The name of the signal to listen for.

- **Returns**:
  - `Observable<any>`: An Observable that emits when the signal is emitted.

- **Example**:
```Typescript
const subscription = coreService.on('mySignal').subscribe(data => {
	console.log('Signal received:', data);
});
// To unsubscribe from the signal
subscription.unsubscribe();
```
##### `off(signal: string): void`
Completes the Subject for a specific signal, effectively stopping any future emissions. This also unsubscribes all listeners for the signal.
- **Parameters**:
  - `signal` (string): The name of the signal to stop.

- **Example**:
```Typescript
coreService.off('mySignal');
```
#### Example Usage
Here's an example demonstrating how to use the signal management methods in `CoreService`:
```Typescript
import { CoreService } from 'wacom';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
export class AppComponent implements OnInit, OnDestroy {
  private signalSubscription: Subscription;

  constructor(private coreService: CoreService) {}

  ngOnInit() {
    this.setupSignalListeners();
    this.coreService.emit('update', { message: 'Data updated' });
  }

  setupSignalListeners() {
    this.signalSubscription = this.coreService.on('update').subscribe(data => {
      this.handleUpdate(data);
    });
  }

  handleUpdate(data: any) {
    console.log('Update signal received:', data);
  }

  ngOnDestroy() {
    if (this.signalSubscription) {
      this.signalSubscription.unsubscribe();
    }
    this.coreService.off('update');
  }
}
```
In this example:
1. The `on` method returns an `Observable` that emits when the `update` signal is emitted.
2. The component subscribes to the `Observable` to handle the emitted data.
3. The `emit` method is used to emit the `update` signal with some data.
4. The `off` method completes the `Subject` for the `update` signal, stopping any future emissions and cleaning up the signal.


### Await Management
The `CoreService` provides methods for managing the completion of tasks. This is useful in scenarios where you need to wait for certain tasks to be completed before proceeding.
#### Methods
##### `complete(task: string): void`
Marks a task as complete.
- **Parameters**:
  - `task` (string): The task to mark as complete, identified by a string.

- **Example**:
  coreService.complete('myTask');
##### `onComplete(task: string): Promise<void>`
Returns a Promise that resolves when the specified task is complete. This is useful for waiting until a task is completed.
- **Parameters**:
  - `task` (string): The task to watch for completion, identified by a string.

- **Returns**:
  - `Promise<void>`: A Promise that resolves when the task is complete.

- **Example**:
  coreService.onComplete('myTask').then(() => {
    console.log('Task is now complete');
  });
##### `completed(task: string): boolean`
Checks if a task is completed.
- **Parameters**:
  - `task` (string): The task to check, identified by a string.

- **Returns**:
  - `boolean`: True if the task is completed, false otherwise.

- **Example**:
  if (coreService.completed('myTask')) {
    console.log('Task is completed');
  } else {
    console.log('Task is not yet completed');
  }
#### Example Usage
Here's an example demonstrating how to use the await management methods in `CoreService`:
```Typescript
import { CoreService } from 'wacom';
export class AppComponent {
  constructor(private coreService: CoreService) {
    this.checkTaskCompletion();
  }

  async checkTaskCompletion() {
    console.log('Starting task...');

    setTimeout(() => {
      this.coreService.complete('task1');
      console.log('Task completed');
    }, 2000);

    await this.coreService.onComplete('task1');
    console.log('Task is now acknowledged as complete');
  }
}
```
In this example:
1. The `complete` method is used to mark a task identified by `'task1'` as complete.
2. The `onComplete` method returns a Promise that resolves when the task is marked as complete, allowing the code to wait until the task is acknowledged as complete.
3. The `completed` method checks if a task is completed, returning a boolean value.

### Locking Management

The `CoreService` provides methods for managing locks on resources to prevent concurrent access. This is useful in scenarios where you need to ensure that only one part of your application is accessing or modifying a resource at any given time.

### Methods

#### `lock(which: string): void`

Locks a resource to prevent concurrent access.

- **Parameters**:
  - `which` (string): The resource to lock, identified by a string.

- **Example**:
  coreService.lock('myResource');

#### `unlock(which: string): void`

Unlocks a resource, allowing other processes or threads to access it.

- **Parameters**:
  - `which` (string): The resource to unlock, identified by a string.

- **Example**:
  coreService.unlock('myResource');

#### `onUnlock(which: string): Promise<void>`

Returns a Promise that resolves when the specified resource is unlocked. This is useful for waiting until a resource becomes available.

- **Parameters**:
  - `which` (string): The resource to watch for unlocking, identified by a string.

- **Returns**:
  - `Promise<void>`: A Promise that resolves when the resource is unlocked.

- **Example**:
  coreService.onUnlock('myResource').then(() => {
    console.log('Resource is now unlocked');
  });

#### `locked(which: string): boolean`

Checks if a resource is currently locked.

- **Parameters**:
  - `which` (string): The resource to check, identified by a string.

- **Returns**:
  - `boolean`: True if the resource is locked, false otherwise.

- **Example**:
  if (coreService.locked('myResource')) {
    console.log('Resource is currently locked');
  } else {
    console.log('Resource is available');
  }

### Example Usage

Here's an example demonstrating how to use the locking management methods in `CoreService`:
```Typescript
import { CoreService } from 'wacom';
export class AppComponent {
  constructor(private coreService: CoreService) {
    this.manageResource();
  }

  async manageResource() {
    this.coreService.lock('resource1');
    console.log('Resource locked');

    setTimeout(() => {
      this.coreService.unlock('resource1');
      console.log('Resource unlocked');
    }, 2000);

    await this.coreService.onUnlock('resource1');
    console.log('Resource is now available for use');
  }
}
```
In this example:
1. The `lock` method is used to lock a resource identified by `'resource1'`.
2. The `unlock` method is called after a timeout to unlock the resource.
3. The `onUnlock` method returns a Promise that resolves when the resource is unlocked, allowing the code to wait until the resource is available again.

This ensures controlled access to the resource, preventing race conditions and ensuring data integrity.


## [Http Service](#http-service)
The `HttpService` provides a centralized and configurable way to handle HTTP requests within an Angular application. It simplifies various aspects of making HTTP requests, including error handling, headers management, and request locking.
## Properties
### `url: string`
The base URL for HTTP requests.
### `errors: Array<(err: HttpErrorResponse, retry?: () => void) => void>`
Array of error handling callbacks.
### `locked: boolean`
Indicates whether the HTTP service is locked to prevent concurrent requests.
### `awaitLocked: any[]`
Array of timeouts for locked requests.
## Methods
### `setUrl(url: string): void`
Sets the base URL for HTTP requests.
**Parameters**:
- `url` (string): The base URL to set.

**Example**:
```Typescript
coreService.setUrl('https://api.example.com');
```
### `removeUrl(): void`
Removes the base URL for HTTP requests.

**Example**:
```Typescript
coreService.removeUrl();
```
### `setHeader(key: string, value: string): void`
Sets an HTTP header.

**Parameters**:
- `key` (string): The header key.
- `value` (string): The header value.

**Example**:
```Typescript
coreService.setHeader('Authorization', 'Bearer token');
```
### `getHeader(key: string): string | undefined`
Gets the value of an HTTP header.

**Parameters**:
- `key` (string): The header key.

**Returns**:
- `string | undefined`: The value of the header.

**Example**:
```Typescript
const authHeader = coreService.getHeader('Authorization');
```
### `removeHeader(key: string): void`
Removes an HTTP header.

**Parameters**:
- `key` (string): The header key to remove.

**Example**:
```Typescript
coreService.removeHeader('Authorization');
```
### `post<T>(url: string, body: any, options: any = {}): Observable<T>`
Makes an HTTP POST request.

**Parameters**:
- `url` (string): The URL to send the request to.
- `body` (any): The body of the request.
- `options` (any): Optional parameters.

**Returns**:
- `Observable<T>`: An Observable of the HTTP response.

**Example**:
```Typescript
coreService.post('endpoint', { data: 'value' }).subscribe(response => console.log(response));
```
### `put<T>(url: string, body: any, options: any = {}): Observable<T>`
Makes an HTTP PUT request.

**Parameters**:
- `url` (string): The URL to send the request to.
- `body` (any): The body of the request.
- `options` (any): Optional parameters.

**Returns**:
- `Observable<T>`: An Observable of the HTTP response.

**Example**:
```Typescript
coreService.put('endpoint', { data: 'value' }).subscribe(response => console.log(response));
```
### `patch<T>(url: string, body: any, options: any = {}): Observable<T>`
Makes an HTTP PATCH request.

**Parameters**:
- `url` (string): The URL to send the request to.
- `body` (any): The body of the request.
- `options` (any): Optional parameters.

**Returns**:
- `Observable<T>`: An Observable of the HTTP response.

**Example**:
```Typescript
coreService.patch('endpoint', { data: 'value' }).subscribe(response => console.log(response));
```
### `delete<T>(url: string, options: any = {}): Observable<T>`
Makes an HTTP DELETE request.

**Parameters**:
- `url` (string): The URL to send the request to.
- `options` (any): Optional parameters.

**Returns**:
- `Observable<T>`: An Observable of the HTTP response.

**Example**:
```Typescript
coreService.delete('endpoint').subscribe(response => console.log(response));
```
### `get<T>(url: string, options: any = {}): Observable<T>`
Makes an HTTP GET request.

**Parameters**:
- `url` (string): The URL to send the request to.
- `options` (any): Optional parameters.

**Returns**:
- `Observable<T>`: An Observable of the HTTP response.

**Example**:
```Typescript
coreService.get('endpoint').subscribe(response => console.log(response));
```
### `lock(): void`
Locks the HTTP service to prevent concurrent requests.

**Example**:
```Typescript
coreService.lock();
```
### `unlock(): void`
Unlocks the HTTP service to allow requests.

**Example**:
```Typescript
coreService.unlock();
```


## [Store Service](#store-service)
The `StoreService` manages local storage in a configurable manner. It can set, get, and remove items from storage, with support for asynchronous operations and JSON serialization.
### Properties
#### `_prefix: string`
The prefix for storage keys.
### Methods
#### `setPrefix(prefix: string): void`
Sets the prefix for storage keys.
**Parameters**:
- `prefix` (string): The prefix to set.

**Example**:
```Typescript
storeService.setPrefix('app_');
```
#### `set(key: string, value: string, callback: () => void = () => {}, errCallback: () => void = () => {}): void`
Sets a value in storage.

**Parameters**:
- `key` (string): The storage key.
- `value` (string): The value to store.
- `callback` (function): The callback to execute on success.
- `errCallback` (function): The callback to execute on error.

**Example**:
```Typescript
storeService.set('key', 'value', () => console.log('Success'), () => console.log('Error'));
```

#### `setAsync(key: string, value: string): Promise<boolean>`
Sets a value in storage asynchronously.

**Parameters**:
- `key` (string): The storage key.
- `value` (string): The value to store.

**Returns**:
- `Promise<boolean>`: A promise that resolves to a boolean indicating success.

**Example**:
```Typescript
await storeService.setAsync('key', 'value');
```

#### `get(key: string, callback: (value: string) => void = () => {}, errCallback: () => void = () => {}): void`
Gets a value from storage.

**Parameters**:
- `key` (string): The storage key.
- `callback` (function): The callback to execute with the retrieved value.
- `errCallback` (function): The callback to execute on error.

**Example**:
```Typescript
storeService.get('key', value => console.log(value), () => console.log('Error'));
```

#### `getAsync(key: string): Promise<string>`
Gets a value from storage asynchronously.

**Parameters**:
- `key` (string): The storage key.

**Returns**:
- `Promise<string>`: A promise that resolves to the retrieved value.

**Example**:
```Typescript
const value = await storeService.getAsync('key');
```

#### `setJson(key: string, value: any, callback: () => void = () => {}, errCallback: () => void = () => {}): void`
Sets a JSON value in storage.

**Parameters**:
- `key` (string): The storage key.
- `value` (any): The value to store.
- `callback` (function): The callback to execute on success.
- `errCallback` (function): The callback to execute on error.

**Example**:
```Typescript
storeService.setJson('key', { data: 'value' }, () => console.log('Success'), () => console.log('Error'));
```

#### `setJsonAsync(key: string, value: any): Promise<boolean>`
Sets a JSON value in storage asynchronously.

**Parameters**:
- `key` (string): The storage key.
- `value` (any): The value to store.

**Returns**:
- `Promise<boolean>`: A promise that resolves to a boolean indicating success.

**Example**:
```Typescript
await storeService.setJsonAsync('key', { data: 'value' });
```

#### `getJson(key: string, callback: (value: any) => void = () => {}, errCallback: () => void = () => {}): void`
Gets a JSON value from storage.

**Parameters**:
- `key` (string): The storage key.
- `callback` (function): The callback to execute with the retrieved value.
- `errCallback` (function): The callback to execute on error.

**Example**:
```Typescript
storeService.getJson('key', value => console.log(value), () => console.log('Error'));
```

#### `getJsonAsync<T = any>(key: string): Promise<T | null>`
Gets a JSON value from storage asynchronously.

**Parameters**:
- `key` (string): The storage key.

**Returns**:
- `Promise<T | null>`: A promise that resolves to the retrieved value.

**Example**:
```Typescript
const value = await storeService.getJsonAsync('key');
```

#### `remove(key: string, callback?: () => void, errCallback?: () => void): Promise<boolean>`
Removes a value from storage.

**Parameters**:
- `key` (string): The storage key.
- `callback` (function): The callback to execute on success.
- `errCallback` (function): The callback to execute on error.

**Returns**:
- `Promise<boolean>`: A promise that resolves to a boolean indicating success.

**Example**:
```Typescript
await storeService.remove('key', () => console.log('Success'), () => console.log('Error'));
```

#### `clear(callback?: () => void, errCallback?: () => void): Promise<boolean>`
Clears all values from storage.

**Parameters**:
- `callback` (function): The callback to execute on success.
- `errCallback` (function): The callback to execute on error.

**Returns**:
- `Promise<boolean>`: A promise that resolves to a boolean indicating success.

**Example**:
```Typescript
await storeService.clear(() => console.log('Success'), () => console.log('Error'));
```

#### `applyPrefix(key: string): string`
Applies the configured prefix to a storage key.

**Parameters**:
- `key` (string): The storage key.

**Returns**:
- `string`: The prefixed storage key.

**Example**:
```Typescript
const prefixedKey = storeService.applyPrefix('key');
```



## [Hash Service](#hash-service)
The `HashService` manages the URL hash in an Angular application. It can parse, set, get, and clear hash values, providing a simple API for manipulating the URL hash.
### Properties
#### `hash: { [key: string]: string }`
The object containing the parsed hash values.
### Methods
#### `initialize(): void`
Initializes the hash service by loading the current hash from the URL.
**Example**:
```Typescript
hashService.initialize();
```
#### `load(): void`
Loads the current hash from the URL into the hash object.

**Example**:
```Typescript
hashService.load();
```

#### `applyReplacements(str: string | undefined): string`
Applies replacements to a given string based on the replacements array.

**Parameters**:
- `str` (string | undefined): The string to apply replacements to.

**Returns**:
- `string`: The string with replacements applied.

**Example**:
```Typescript
const result = hashService.applyReplacements('hello%20world');
```

#### `on(field: string, cb: (value: string) => void): void`
Executes a callback with the value of a specific hash field once the hash is loaded.

**Parameters**:
- `field` (string): The hash field to get the value for.
- `cb` (function): The callback to execute with the value.

**Example**:
```Typescript
hashService.on('key', value => console.log(value));
```

#### `save(): void`
Saves the current hash object to the URL.

**Example**:
```Typescript
hashService.save();
```

#### `set(field: string, value: string): void`
Sets a value for a specific hash field and updates the URL.

**Parameters**:
- `field` (string): The hash field to set the value for.
- `value` (string): The value to set.

**Example**:
```Typescript
hashService.set('key', 'value');
```

#### `get(field: string): string | undefined`
Gets the value of a specific hash field.

**Parameters**:
- `field` (string): The hash field to get the value for.

**Returns**:
- `string | undefined`: The value of the hash field.

**Example**:
```Typescript
const value = hashService.get('key');
```

#### `clear(field?: string): void`
Clears a specific hash field or all hash fields and updates the URL.

**Parameters**:
- `field` (string | undefined): The hash field to clear. If not provided, clears all hash fields.

**Example**:
```Typescript
hashService.clear('key');
hashService.clear();
```


## [Meta Service](#meta-service)
The `MetaService` manages meta tags and titles in an Angular application. It allows setting defaults, updating meta tags, and configuring titles dynamically.
### Methods
#### `setDefaults(defaults: { [key: string]: string }): void`
Sets the default meta tags.

**Parameters**:
- `defaults` (object): The default meta tags.

**Example**:
```Typescript
metaService.setDefaults({ title: 'Default Title', description: 'Default Description' });
```
#### `setTitle(title?: string, titleSuffix?: string): MetaService`
Sets the title and optional title suffix.

**Parameters**:
- `title` (string): The title to set.
- `titleSuffix` (string): The title suffix to append.

**Returns**:
- `MetaService`: The MetaService instance.

**Example**:
```Typescript
metaService.setTitle('My Page Title', ' | My Website');
```

#### `setLink(links: { [key: string]: string }): MetaService`
Sets link tags.

**Parameters**:
- `links` (object): The links to set.

**Returns**:
- `MetaService`: The MetaService instance.

**Example**:
```Typescript
metaService.setLink({ canonical: 'https://example.com', stylesheet: 'https://example.com/style.css' });
```

#### `setTag(tag: string, value: string, prop?: string): MetaService`
Sets a meta tag.

**Parameters**:
- `tag` (string): The meta tag name.
- `value` (string): The meta tag value.
- `prop` (string): The meta tag property.

**Returns**:
- `MetaService`: The MetaService instance.

**Example**:
```Typescript
metaService.setTag('description', 'This is a description', 'name');
```

#### `removeTag(tag: string, prop?: string): void`
Removes a meta tag.

**Parameters**:
- `tag` (string): The meta tag name.
- `prop` (string): The meta tag property.

**Example**:
```Typescript
metaService.removeTag('description', 'name');
```

### Private Methods

#### `_updateMetaTag(tag: string, value: string, prop?: string): void`
Updates a meta tag.

**Parameters**:
- `tag` (string): The meta tag name.
- `value` (string): The meta tag value.
- `prop` (string): The meta tag property.

#### `_warnMissingGuard(): void`
Warns about missing meta guards in routes.

**Example**:
```Typescript
metaService._warnMissingGuard();
```


## [UI Service](#ui-service)
The `UiService` manages various UI-related tasks in an Angular application, including CSS management, form validation, and generating sample data for UI components.
### Methods
#### `form(id: string): any`
Manages form states.

**Parameters**:
- `id` (string): The form identifier.

**Returns**:
- `any`: The form state object.

**Example**:
```Typescript
const formState = uiService.form('contactForm');
```
#### `valid(value: any, kind = 'email', extra = 0): boolean`
Validates input values based on the specified type.

**Parameters**:
- `value` (any): The value to validate.
- `kind` (string): The type of validation.
- `extra` (number): Additional validation criteria.

**Returns**:
- `boolean`: True if the value is valid, false otherwise.

**Example**:
```Typescript
const isValidEmail = uiService.valid('test@example.com', 'email');
```
#### `level(value = ''): number`
Determines the strength of a password.

**Parameters**:
- `value` (string): The password to evaluate.

**Returns**:
- `number`: The strength level of the password.

**Example**:
```Typescript
const passwordLevel = uiService.level('Password123!');
```
#### `set(variables: { [key: string]: string }, opts: any = {}): void`
Sets multiple CSS variables.

**Parameters**:
- `variables` (object): The CSS variables to set.
- `opts` (any): Options for setting the variables.

**Example**:
```Typescript
uiService.set({ '--primary-color': '#ff0000' }, 'local');
```
#### `get(): { [key: string]: string }`
Retrieves the stored CSS variables.

**Returns**:
- `object`: The stored CSS variables.

**Example**:
```Typescript
const cssVariables = uiService.get();
```
#### `remove(keys: string | string[]): void`
Removes specified CSS variables.

**Parameters**:
- `keys` (string | array): The keys of the CSS variables to remove.

**Example**:
```Typescript
uiService.remove('primary-color secondary-color');
```
#### `arr(arrLen = 10, type: string = 'number'): any[]`
Generates an array of sample data.

**Parameters**:
- `arrLen` (number): The length of the array.
- `type` (string): The type of data to generate.

**Returns**:
- `array`: An array of sample data.

**Example**:
```Typescript
const sampleArray = uiService.arr(5, 'text');
```
#### `text(length = 10): string`
Generates a random text string.

**Parameters**:
- `length` (number): The length of the text string.

**Returns**:
- `string`: A random text string.

**Example**:
```Typescript
const randomText = uiService.text(15);
```


## [Crud Service](#crud-service)
The `CrudService` is designed to manage CRUD (Create, Read, Update, Delete) operations in an Angular application. It interacts with an API, stores documents locally, and provides methods for handling various CRUD operations.
### Methods
#### `new(): Document`
Creates a new document with a temporary ID.
**Returns**:
- `Document`: A new document instance.

**Example**:
```Typescript
const newDoc = crudService.new();
```

#### `doc(_id: string): Document`
Retrieves a document by its ID.

**Parameters**:
- `_id` (string): The document ID.

**Returns**:
- `Document`: The document instance.

**Example**:
```Typescript
const doc = crudService.doc('12345');
```

#### `configDocs(name: string, config: (doc: Document, container: unknown) => void, reset: () => unknown): unknown`
Configures documents for a specific name.

**Parameters**:
- `name` (string): The configuration name.
- `config` (function): The configuration function.
- `reset` (function): The reset function.

**Returns**:
- `unknown`: The configured documents.

**Example**:
```Typescript
crudService.configDocs('myConfig', (doc, container) => { /* config logic */ }, () => { /* reset logic */ });
```

#### `getConfigedDocs(name: string): unknown`
Retrieves the configured documents for a specific name.

**Parameters**:
- `name` (string): The configuration name.

**Returns**:
- `unknown`: The configured documents.

**Example**:
```Typescript
const configedDocs = crudService.getConfigedDocs('myConfig');
```

#### `reconfigureDocs(name: string = ''): void`
Reconfigures documents for a specific name or all names.

**Parameters**:
- `name` (string): The configuration name (optional).

**Example**:
```Typescript
crudService.reconfigureDocs('myConfig');
```

#### `setPerPage(_perPage: number): void`
Sets the number of documents per page.

**Parameters**:
- `_perPage` (number): The number of documents per page.

**Example**:
```Typescript
crudService.setPerPage(10);
```

#### `get(config: GetConfig = {}, options: CrudOptions<Document> = {}): Observable<Document[]>`
Retrieves documents from the API.

**Parameters**:
- `config` (object): The get configuration.
- `options` (object): The CRUD options.

**Returns**:
- `Observable<Document[]>`: An observable of the retrieved documents.

**Example**:
```Typescript
crudService.get({ page: 1 }, { callback: (docs) => console.log(docs) });
```

#### `create(doc: Document, options: CrudOptions<Document> = {}): Observable<Document> | void`
Creates a new document in the API.

**Parameters**:
- `doc` (Document): The document to create.
- `options` (object): The CRUD options.

**Returns**:
- `Observable<Document> | void`: An observable of the created document or void if the document was already created.

**Example**:
```Typescript
crudService.create(newDoc, { callback: (doc) => console.log(doc) });
```

#### `fetch(query: object = {}, options: CrudOptions<Document> = {}): Observable<Document>`
Fetches a document from the API based on a query.

**Parameters**:
- `query` (object): The query object.
- `options` (object): The CRUD options.

**Returns**:
- `Observable<Document>`: An observable of the fetched document.

**Example**:
```Typescript
crudService.fetch({ name: 'example' }, { callback: (doc) => console.log(doc) });
```

#### `updateAfterWhile(doc: Document, options: CrudOptions<Document> = {}): void`
Updates a document after a specified delay.

**Parameters**:
- `doc` (Document): The document to update.
- `options` (object): The CRUD options.

**Example**:
```Typescript
crudService.updateAfterWhile(doc, { callback: (doc) => console.log(doc) });
```

#### `update(doc: Document, options: CrudOptions<Document> = {}): Observable<Document>`
Updates a document in the API.

**Parameters**:
- `doc` (Document): The document to update.
- `options` (object): The CRUD options.

**Returns**:
- `Observable<Document>`: An observable of the updated document.

**Example**:
```Typescript
crudService.update(doc, { callback: (doc) => console.log(doc) });
```

#### `delete(doc: Document, options: CrudOptions<Document> = {}): Observable<Document>`
Deletes a document from the API.

**Parameters**:
- `doc` (Document): The document to delete.
- `options` (object): The CRUD options.

**Returns**:
- `Observable<Document>`: An observable of the deleted document.

**Example**:
```Typescript
crudService.delete(doc, { callback: (doc) => console.log(doc) });
```

### Interfaces

#### `CrudDocument`
Represents a CRUD document.

**Properties**:
- `_id` (string): The document ID.
- `__created` (boolean): Indicates if the document is created.
- `__modified` (boolean): Indicates if the document is modified.

**Example**:
```Typescript
interface CrudDocument {
  _id: string;
  __created: boolean;
  __modified: boolean;
}
```


## [File Service](#file-service)








## [Socket Service](#socket-service)
## [Date Service](#date-service)
## [Dom Service](#dom-service)
