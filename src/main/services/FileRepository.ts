import {Repository} from './Repository'
import $ = require('jquery');

interface IFileItem {
	id: number;
	name: string;
	file?: File;
	dataStream?: IDataStream;
}

export interface IDataStream {
	foreach: (stepCallback: (data: any) => void,
	completeCallback: () => void,
	bindTo?: any) => void;
}

export class FileRepository {
	private db: IDBDatabase;

	constructor(db: IDBDatabase) {
		this.db = db;
	}
	
	public close(){
		this.db.close();
	}

	public save(file: IFileItem): JQueryPromise<void> {
		let deferred = $.Deferred<void>();
		let storeName = "FILE_" + file.id;

		if (this.db.objectStoreNames.contains(storeName)) {
			let deleteRequest = this.db.deleteObjectStore(storeName);
		}
		this.db.close();
		let newDb: IDBDatabase;
		let openDb = window.indexedDB.open(this.db.name, parseInt(this.db.version) + 1);
		openDb.onupgradeneeded = (ev) => {
			newDb = <IDBDatabase>ev.target['result'];
			newDb.createObjectStore(storeName, { autoIncrement: true });
			this.db = newDb;
		}
		openDb.onblocked = () => {
			console.error("blocked");
			throw "blocked";
			deferred.reject();
		}
		openDb.onsuccess = () => {
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
			file.dataStream.foreach((data) => {
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
				let transaction = this.db.transaction([storeName], "readonly");
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