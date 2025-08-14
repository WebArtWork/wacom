# FirebaseService

Service for connecting to Firebase and performing basic CRUD operations.

## Usage

```typescript
import { FirebaseService } from 'wacom';

constructor(private firebase: FirebaseService) {
        this.firebase.setConfig({
                options: { /* firebase config */ }
        });
}

async saveUser() {
        await this.firebase.create('users', { name: 'John' });
}
```

## Functions

### setConfig(config)

Configure and connect the Firebase app.

### create(path, data)

Add a document to a collection.

### read(path, id?)

Read all documents from a collection or a single document by ID.

### update(path, id, data)

Update a document.

### delete(path, id)

Remove a document from a collection.
