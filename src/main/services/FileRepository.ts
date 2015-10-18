/// <reference path="../../typings/tsd.d.ts"/>
/// <reference path="../dataproviders/model.d.ts"/>

import {Repository} from './Repository'
import $ = require('jquery-hive');
import {ConnectionPool} from './ConnectionPool'
import {PapaLocalDataProvider} from '../dataproviders/PapaLocalDataProvider'
import {BatchingProvider} from '../dataproviders/BatchingProvider'
import {Promise} from "es6-promise"

console.info("HIVE IS ", $)
/**
 * Repository allowing
 * to save a file in a single datastore.
 */
export class FileRepository {
	private pool : ConnectionPool;
	
	constructor(pool: ConnectionPool = new ConnectionPool()) {
		this.pool = pool;
	}

	/**
	 * Used for tests.
	 */
	public close(){
		this.pool.db.close();
	}
	
	public saveFile(id : number, csvFile : File) : Promise<void>{
		let fileItem : IFileItem = {
			id : id,
			name : "somename",
			dataStream : new BatchingProvider(new PapaLocalDataProvider(csvFile),100)
		};
		return this.savePromise(fileItem)
	}
	
	public openDb(version?: number, upgrade? : (IDBDatabase) => void): Promise<IDBDatabase>{
		return new Promise<IDBDatabase>((resolve,reject)=>{
			let indexedDB =self.indexedDB || window.indexedDB
			let request : IDBOpenDBRequest;
			if (!version)
			{
				request = indexedDB.open("Chartiddle");
			}
			else 
			{
				request = indexedDB.open("Chartiddle", version);
			}
			if (upgrade){
				request.onupgradeneeded = (ev)=>{
					let newDb = <IDBDatabase>ev.target['result'];
					upgrade(newDb);
				}
			}
			request.onsuccess = ()=>{
				resolve(request.result);
			}
			request.onerror = ()=>{
				reject();
			}
		});
	}
	
	/**
	 * Will save the stream in a store,
	 * dropping a recreating it before.
	 * @param file {File} : a file to save.
	 * @return {JQueryPromise<void>}
	 */
	public savePromise(file: IFileItem): Promise<void> {

		let storeName = "FILE_" + file.id;
		if (this.pool.db){
			this.pool.db.close();
		}
		
		return new Promise<void>((resolve,reject)=>{
			let version : number;
			let transaction : IDBTransaction= undefined;
			this.openDb().then((db)=>{
				let version = parseInt(db.version)+1;
				db.close();
				return this.openDb(version, (newDb)=>{
					if (newDb.objectStoreNames.contains(storeName)) {
						newDb.deleteObjectStore(storeName);
					}
					newDb.createObjectStore(storeName, { autoIncrement: true });	
				});
			}).then((db)=>{
				file.dataStream.foreach((data) => {
					if (!transaction){
						console.info("*******creating a new transaction")
						transaction =db.transaction([storeName], "readwrite");
						transaction.oncomplete = () => {
							resolve();
							console.info('transaction complete')
						};
					} else {
						console.info("reusing transation")
					}
					let store = transaction.objectStore(storeName);
					store.add(data);
				}, () => {
					console.info("no more data");
				});
				
			})
		});
	}
	
	/**
	 * Will save the stream in a store,
	 * dropping a recreating it before.
	 * @param file {File} : a file to save.
	 * @return {JQueryPromise<void>}
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
		let transaction : IDBTransaction= undefined;
		openDb.onsuccess = () => {
			file.dataStream.foreach((data) => {
				if (!transaction){
					console.info("*******creating a new transaction")
					transaction =newDb.transaction([storeName], "readwrite");
					transaction.oncomplete = () => {
						deferred.resolve();
				 		console.info('transaction complete')
					};
				} else {
					console.info("reusing transation")
				}
				let store = transaction.objectStore(storeName);
				// TODO : handle errors.
				// transaction.onerror = () => {
				// 	console.error("transaction rollback");
				// 	deferred.reject();
				// }
				// console.info("inserting,",data);
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
	
	/**
	 * Returns a datastream able to iterate 
	 * over each line in the datasource.
	 * @param id {number} : id of the file.
	 * @param lines {number} : number of lines to read.
	 * @return a datastream.
	 * TODO : Implement interpretation of 'each' return value,
	 * 	returning false needs to stop the loop.
	 */
	public getAll(id: number, lines? : number) {
		let storeName = "FILE_" + id;
		
		let result = {
			foreach : (each : (data : any) => (void | boolean), done : () => void ) => {
				let transaction = this.pool.db.transaction([storeName], "readonly");
				let store = transaction.objectStore(storeName);
				let nLines = 0;
				store.openCursor().onsuccess = function(event: any) {
					let cursor: IDBCursorWithValue = event.target.result;
					if (cursor) {
						each(cursor.value)
						nLines++;
						if (lines && nLines >= lines){
							done();
						} else {
							cursor.continue();
						}
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