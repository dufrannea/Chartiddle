/// <reference path="../../typings/tsd.d.ts"/>
import {DataService} from '../../main/services/DataService'
import {ConnectionPool} from '../../main/services/ConnectionPool'
import $ = require('jquery');

const DATABASE_NAME = "testdb";
let success = false;
let version = 1;

let pool = new ConnectionPool();
let dataService = new DataService(pool);

describe('DataService tests', ()=>{
	/**
	 * Drop db before tests.
	 */
	beforeAll((done)=>{
		let dropRequest = window.indexedDB.deleteDatabase(DATABASE_NAME)
		dropRequest.onsuccess = ()=>{done()};
	});
	
	/**
	 * Inits db before each test.
	 */
	beforeEach((done)=>{
		version += 1;
		success = false;
		dataService
				.initDatabase(DATABASE_NAME, 1)
				.done(()=>{
					success = true;
				})
				.fail(fail)
				.always(done)
	})
	
	it('should init database',()=>{
	    expect(success).toBe(true);
	});
	
	it('should return empty array when not data',(done)=>{
		dataService.DataSourceRepository.getAll()
		.done((dataSources)=>{
			expect(dataSources).toEqual([]);
		})
		.fail(fail)
		.always(done)
	});
	
	it('should set id when inserting',(done) => {
		let insertee : IDataSource= {
			name : "ergut"
		};
		
		dataService.DataSourceRepository.save(insertee)
		.done((result)=>{
			expect(insertee.id).toBeDefined();
		})
		.fail(fail)
		.always(done)
	});
	
	it('should update when item exists',(done)=>{
		let insertee : IDataSource= {
			name : "ergut"
		};
		
		dataService.DataSourceRepository.save(insertee)
		.pipe(()=>{
			return dataService.DataSourceRepository.save({
				name : "ergut2",
				id : insertee.id
			});
		})
		.pipe(()=> dataService.DataSourceRepository.get(insertee.id))
		.done((fetched) => {
			expect(fetched.name).toBe("ergut2");
		})
		.fail(fail)
		.always(done)		
	});
	
	it('should delete item',(done) => {
		let insertee : IDataSource= {
			name : "ergut"
		};
		
		dataService.DataSourceRepository.save(insertee)
		.pipe(()=>dataService.DataSourceRepository.delete(insertee.id))
		.pipe(()=>dataService.DataModelRepository.getAll())
		.done((result)=>{
			expect(result.length).toBe(0);
		})
		.fail(fail)
		.always(done);
	})
	
	/**
	 * Drop db after tests.
	 */
	afterAll((done)=>{
		let dropdb = window.indexedDB.deleteDatabase(DATABASE_NAME);
		dropdb.onblocked = done;
		dropdb.onerror = done;
		dropdb.onsuccess = done;
	})
})