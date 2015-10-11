/// <reference path="../../typings/tsd.d.ts"/>
/// <reference path="../model/model.d.ts"/>

import $ = require('jquery');
import {Repository} from './Repository'
import {ConnectionPool} from './ConnectionPool'
import {FileRepository} from './FileRepository'

declare var window: Window;
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
    public FileRepository : FileRepository;
    
    private pool : ConnectionPool;
    
    constructor(pool : ConnectionPool) {
        if (!this.isIndexedDBSupported()) {
            console.error("indexedDB is not supported in your browser");
            return;
        }
        this.pool = pool;
        console.info("indexedDB seems to be supported");
    }

    /**
     * Perform checks on the browser to see if indexeddb is supported.
     */
    private isIndexedDBSupported() {
        window.indexedDB = window.indexedDB || window['mozIndexedDB'] || window['webkitIndexedDB'] || window['msIndexedDB'];
        window['IDBTransaction'] = window['IDBTransaction'] || window['webkitIDBTransaction'] || window['msIDBTransaction'];
        window['IDBKeyRange'] = window['IDBKeyRange'] || window['webkitIDBKeyRange'] || window['msIDBKeyRange']

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
    public initDatabase(dataBaseName, version?: number): JQueryPromise<void> {
        var res = $.Deferred<void>();
        
        let initDbRequest : IDBOpenDBRequest;
        if (version){
            initDbRequest = window.indexedDB.open(dataBaseName, version); 
        } else {
            initDbRequest = window.indexedDB.open(dataBaseName);
        }

        initDbRequest.onsuccess = (event) => {
            this.pool.db = initDbRequest.result;
            this.createRepos();
            res.resolve();
        }

        initDbRequest.onerror = (event) => {
            console.error("Database error: " + event.target['errorCode']);
            res.reject();
        }

        initDbRequest.onupgradeneeded = (event) => {
            this.upgradeDatabase(event.target['result']);
        };

        return res.promise();
    }

    /**
     * Create repositories.
     */
    private createRepos() {
        this.DataSourceRepository = new Repository<IDataSource, number>(this.pool, DATASOURCES_STORE);
        this.DataModelRepository = new Repository<IDataModel, number>(this.pool, DATAMODELS_STORE);
        this.ChartConfigurationRepository = new Repository<IChartConfiguration, number>(this.pool, CHARTS_STORE);
        this.FileRepository = new FileRepository(this.pool);
    }

    /**
     * Handle database upgrade.
     * @param db {IDBDatabase} : the db to update.
     */
    private upgradeDatabase(db: IDBDatabase) {

        let dropCreate = (name: string) => {
            if (!db.objectStoreNames.contains(name)) {
                var dataModelStore = db.createObjectStore(name, { autoIncrement: true, keyPath: "id" });
                // db.deleteObjectStore(name);
            }
        }
        dropCreate(DATAMODELS_STORE);
        dropCreate(DATASOURCES_STORE);
        dropCreate(CHARTS_STORE);
        
        // TODO: create indexes where needed.
        // objectStore.createIndex("name", "name", { unique: false });
    }
}