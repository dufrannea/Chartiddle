/// <reference path="../../typings/tsd.d.ts"/>
/// <reference path="../dataproviders/model.d.ts"/>

import {Repository} from './Repository'
import {ConnectionPool} from './ConnectionPool'
import {PapaLocalDataProvider} from '../dataproviders/PapaLocalDataProvider'
import {BatchingProvider} from '../dataproviders/BatchingProvider'
import {Promise} from "es6-promise"

/**
 * Repository allowing
 * to save a file in a single datastore.
 */
export class FileRepository {
	private pool : ConnectionPool;
	private _storeName : string;
	private _keyPath : string;
	
	constructor(
		pool: ConnectionPool = new ConnectionPool(), 
		storeName : string,
		keyPath : string = null 
	) {
		this.pool = pool;
		this._storeName = storeName;
		this._keyPath = keyPath;
	}
	
	private getStoreName(id : number){
		return this._storeName + "_"+ id;
	}
	/**
	 * Used for tests.
	 */
	public close(){
		this.pool.db.close();
	}
	
	/**
	 * Saves a file that will be parsed to csv 
	 * and batched.
	 * @param id {number} : the id of the file, used to 
	 * 		create the datastore.
	 * @param csvFile {File} : the file to convert to csv.
	 * @return {Promise<void>}
	 */
	public saveFile(id : number, csvFile : File) : Promise<void>{
		let fileItem : IFileItem = {
			id : id,
			name : "somename",
			dataStream : new BatchingProvider(new PapaLocalDataProvider(csvFile),100)
		};
		return this.save(fileItem)
	}
	
	/**
	 * Deletes a file, i.e. delete the whole datastore.
	 * @param id {number} : the id of the file to delete.
	 * @return {Promise<void>}
	 */
	public deleteFile(id : number) : Promise<void>{
		let storeName = this.getStoreName(id);
		if (this.pool.db){
			this.pool.db.close();
		};
		
		return this.openDb().then((db)=>{
				let version = parseInt(db.version)+1;
				db.close();
				return this.openDb(version, (newDb)=>{
					if (newDb.objectStoreNames.contains(storeName)) {
						newDb.deleteObjectStore(storeName);
					}
				});
			}).then(()=>{})
	}
	
	/**
	 * Will save the stream in a store,
	 * dropping a recreating it before.
	 * @param file {File} : a file to save.
	 * @return {JQueryPromise<void>}
	 */
	public save(file: IFileItem): Promise<void> {

		let storeName = this.getStoreName(file.id);	
		if (this.pool.db){
			this.pool.db.close();
		}
		
		return new Promise<void>((resolve,reject)=>{
			let version : number;
			let transaction : IDBTransaction= undefined;
			let transactionId : number = 0;
			
			let tryResolve = (id)=>{
				if (id == transactionId) {
					resolve()
					return true;
				} 
				return false;
			}
			
			this.openDb().then((db)=>{
				let version = parseInt(db.version)+1;
				db.close();
				return this.openDb(version, (newDb)=>{
					if (newDb.objectStoreNames.contains(storeName)) {
						newDb.deleteObjectStore(storeName);
					}
					if (this._keyPath){
						newDb.createObjectStore(
							storeName, 
							{ 
								autoIncrement: false, 
								keyPath : this._keyPath 
							});
					} else {
						newDb.createObjectStore(storeName, 
							{ 
								autoIncrement: true 
							});
					}	
				});
			}).then((db)=>{
				file.dataStream.foreach((data) => {
					if (!transaction){
						console.info("*******creating a new transaction")
						transaction = db.transaction([storeName], "readwrite");
						transaction.oncomplete = () => {
							tryResolve(transactionId);
							console.info('transaction complete')
						};
					}
					try { 
						transaction
							.objectStore(storeName)
							.add(data);
					} catch (e){
						console.error("reuse failed");
						transactionId+=1;
						transaction = db.transaction([storeName], "readwrite");
						transaction.oncomplete = () => {
							tryResolve(transactionId);
							console.info('transaction complete')
						};
						transaction
							.objectStore(storeName)
							.add(data);
					}
				}, () => {
					console.info("no more data");
				});
				
			})
		});
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
	public getAsDataStream(id: number, lines? : number) {
		let storeName = this.getStoreName(id);		
		
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
	
	private openDb(version?: number, upgrade? : (IDBDatabase) => void): Promise<IDBDatabase>{
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
					this.pool.db = newDb;
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
}