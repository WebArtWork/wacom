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
| [**`Render`**](https://www.npmjs.com/package/wacom#render-service) | Make not automated render management well structured |
| [**`Meta`**](https://www.npmjs.com/package/wacom#meta-service) | Website meta tags management within router |
| [**`Alert`**](https://www.npmjs.com/package/wacom#alert-service) | Alerts management |
| [**`Modal`**](https://www.npmjs.com/package/wacom#modal-service) | Modals management |
| [**`UI`**](https://www.npmjs.com/package/wacom#ui-service) | Supportive UI/UX service |

## Core Service

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
