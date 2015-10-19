import {ConnectionPool} from './ConnectionPool'

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
		this.executeInTransaction((objectStore, resolve, reject)=>{
			let request = objectStore.delete(key);
			request.onsuccess = (ev) => {
				resolve();
			}
			request.onerror = (ev) => {
				reject();
			}
		})
	}
	
	/**
	 * Inserts or updates the object.
	 * @param item {TObject} : the object to insert/update.
	 */
	public save(item: TObject): Promise<void> {
		return this.executeInTransaction<void>((objectStore, resolve, reject) => {
			let request = objectStore.put(item);
			request.onerror = (ev) => {
			}
			request.onsuccess = (ev) => {
				item[objectStore.keyPath] = request.result;
			}
		});
	}
	
	/**
	 * Get all objects.
	 */
	public getAll(): Promise<TObject[]> {
		return new Promise<TObject[]>((resolve, reject)=>{
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
					resolve(allItems);
				}
			};
		})
    }
	
	/**
	 * Get a single object.
	 * @param key {TKey} : the key identifying the object.
	 */
	public get(key: TKey): Promise<TObject> {
		return this.executeInTransaction<TObject>((objectStore, resolve, reject) => {
			let request = objectStore.get(key);
			request.onerror = (ev) => {
				reject();
			}
			request.onsuccess = (ev) => {
				resolve(request.result);
			}
		})
	}
	
	/**
	 * Execute given payload in a transaction scope.
	 * @param payload {(IBDObjectStore,JQueryDeferred<T>) => void} : payload to execute.
	 * @param T : type of deferred.
	 * @return : the promise.
	 */
	protected executeInTransaction<T>(payload: (o: IDBObjectStore, resolve, reject) => any, storeName? : string): Promise<T> {
		return new Promise<T>((resolve,reject)=>{
			let transaction = this.pool.db.transaction([this.tableName], "readwrite");
			let objectStore = transaction.objectStore(storeName || this.tableName);
	
			transaction.oncomplete = function(event) {
				console.info("transaction completed");
				resolve();
			};
	
			transaction.onerror = function(event) {
				console.error("transaction not open due to error", event)
				reject();
			};
	
			return payload(objectStore, resolve,reject);
		});
	}
}