import $ = require('jquery');
import {ConnectionPool} from './ConnectionPool'
interface connStore {
	[name : string] : IDBDatabase;
}

export class Repository<TObject, TKey>  {
	private tableName: string;
	private pool : ConnectionPool;
	
	/**
	 * Creates a new repo.
	 * @param db {IDBDatabase} : the db previously opened.
	 * @param tableName {string} : the name of the table
	 * 			to create the repo for.
	 */
	constructor(pool: ConnectionPool, tableName: string) {
		this.tableName = tableName;
		this.pool = pool;
	}
	
	/**
	 * Deletes an item by key.
	 * @param key {TKey} : the key of the item to delete.
	 */
	public delete(key : TKey){
		this.executeInTransaction((objectStore, deferred)=>{
			let request = objectStore.delete(key);
			request.onsuccess = (ev) => {
				deferred.resolve();
			}
			request.onerror = (ev) => {
				deferred.reject();
			}
		})
	}
	/**
	 * Inserts or updates the object.
	 * @param item {TObject} : the object to insert/update.
	 */
	public save(item: TObject): JQueryPromise<void> {
		return this.executeInTransaction<void>((objectStore, deferred) => {
			let request = objectStore.put(item);
			request.onerror = (ev) => {
				deferred.reject();
			}
			request.onsuccess = (ev) => {
				item[objectStore.keyPath] = request.result;
				deferred.resolve();
			}
		});
	}
	
	/**
	 * Get all objects.
	 */
	public getAll(): JQueryPromise<TObject[]> {
        let result = $.Deferred<TObject[]>();
        let transaction = this.pool.db.transaction([this.tableName], "readonly");

        let objectStore = transaction.objectStore(this.tableName);

        let allItems: TObject[] = [];

        objectStore.openCursor().onsuccess = function(event: any) {
            let cursor: IDBCursorWithValue = event.target.result;
            if (cursor) {
                allItems.push(cursor.value)
                cursor.continue();
            }
            else {
                result.resolve(allItems);
            }
        };
        return result.promise();
    }
	
	/**
	 * Get a single object.
	 * @param key {TKey} : the key identifying the object.
	 */
	public get(key: TKey): JQueryPromise<TObject> {
		return this.executeInTransaction<TObject>((objectStore, deferred) => {
			let request = objectStore.get(key);
			request.onerror = (ev) => {
				deferred.reject();
			}
			request.onsuccess = (ev) => {
				deferred.resolve(request.result);
			}
		})
	}
	
	/**
	 * Execute given payload in a transaction scope.
	 * @param payload {(IBDObjectStore,JQueryDeferred<T>) => void} : payload to execute.
	 * @param T : type of deferred.
	 * @return : the promise.
	 */
	protected executeInTransaction<T>(payload: (o: IDBObjectStore, deferred: JQueryDeferred<T>) => void, storeName? : string): JQueryPromise<T> {
		let res = $.Deferred<T>();

        let transaction = this.pool.db.transaction([this.tableName], "readwrite");
        let objectStore = transaction.objectStore(storeName || this.tableName);

        transaction.oncomplete = function(event) {
            console.info("transaction completed");
            res.resolve();
        };

        transaction.onerror = function(event) {
            console.error("transaction not open due to error", event)
            res.reject();
        };

		payload(objectStore, res);

        return res.promise();
	}
}