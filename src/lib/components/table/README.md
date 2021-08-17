# Table
## Styles
To import default styles, you should import it to the styles.scss 
```
@import '~projects/wacom/src/lib/components/table/table.component'
```

## Usage
```html
<wtable [rows]="rows" [config]="config" [columns]="['name', 'description']"></wtable>
```
### options
```
rows - array // [{title: 'Title'}]
config - object // {pageSizeOptions: [5, 10, 25], perPage: 5, page: 1, searchable: true}
columns - array // ['name', 'description']
```
## Directives

### cell
Directive for customizing specific cell value.
Example:
```
<ng-template cell="id" let-element>{{element._id}}</ng-template>
```
### sort 
Directive for adding sort to the column
Example: 
```
<ng-template sort cell="id" let-element>{{element._id}}</ng-template>
```
### actions
Directive for changing the name of actions column
Example: 
```
<ng-template actions>Test</ng-template>
```
### customEdit
Directive to make custom Document Form
Example:
```
<ng-template customEdit>
	<form (ngSubmit)="submit()">
		<div>
			<label *ngFor="let field of doc">
				<span>{{field.label}}</span>
				<input [(ngModel)]="field.name">
			</label>
		</div>
		<div>
			<button class="_cancel" type="button" (click)="doc=null;">Cancel</button>
			<button class="_create" type="submit">{{doc._id&&'Save'||'Create'}}</button>
		</div>
	</form>
</ng-template>
```
