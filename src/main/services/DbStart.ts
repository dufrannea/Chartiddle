import {Repository} from './Repository'
import {ConnectionPool} from './ConnectionPool'
import {FileRepository} from './FileRepository'
import {IDataModel, IDataSource, IChartConfiguration} from "../model/model";

declare var window: Window;
const CHARTS_STORE: string = "Charts";
const PROCESSING_STORE: string = "Processing";
const DATAMODELS_STORE: string = "DataModels";
const DATASOURCES_STORE: string = "DataSources";

/**
 * DataService class, handling creation/updates
 * of the database, and exposing repositories.
 */
export class DbStart {
    public DataSourceRepository: Repository<IDataSource, number>;
    public DataModelRepository: Repository<IDataModel, number>;
    public ChartConfigurationRepository: Repository<IChartConfiguration, number>;
    public FileRepository : FileRepository;
    public ProcessingRepository : FileRepository;
    
    private pool : ConnectionPool;
    private indexedDB  :IDBFactory;
    
    constructor(pool : ConnectionPool) {
        if (!this.isIndexedDBSupported()) {
            console.error("indexedDB is not supported in your browser");
            return;
        }
        this.pool = pool;
        console.debug("indexedDB seems to be supported");
    }

    /**
     * Perform checks on the browser to see if indexeddb is supported.
     */
    private isIndexedDBSupported() {
        let global = self || window;
        
        (<any>global).indexedDB = global.indexedDB || global['mozIndexedDB'] || global['webkitIndexedDB'] || global['msIndexedDB'];
        global['IDBTransaction'] = global['IDBTransaction'] || global['webkitIDBTransaction'] || global['msIDBTransaction'];
        global['IDBKeyRange'] = global['IDBKeyRange'] || global['webkitIDBKeyRange'] || global['msIDBKeyRange']

        if (!global.indexedDB) {
            return false;
        }
        this.indexedDB = global.indexedDB;
        return true;
    }

    /**
     * Initializes the database.
     * @param dataBaseName {string} : the name of the  
     *        database to initialize.
     */
    public initDatabase(dataBaseName, version?: number): Promise<void> {
        return new Promise<void>((resolve,reject)=>{
            let initDbRequest : IDBOpenDBRequest;
            if (version){
                initDbRequest = this.indexedDB.open(dataBaseName, version); 
            } else {
                initDbRequest = this.indexedDB.open(dataBaseName);
            }
            initDbRequest.onsuccess = (event) => {
                this.pool.db = initDbRequest.result;
                this.createRepos();
                resolve();
            }
    
            initDbRequest.onerror = (event) => {
                console.error("Database error: " + event.target['errorCode']);
                reject();
            }
    
            initDbRequest.onupgradeneeded = (event) => {
                this.upgradeDatabase(event.target['result']);
            };
        })
    }

    /**
     * Create repositories.
     */
    private createRepos() {
        this.DataSourceRepository = new Repository<IDataSource, number>(this.pool, DATASOURCES_STORE);
        this.DataModelRepository = new Repository<IDataModel, number>(this.pool, DATAMODELS_STORE);
        this.ChartConfigurationRepository = new Repository<IChartConfiguration, number>(this.pool, CHARTS_STORE);
        this.FileRepository = new FileRepository(this.pool,"FILE");
        this.ProcessingRepository = new FileRepository(this.pool,"PROCESS");
    }

    /**
     * Handle database upgrade.
     * @param db {IDBDatabase} : the db to update.
     */
    private upgradeDatabase(db: IDBDatabase) {
        let dropCreate = (name: string, autoIncrement = true, keyPath = "id") => {
            if (!db.objectStoreNames.contains(name)) {
                var dataModelStore = db.createObjectStore(name, { autoIncrement: true, keyPath: "id" });
            }
        }
        dropCreate(DATAMODELS_STORE);
        dropCreate(DATASOURCES_STORE);
        dropCreate(CHARTS_STORE);
    }
}