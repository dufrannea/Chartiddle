/// <reference path="../dataproviders/model.d.ts"/>

import {Repository} from './Repository'
import $ = require('jquery');
import {ConnectionPool} from './ConnectionPool'

interface IFileItem {
	id: number;
	name: string;
	dataStream?: IDataStream;
}

/**
 * Repository allowing
 * to save a file in a single datastore.
 */
export class FileRepository {
	private pool : ConnectionPool;

	constructor(pool: ConnectionPool) {
		this.pool = pool;
	}
	
	public close(){
		this.pool.db.close();
	}
	
	/**
	 * Will save the stream in a store,
	 * dropping a recreating it before.
	 */
	public save(file: IFileItem): JQueryPromise<void> {
		let deferred = $.Deferred<void>();
		let storeName = "FILE_" + file.id;

		this.pool.db.close();
		let newDb: IDBDatabase;
		let openDb = window.indexedDB.open(this.pool.db.name, parseInt(this.pool.db.version) + 1);
		
		openDb.onupgradeneeded = (ev) => {
			newDb = <IDBDatabase>ev.target['result'];
			if (newDb.objectStoreNames.contains(storeName)) {
				newDb.deleteObjectStore(storeName);
			}
			newDb.createObjectStore(storeName, { autoIncrement: true });
			
			// set the db in the pool
			this.pool.db = newDb;
		}
		openDb.onblocked = () => {
			console.error("blocked");
			throw "blocked";
			deferred.reject();
		}
		openDb.onsuccess = () => {
			file.dataStream.foreach((data) => {
				let transaction = newDb.transaction([storeName], "readwrite");
				let store = transaction.objectStore(storeName);
				transaction.oncomplete = () => {
					console.info('transaction complete')
					deferred.resolve();
				};
				transaction.onerror = () => {
					console.error("transaction rollback");
					deferred.reject();
				}
				console.info("inserting,",data);
				store.add(data);
			}, () => {
				console.info("no more data");
			});
		}
		openDb.onerror = (err) => {
			console.error("db upgrade failed");
			deferred.reject();
		}
		return deferred.promise();
	}

	public getAll(id: number) {
		let storeName = "FILE_" + id;
		
		let result = {
			foreach : (each : (data : any) => void, done : () => void ) => {
				let transaction = this.pool.db.transaction([storeName], "readonly");
				let store = transaction.objectStore(storeName);
				store.openCursor().onsuccess = function(event: any) {
					let cursor: IDBCursorWithValue = event.target.result;
					if (cursor) {
						each(cursor.value)
						cursor.continue();
					}
					else {
						done();
					}
				};
			}
		}
		
		return result;
	}
}