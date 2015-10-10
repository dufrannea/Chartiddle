export class ConnectionPool {
	private _db : IDBDatabase;
	
	public get db() : IDBDatabase {
		return this._db;
	}
	
	public set db(value : IDBDatabase) {
		this._db= value;
	}
}