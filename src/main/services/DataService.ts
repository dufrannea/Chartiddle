/// <reference path="../../typings/tsd.d.ts"/>
/// <reference path="../model/model.d.ts"/>

import $ = require('jquery');
import {Repository} from './Repository'

declare var window: any;
const CHARTS_STORE: string = "Charts";
const DATAMODELS_STORE: string = "DataModels";
const DATASOURCES_STORE: string = "DataSources";

/**
 * DataService class, handling creation/updates
 * of the database, and exposing repositories.
 */
export class DataService {
    public DataSourceRepository: Repository<IDataSource, number>;
    public DataModelRepository: Repository<IDataModel, number>;
    public ChartConfigurationRepository: Repository<IChartConfiguration, number>;

    private db: IDBDatabase;

    constructor() {
        if (!this.isIndexedDBSupported()) {
            console.error("indexedDB is not supported in your browser");
            return;
        }
        console.info("indexedDB seems to be supported");
    }

    /**
     * Perform checks on the browser to see if indexeddb is supported.
     */
    private isIndexedDBSupported() {
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
    public initDatabase(dataBaseName, version: number): JQueryPromise<void> {
        var res = $.Deferred<void>();

        var initDbRequest = window.indexedDB.open(dataBaseName, version);

        initDbRequest.onsuccess = (event) => {
            this.db = initDbRequest.result;
            this.createRepos();
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

    /**
     * Create repositories.
     */
    private createRepos() {
        this.DataSourceRepository = new Repository<IDataSource, number>(this.db, DATASOURCES_STORE);
        this.DataModelRepository = new Repository<IDataModel, number>(this.db, DATAMODELS_STORE);
        this.ChartConfigurationRepository = new Repository<IChartConfiguration, number>(this.db, CHARTS_STORE);
    }

    /**
     * Handle database upgrade.
     * @param db {IDBDatabase} : the db to update.
     */
    private upgradeDatabase(db: IDBDatabase) {

        let dropCreate = (name: string) => {
            if (db.objectStoreNames.contains(name)) {
                db.deleteObjectStore(name);
            }
            var dataModelStore = db.createObjectStore(name, { autoIncrement: true, keyPath: "id" });
        }
        dropCreate(DATAMODELS_STORE);
        dropCreate(DATASOURCES_STORE);
        dropCreate(CHARTS_STORE);
        
        // TODO: create indexes where needed.
        // objectStore.createIndex("name", "name", { unique: false });
    }
}

export var dataService = new DataService();