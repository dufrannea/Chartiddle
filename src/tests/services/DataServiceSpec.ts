/// <reference path="../../typings/tsd.d.ts"/>
import {dataService as DataService} from '../../main/services/DataService'
import $ = require('jquery');

const DATABASE_NAME = "testdb";
	let success = false;
	let version = 1;
describe('DataService tests', ()=>{
	beforeAll((done)=>{
		let dropRequest = window.indexedDB.deleteDatabase(DATABASE_NAME)
		dropRequest.onsuccess = ()=>{done()};
	});
	
	beforeEach((done)=>{
		version += 1;
		success = false;
		DataService
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
	
	it('should query datasources',(done)=>{
		DataService.getAllDataSources()
		.done((dataSources)=>{
			expect(dataSources).toEqual([]);
		})
		.fail(fail)
		.always(done)
	});
	
	it('should insert datasource',(done) => {
		DataService.insertDataSource({
			name : "ergut",
			id : 1
		})
		.pipe(()=> DataService.getAllDataSources())
		.done((result)=>{
				expect(result.length).toBe(1);
		})
		.fail(fail)
		.always(done)
	});
	afterAll(()=>{
		window.indexedDB.deleteDatabase(DATABASE_NAME);
	})
})