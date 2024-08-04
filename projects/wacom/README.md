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
| [**`Crud`**](https://www.npmjs.com/package/wacom#crud-service) | Provides basic CRUD operations for managing data with HTTP services |
| [**`File`**](https://www.npmjs.com/package/wacom#file-service) | Handles file uploads, image processing, and file management tasks |
| [**`Socket`**](https://www.npmjs.com/package/wacom#socket-service) | Manages WebSocket connections and real-time data communication |
| [**`Time`**](https://www.npmjs.com/package/wacom#time-service) | Provides utilities for date and time manipulation and formatting |
| [**`Dom`**](https://www.npmjs.com/package/wacom#dom-service) | Facilitates DOM manipulation and dynamic component loading |


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
The `HttpService` provides an HTTP layer for `HttpClient` in Angular, supporting both callbacks and observables for various HTTP operations.
### Methods
#### `setUrl(url: string)`
Sets the base URL for HTTP requests.
**Parameters**:
- `url` (string): The base URL.

**Example**:
```Typescript
httpService.setUrl('https://api.example.com');
```
#### `removeUrl()`
Removes the base URL for HTTP requests.
**Example**:
```Typescript
httpService.removeUrl();
```
#### `set(key: string, value: string)`
Sets a header for HTTP requests.
**Parameters**:
- `key` (string): The header key.
- `value` (string): The header value.

**Example**:
```Typescript
httpService.set('Authorization', 'Bearer token');
```
#### `header(key: string): string`
Gets the value of a specified header.
**Parameters**:
- `key` (string): The header key.

**Returns**:
- The header value.

**Example**:
```Typescript
const authHeader = httpService.header('Authorization');
```
#### `remove(key: string)`
Removes a specified header.
**Parameters**:
- `key` (string): The header key.

**Example**:
```Typescript
httpService.remove('Authorization');
```
#### `post(url: string, doc: any, callback = (resp: any) => {}, opts: any = {}): Observable<any>`
Performs a POST request.
**Parameters**:
- `url` (string): The URL for the request.
- `doc` (any): The request body.
- `callback` (function): The callback function.
- `opts` (any): Additional options.

**Returns**:
- An observable for the request.

**Example**:
```Typescript
httpService.post('/endpoint', data, (resp) => {
  console.log(resp);
}).subscribe();
```
#### `put(url: string, doc: any, callback = (resp: any) => {}, opts: any = {}): Observable<any>`
Performs a PUT request.
**Parameters**:
- `url` (string): The URL for the request.
- `doc` (any): The request body.
- `callback` (function): The callback function.
- `opts` (any): Additional options.

**Returns**:
- An observable for the request.

**Example**:
```Typescript
httpService.put('/endpoint', data, (resp) => {
  console.log(resp);
}).subscribe();
```
#### `patch(url: string, doc: any, callback = (resp: any) => {}, opts: any = {}): Observable<any>`
Performs a PATCH request.
**Parameters**:
- `url` (string): The URL for the request.
- `doc` (any): The request body.
- `callback` (function): The callback function.
- `opts` (any): Additional options.

**Returns**:
- An observable for the request.

**Example**:
```Typescript
httpService.patch('/endpoint', data, (resp) => {
  console.log(resp);
}).subscribe();
```
#### `delete(url: string, callback = (resp: any) => {}, opts: any = {}): Observable<any>`
Performs a DELETE request.
**Parameters**:
- `url` (string): The URL for the request.
- `callback` (function): The callback function.
- `opts` (any): Additional options.

**Returns**:
- An observable for the request.

**Example**:
```Typescript
httpService.delete('/endpoint', (resp) => {
  console.log(resp);
}).subscribe();
```
#### `get(url: string, callback = (resp: any) => {}, opts: any = {}): Observable<any>`
Performs a GET request.
**Parameters**:
- `url` (string): The URL for the request.
- `callback` (function): The callback function.
- `opts` (any): Additional options.

**Returns**:
- An observable for the request.

**Example**:
```Typescript
httpService.get('/endpoint', (resp) => {
  console.log(resp);
}).subscribe();
```
#### `clearLocked()`
Clears all locked requests.
**Example**:
```Typescript
httpService.clearLocked();
```
#### `lock()`
Locks the service to prevent further requests.
**Example**:
```Typescript
httpService.lock();
```
#### `unlock()`
Unlocks the service to allow requests.
**Example**:
```Typescript
httpService.unlock();
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
The `FileService` is designed to handle file uploads, image processing, and file management tasks in an Angular application. It interacts with the `HttpService` to send files to the server and provides utilities for image resizing and validation.
### Methods
#### `add(opts: FileOptions | string): void | (() => void)`
Adds a file input configuration.
**Parameters**:
- `opts` (FileOptions | string): The file options or a string ID.

**Example**:
```Typescript
fs.add({
  id: 'fileInput',
  type: 'image',
  resize: 200,
  cb: (dataUrl, file) => {
    console.log('File processed:', dataUrl, file);
  },
  save: true,
});
```
#### `change(event: Event, info: FileOptions): void`
Handles file input change event.
**Parameters**:
- `event` (Event): The input change event.
- `info` (FileOptions): The file options.

**Example**:
```Typescript
<input type="file" (change)="fs.change($event, fileOptions)">
```
#### `remove(part: string, url: string, opts: any = {}, cb: (resp: any) => void = () => {}): void | (() => void)`
Removes a file.

**Parameters**:
- `part` (string): The part of the API.
- `url` (string): The URL of the file.
- `opts` (object): Additional options.
- `cb` (function): The callback function.

**Example**:
```Typescript
fs.remove('images', 'https://example.com/image.jpg', {}, (resp) => {
  console.log('File removed:', resp);
});
```
#### `uploadFiles(info: FileOptions, files: File[], cb: (resp: any) => void = () => {}): void`
Uploads files to the server.
**Parameters**:
- `info` (FileOptions): The file options.
- `files` (File[]): The files to upload.
- `cb` (function): The callback function.

**Example**:
```Typescript
const files = document.getElementById('fileInput').files;
fs.uploadFiles(fileOptions, files, (resp) => {
  console.log('Files uploaded:', resp);
});
```
#### `image(info: FileOptions, cb: (resp: any) => void = () => {}): void | (() => void)`
Uploads an image to the server.
**Parameters**:
- `info` (FileOptions): The file options.
- `cb` (function): The callback function.

**Example**:
```Typescript
fs.image({
  api: '/api/upload',
  part: 'images',
  name: 'profilePic',
}, (resp) => {
  console.log('Image uploaded:', resp);
});
```
### Interfaces
#### `FileOptions`
Represents the file options for uploading and processing files.
**Properties**:
- `id` (string): The unique ID for the file input.
- `type` (string): The type of file ('image' or 'file').
- `resize` (number | object): The dimensions for resizing the image.
- `multiple` (boolean): Indicates if multiple files can be uploaded.
- `multiple_cb` (function): Callback function for multiple files.
- `cb` (function): Callback function for file processing.
- `save` (boolean): Indicates if the file should be saved.
- `complete` (function): Function to call when the file is saved.
- `api` (string): The API endpoint for uploading the file.
- `part` (string): The part of the API.
- `name` (string): The name of the file.
- `body` (function | object): Function or object to generate the request body.
- `resp` (function): Function to handle the response.
- `append` (function): Function to append files to FormData.
- `multiple_files` (array): Array of multiple files.
- `multiple_counter` (number): Counter for multiple files.
- `url` (string): The URL for the file.

**Example**:
```Typescript
const fileOptions: FileOptions = {
  id: 'fileInput',
  type: 'image',
  resize: { width: 200, height: 200 },
  multiple: true,
  multiple_cb: (files) => {
    console.log('Multiple files processed:', files);
  },
  cb: (dataUrl, file) => {
    console.log('File processed:', dataUrl, file);
  },
  save: true,
  api: '/api/upload',
  part: 'images',
  name: 'profilePic',
  body: () => ({ userId: 123 }),
  resp: (response) => {
    console.log('Server response:', response);
  },
};
```


## [Socket Service](#socket-service)
The `SocketService` manages WebSocket connections using `socket.io`. It handles setting up the connection, listening for events, and emitting messages.
### Methods
#### `setUrl(url: string): void`
Sets the URL for the WebSocket connection and reloads the socket.
**Parameters**:
- `url` (string): The URL of the WebSocket server.

**Example**:
```Typescript
socketService.setUrl('https://example.com');
```
#### `on(to: string, cb: (message: any) => void = () => {}): void`

Subscribes to a WebSocket event.

**Parameters**:
- `to` (string): The event to subscribe to.
- `cb` (function): The callback function to execute when the event is received.

**Example**:
```Typescript
socketService.on('message', (msg) => {
  console.log('Received message:', msg);
});
```
#### `emit(to: string, message: any, room: any = false): void`

Emits a message to a WebSocket event.

**Parameters**:
- `to` (string): The event to emit the message to.
- `message` (any): The message to emit.
- `room` (any): Optional room to emit the message to.

**Example**:
```Typescript
socketService.emit('message', { text: 'Hello, World!' });
```
### Usage Example

```typescript
import { SocketService } from 'wacom';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  constructor(private socketService: SocketService) {
    this.socketService.setUrl('https://example.com');
    this.socketService.on('connect', () => {
      console.log('Connected to WebSocket');
    });
    this.socketService.on('message', (msg) => {
      console.log('Received message:', msg);
    });
  }

  sendMessage() {
    this.socketService.emit('message', { text: 'Hello, World!' });
  }
}
```


## [Time Service](#time-service)
The `TimeService` provides comprehensive date and time management, including timezone handling, formatting dates, and utility functions for calendar operations.
### Methods
#### `getDayName(date: Date, format: 'short' | 'long' = 'long'): string`
Returns the name of the day of the week for a given date.

**Parameters**:
- `date` (Date): The date for which to get the day of the week.
- `format` ('short' | 'long'): The format in which to return the day name. Default is 'long'.

**Returns**:
- The name of the day of the week.

**Example**:
```Typescript
const dayName = timeService.getDayName(new Date(), 'short');
console.log(dayName); // Output: 'Mon'
```
#### `formatDate(date: Date, format: string = 'mediumDate', timezone: string = 'UTC'): string`
Formats a date according to the specified format and timezone.

**Parameters**:
- `date` (Date): The date to format.
- `format` (string): The format string (see Angular DatePipe documentation for format options).
- `timezone` (string): The timezone to use for formatting.

**Returns**:
- The formatted date string.

**Example**:
```Typescript
const formattedDate = timeService.formatDate(new Date(), 'fullDate', 'America/New_York');
console.log(formattedDate); // Output: 'Monday, January 1, 2023'
```
#### `convertToTimezone(date: Date, timezone: string): Date`
Converts a date to a different timezone.
**Parameters**:
- `date` (Date): The date to convert.
- `timezone` (string): The timezone to convert to.

**Returns**:
- The date in the new timezone.

**Example**:
```Typescript
const dateInTimezone = timeService.convertToTimezone(new Date(), 'Asia/Tokyo');
console.log(dateInTimezone);
```
#### `startOfDay(date: Date): Date`
Returns the start of the day for a given date.
**Parameters**:
- `date` (Date): The date for which to get the start of the day.

**Returns**:
- The start of the day (midnight) for the given date.

**Example**:
```Typescript
const startOfDay = timeService.startOfDay(new Date());
console.log(startOfDay); // Output: '2023-01-01T00:00:00.000Z'
```
#### `endOfDay(date: Date): Date`
Returns the end of the day for a given date.
**Parameters**:
- `date` (Date): The date for which to get the end of the day.

**Returns**:
- The end of the day (one millisecond before midnight) for the given date.

**Example**:
```Typescript
const endOfDay = timeService.endOfDay(new Date());
console.log(endOfDay); // Output: '2023-01-01T23:59:59.999Z'
```
#### `getDaysInMonth(month: number, year: number): number`
Returns the number of days in a given month and year.
**Parameters**:
- `month` (number): The month (0-11).
- `year` (number): The year.

**Returns**:
- The number of days in the month.

**Example**:
```Typescript
const daysInMonth = timeService.getDaysInMonth(1, 2023);
console.log(daysInMonth); // Output: 28
```
#### `isLeapYear(year: number): boolean`
Checks if a given year is a leap year.
**Parameters**:
- `year` (number): The year to check.

**Returns**:
- True if the year is a leap year, false otherwise.

**Example**:
```Typescript
const isLeap = timeService.isLeapYear(2024);
console.log(isLeap); // Output: true
```
#### `addDays(date: Date, days: number): Date`
Adds a specified number of days to a date.
**Parameters**:
- `date` (Date): The date to which to add days.
- `days` (number): The number of days to add.

**Returns**:
- The new date with the added days.

**Example**:
```Typescript
const newDate = timeService.addDays(new Date(), 10);
console.log(newDate);
```
#### `addMonths(date: Date, months: number): Date`
Adds a specified number of months to a date.
**Parameters**:
- `date` (Date): The date to which to add months.
- `months` (number): The number of months to add.

**Returns**:
- The new date with the added months.

**Example**:
```Typescript
const newDate = timeService.addMonths(new Date(), 2);
console.log(newDate);
```
#### `addYears(date: Date, years: number): Date`
Adds a specified number of years to a date.
**Parameters**:
- `date` (Date): The date to which to add years.
- `years` (number): The number of years to add.

**Returns**:
- The new date with the added years.

**Example**:
```Typescript
const newDate = timeService.addYears(new Date(), 5);
console.log(newDate);
```
#### `subtractDays(date: Date, days: number): Date`
Subtracts a specified number of days from a date.
**Parameters**:
- `date` (Date): The date from which to subtract days.
- `days` (number): The number of days to subtract.

**Returns**:
- The new date with the subtracted days.

**Example**:
```Typescript
const newDate = timeService.subtractDays(new Date(), 5);
console.log(newDate);
```
#### `subtractMonths(date: Date, months: number): Date`
Subtracts a specified number of months from a date.
**Parameters**:
- `date` (Date): The date from which to subtract months.
- `months` (number): The number of months to subtract.

**Returns**:
- The new date with the subtracted months.

**Example**:
```Typescript
const newDate = timeService.subtractMonths(new Date(), 3);
console.log(newDate);
```
#### `subtractYears(date: Date, years: number): Date`
Subtracts a specified number of years from a date.
**Parameters**:
- `date` (Date): The date from which to subtract years.
- `years` (number): The number of years to subtract.

**Returns**:
- The new date with the subtracted years.

**Example**:
```Typescript
const newDate = timeService.subtractYears(new Date(), 2);
console.log(newDate);
```
#### `isSameDay(date1: Date, date2: Date): boolean`
Checks if two dates are on the same day.
**Parameters**:
- `date1` (Date): The first date.
- `date2` (Date): The second date.

**Returns**:
- True if the dates are on the same day, false otherwise.

**Example**:
```Typescript
const sameDay = timeService.isSameDay(new Date(), new Date());
console.log(sameDay); // Output: true
```


## [Dom Service](#dom-service)
The `DomService` facilitates DOM manipulation and dynamic component loading in Angular applications.
### Methods
#### `appendById(component: any, options: any = {}, id: string): { nativeElement: HTMLElement, componentRef: ComponentRef<any> }`
Appends a component to a specified element by ID.

**Parameters**:
- `component` (any): The component to append.
- `options` (any): The options to project into the component.
- `id` (string): The ID of the element to append the component to.

**Returns**:
- An object containing the native element and the component reference.

**Example**:
```Typescript
const result = domService.appendById(MyComponent, { inputProp: 'value' }, 'elementId');
console.log(result.nativeElement); // Output: The native DOM element
console.log(result.componentRef); // Output: The component reference
```
#### `appendComponent(component: any, options: any = {}, element: HTMLElement = this.core.document.body): { nativeElement: HTMLElement, componentRef: ComponentRef<any> }`
Appends a component to a specified element or to the body.
**Parameters**:
- `component` (any): The component to append.
- `options` (any): The options to project into the component.
- `element` (HTMLElement): The element to append the component to. Defaults to body.

**Returns**:
- An object containing the native element and the component reference.

**Example**:
```Typescript
const result = domService.appendComponent(MyComponent, { inputProp: 'value' });
console.log(result.nativeElement); // Output: The native DOM element
console.log(result.componentRef); // Output: The component reference
```
#### `getComponentRef(component: any, options: any = {}): ComponentRef<any>`
Gets a reference to a dynamically created component.
**Parameters**:
- `component` (any): The component to create.
- `options` (any): The options to project into the component.

**Returns**:
- The component reference.

**Example**:
```Typescript
const componentRef = domService.getComponentRef(MyComponent, { inputProp: 'value' });
console.log(componentRef); // Output: The component reference
```
#### `projectComponentInputs(component: ComponentRef<any>, options: any): ComponentRef<any>`
Projects the inputs onto the component.
**Parameters**:
- `component` (ComponentRef<any>): The component reference.
- `options` (any): The options to project into the component.

**Returns**:
- The component reference with the projected inputs.

**Example**:
```Typescript
const componentRef = domService.getComponentRef(MyComponent);
domService.projectComponentInputs(componentRef, { inputProp: 'value' });
console.log(componentRef.instance.inputProp); // Output: 'value'
```
### Usage Example
```Typescript
import { DomService } from './dom.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  constructor(private domService: DomService) {}

  addComponent() {
    const result = this.domService.appendById(MyComponent, { inputProp: 'value' }, 'elementId');
    console.log(result.nativeElement); // Output: The native DOM element
    console.log(result.componentRef); // Output: The component reference
  }
}
```
