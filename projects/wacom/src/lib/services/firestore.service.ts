import { Injectable, inject } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';

@Injectable({
	providedIn: 'root',
})
export abstract class FirestoreService<T> {
	protected __firestore = inject(AngularFirestore);

	constructor(protected collection: string) {}

	/**
	 * Retrieves all documents from the specified Firestore collection.
	 */
	get(): Observable<T[]> {
		return this.__firestore
			.collection<T>(this.collection)
			.valueChanges({ idField: 'id' });
	}

	/**
	 * Retrieves a single document from the Firestore collection by its ID.
	 */
	doc(id: string): Observable<T | undefined> {
		return this.__firestore
			.collection<T>(this.collection)
			.doc(id)
			.valueChanges();
	}

	/**
	 * Creates a new document in the Firestore collection with a generated ID.
	 */
	create(data: T): Promise<void> {
		const id = this.__firestore.createId();
		return this.__firestore.collection(this.collection).doc(id).set(data);
	}

	/**
	 * Updates an existing document in the Firestore collection by its ID.
	 */
	update(id: string, data: Partial<T>): Promise<void> {
		return this.__firestore
			.collection(this.collection)
			.doc(id)
			.update(data);
	}

	/**
	 * Deletes a document from the Firestore collection by its ID.
	 */
	delete(id: string): Promise<void> {
		return this.__firestore.collection(this.collection).doc(id).delete();
	}
}
