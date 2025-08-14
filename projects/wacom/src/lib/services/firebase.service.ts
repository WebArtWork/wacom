import { Inject, Injectable, Optional } from '@angular/core';
import {
        CONFIG_TOKEN,
        Config,
        DEFAULT_CONFIG,
} from '../interfaces/config.interface';
import { FirebaseConfig } from '../interfaces/firebase.interface';
import { CoreService } from './core.service';

/**
 * Service that wraps basic Firebase initialization and Firestore CRUD helpers.
 *
 * The Firebase library is expected to be provided via the global configuration
 * under the `fb` property. Connection options can be supplied through the
 * `firebase` configuration or by calling {@link setConfig}.
 */
@Injectable({
        providedIn: 'root',
})
export class FirebaseService {
        private _fbConfig: FirebaseConfig | boolean = false;

        private _app: any;

        private _db: any;

        private _connected = false;

        constructor(
                @Inject(CONFIG_TOKEN) @Optional() private _config: Config,
                private _core: CoreService
        ) {
                if (!this._config) {
                        this._config = DEFAULT_CONFIG;
                }

                if (this._config.firebase) {
                        this._fbConfig = this._config.firebase;
                        this.load();
                }
        }

        /**
         * Set Firebase configuration and (re)initialize connection.
         *
         * @param config Firebase application configuration.
         */
        setConfig(config: FirebaseConfig): void {
                this._fbConfig = config;

                if (!this._config.firebase) {
                        this._config.firebase = config;
                }

                this.load();
        }

        /**
         * Initialize Firebase app and Firestore instance.
         */
        private load(): void {
                if (!this._config.fb || !this._fbConfig) {
                        return;
                }

                const fb = this._config.fb.default
                        ? this._config.fb.default
                        : this._config.fb;

                const opts = typeof this._fbConfig === 'object' ? this._fbConfig.options : undefined;
                const name =
                        typeof this._fbConfig === 'object' && this._fbConfig.appName
                                ? this._fbConfig.appName
                                : undefined;

                this._app = fb.initializeApp(opts || {}, name);

                this._db = fb.firestore ? fb.firestore(this._app) : null;

                this._connected = true;

                this._core.complete('firebase');
        }

        private async _waitConnection(): Promise<void> {
                if (this._connected || !this._config.firebase) {
                        return;
                }

                await new Promise<void>((resolve) => {
                        const check = () => {
                                if (this._connected) {
                                        resolve();
                                } else {
                                        setTimeout(check, 100);
                                }
                        };
                        check();
                });
        }

        /**
         * Create a document in the specified collection.
         *
         * @param path Collection path.
         * @param data Document data.
         */
        async create(path: string, data: any): Promise<any> {
                await this._waitConnection();
                return this._db.collection(path).add(data);
        }

        /**
         * Read documents from the specified collection or document.
         *
         * @param path Collection path.
         * @param id Optional document id. If provided, a single document is
         *          returned, otherwise all documents are fetched.
         */
        async read(path: string, id?: string): Promise<any> {
                await this._waitConnection();

                if (id) {
                        return this._db.collection(path).doc(id).get();
                }

                return this._db.collection(path).get();
        }

        /**
         * Update a document in the specified collection.
         *
         * @param path Collection path.
         * @param id Document identifier.
         * @param data Data to merge with the document.
         */
        async update(path: string, id: string, data: any): Promise<any> {
                await this._waitConnection();
                return this._db.collection(path).doc(id).update(data);
        }

        /**
         * Delete a document from the specified collection.
         *
         * @param path Collection path.
         * @param id Document identifier.
         */
        async delete(path: string, id: string): Promise<any> {
                await this._waitConnection();
                return this._db.collection(path).doc(id).delete();
        }
}
