/// <reference path="../../typings/tsd.d.ts"/>
/// <reference path="../model/model.d.ts"/>

import $ = require('jquery');

declare var window : any;
const CHARTS_STORE : string = "Charts";
const DATAMODELS_STORE : string = "DataModels";
const DATASOURCES_STORE : string = "DataSources";

export class DataService {
    private db : IDBDatabase;
    
    constructor(){
        if (!this.isIndexedDBSupported()){
            console.error("indexedDB is not supported in your browser");
            return;
        }
        console.info("indexedDB seems to be supported");
    }

    /**
     * Gets a usable instance of dataservice.
     */
//     public static get() : JQueryDeferred<DataService> {
// //         var res = $.Deferred<DataService>();
// // 
// //         var service = new DataService(function(){
// //             res.resolve(service);
// //         });
// // 
// //         return res;
//     }

    public getConfig(): JQueryDeferred<IDataModel>{
        var res = $.Deferred<IDataModel>();
        var t = this.db.transaction(["applicationConfig"], "readonly");
        var req = t.objectStore("applicationConfig").get("dataModel");
        req.onsuccess = function(event){
            res.resolve(req.result);
        }

        return res;
    }
    
    public saveConfig(model: IDataModel): JQueryDeferred<void>{
        var res = $.Deferred<void>();

        var t = this.db.transaction(["applicationConfig"], "readwrite");
        var req = t.objectStore("applicationConfig").put(model, "dataModel");
        req.onsuccess = function(event){
            console.info("successfully saved configuration", event);
            res.resolve();
        }
        return res;
    }

 

    public getAllByColumn(store: string, column: string, value: string) {
        var db = this.db;
        return {
            foreach: function (each, done, bindTo) {
                var t = db.transaction([store], "readonly");
                t.oncomplete = function (event) {
                    console.info("transaction completed");
                    done.apply(bindTo, []);
                }
                var objectStore = t.objectStore(store);
                objectStore.openCursor().onsuccess = function (event: any) {
                    var cursor = event.target.result;
                    if (cursor) {
                        each.apply(bindTo, [cursor.value]);
                        cursor.continue();
                    }
                    else {
                        console.info("No more entries!");
                    }
                };
            }
        }
    }

    public insertDataSource(dataSource : IDataSource): JQueryPromise<void>{
        var res = $.Deferred<void>();
        var store = DATASOURCES_STORE
        var db = this.db;
        // TODO : move all this to use greedy.
        var transaction = db.transaction([store], "readwrite");
        var objectStore = transaction.objectStore(store);

        transaction.oncomplete = function(event) {
            console.info("transaction completed");
            res.resolve();
        };

        transaction.onerror = function(event) {
            console.error("transaction not open due to error", event)
            res.reject();
        };

        var request = objectStore.add(dataSource);	
        
        return res.promise();
    }

    public getAllDataSources() : JQueryPromise<IDataSource[]> {
        let result = $.Deferred<IDataSource[]>();
        let store = DATASOURCES_STORE;
        let db = this.db;

        let t = db.transaction([store], "readonly");
        // t.oncomplete = function (event) {
        //     console.info("transaction completed");
        // }
        let objectStore = t.objectStore(store);
        
        let allDataSources : IDataSource[] = [];
        
        objectStore.openCursor().onsuccess = function (event: any) {
            let cursor : IDBCursorWithValue = event.target.result;
            if (cursor) {
                allDataSources.push(cursor.value)
                cursor.continue();
            }
            else {
                result.resolve(allDataSources);
                console.info("No more entries!");
            }
        };
        return result.promise();
    }
    
    /**
     * Perform checks on the browser to see if indexeddb is supported.
     */
    public isIndexedDBSupported(){
        window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
        window.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction;
        window.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange
        
        if (!window.indexedDB) {
            return false;
        }
        return true;
    }

    /**
     * Initializes the database.
     * @param dataBaseName {string} : the name of the  
     *        database to initialize.
     */
    public initDatabase(dataBaseName, version : number) : JQueryPromise<void> {
        var res = $.Deferred<void>();
        
        var initDbRequest = window.indexedDB.open(dataBaseName, version);
        
        initDbRequest.onsuccess = (event) =>{
            this.db = initDbRequest.result;
            res.resolve();
        }

        initDbRequest.onerror = (event) => {
            console.error("Database error: " + event.target.errorCode);
            res.reject();
        }
        
        initDbRequest.onupgradeneeded = (event) => {
            this.upgradeDatabase(event.target.result);
        };
        
        return res.promise();
    }
     
    private upgradeDatabase(db : IDBDatabase){

            let dropCreate = (name : string) => {
                if (db.objectStoreNames.contains(name)) {
                    db.deleteObjectStore(name);
                }
                var dataModelStore = db.createObjectStore(name,  { autoIncrement: true , keyPath : "id" });    
            }
            dropCreate(DATAMODELS_STORE);
            dropCreate(DATASOURCES_STORE);
            dropCreate(CHARTS_STORE);
            
            // Create an index to search customers by name. We may have duplicates
            // so we can't use a unique index.
            //objectStore.createIndex("name", "name", { unique: false });

            // Create an index to search customers by email. We want to ensure that
            // no two customers have the same email, so use a unique index.
            //objectStore.createIndex("email", "email", { unique: true });
    }
}

export var dataService = new DataService();