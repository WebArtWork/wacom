# AlertService

Service for Alerts

## Usage
```javascript
import { AlertService } from 'wacom';
...
constructor(public alert: AlertService){
	this.alert.show({
		text: 'Alerts working!',
		type: "success",
		position: 'bottomCenter', // [bottomRight, bottomLeft, topRight, topLeft, topCenter, bottomCenter or center]
	})
}
```
## Functions

### show(options)

Show alert with options

### options
```
text - string
type - string // ['info', 'success', 'error', 'warning', 'question']
progress - boolean
position - string // ['bottomRight', 'bottomLeft', 'topRight', 'topLeft', 'topCenter', 'bottomCenter', 'center']
timeout - number
close - boolean
buttons - array // [{text, callback}]
```
### desrtroy()

Destroy all alerts