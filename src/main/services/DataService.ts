/// <reference path="../../typings/tsd.d.ts"/>
/// <reference path="../model/model.d.ts"/>

import $ = require('jquery');

declare var window :any;
const CHARTS_STORE : string = "Charts";
const DATAMODELS_STORE : string = "DataModels";
const DATASOURCES_STORE : string = "DataSources";

class DataService {
    private db : IDBDatabase;
    
    constructor(done){
        if (!this.init()){
            console.error("indexedDB is not supported in your browser");
            return;
        }
        console.info("indexedDB seems to be supported");

    }

    /**
     * Gets a usable instance of dataservice.
     */
    public static get() : JQueryDeferred<DataService> {
        var res = $.Deferred<DataService>();

        var service = new DataService(function(){
            res.resolve(service);
        });

        return res;
    }

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

    /**
     * Efficiently inserts all data from the dataProvider
     * in indexedDb.
     */
    public insert(dataProvider : IDataProvider): JQueryDeferred<void>{
        var res = $.Deferred<void>();
        var store = "dataSource"
        // TODO : move all this to use greedy.
        var allData = []
        var db = this.db;
        dataProvider.foreach(function(data){
            allData.push(data.data[0])
        },function(){
                var transaction = db.transaction([store], "readwrite");
            var objectStore = transaction.objectStore(store);

            transaction.oncomplete = function(event) {
                console.info("transaction completed");
                res.resolve();
            };

            transaction.onerror = function(event) {
                console.error("transaction not open due to error", event)
                res.fail();
            };

            for (var i = 0; i < allData.length; i++){
                var request = objectStore.add(allData[i]);	
                /*request.onsuccess = function(event) {
                };*/	
            }
            })
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

    public getAll() : JQueryDeferred<IDataProvider> {
        var result = $.Deferred<IDataProvider>();
        var store = "dataSource";
        var db = this.db;

        var provider = {
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
            },
            greedy: function () {
                console.error("greedy indexedDb provider is not yet implemented");
                var res = $.Deferred<IDataProvider>();
                res.resolve(provider);
                return res;
            }
        };

        result.resolve(provider);

        return result;
    }
    
    /**
     * Perform checks on the browser to see if indexeddb is supported.
     */
    public init(){
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
     */
    public initDatabase(dataBaseName) : JQueryDeferred<void> {
        var res = $.Deferred<void>();
        
        var initDbRequest = window.indexedDB.open(dataBaseName, 6);
        
        initDbRequest.onsuccess = (function(event){
            this.db = initDbRequest.result;
            res.resolve();
        }).bind(this);

        initDbRequest.onerror = function(event){
            console.error("Database error: " + event.target.errorCode);
            res.reject();
        }
        initDbRequest.onupgradeneeded = function(event) {
            this.upgradeDatabase(event.target.result);
        };
        return res;
    }
    
    
     
    private upgradeDatabase(db : IDBDatabase){

            // Create an objectStore to hold information about our customers. We're
            // going to use "ssn" as our key path because it's guaranteed to be
            // unique.
            if (!db.objectStoreNames.contains(DATASOURCES_STORE)) {
                var dataModelStore = db.createObjectStore(DATASOURCES_STORE,  { autoIncrement: true });
            }
            if (!db.objectStoreNames.contains(CHARTS_STORE)) {
                var dataSourceStore = db.createObjectStore(CHARTS_STORE, { autoIncrement: true });
            }
            if (!db.objectStoreNames.contains(DATAMODELS_STORE)) {
                var dataSourceStore = db.createObjectStore(DATAMODELS_STORE, { autoIncrement: true });
            }
            // Create an index to search customers by name. We may have duplicates
            // so we can't use a unique index.
            //objectStore.createIndex("name", "name", { unique: false });

            // Create an index to search customers by email. We want to ensure that
            // no two customers have the same email, so use a unique index.
            //objectStore.createIndex("email", "email", { unique: true });
    }

    public GetModel(first_argument) {
        
    }
}
export =  DataService;