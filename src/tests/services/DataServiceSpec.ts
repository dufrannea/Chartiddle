import {DbStart} from '../../main/services/DbStart'
import {ConnectionPool} from '../../main/services/ConnectionPool'
import {IDataSource} from "../../main/model/model"
const DATABASE_NAME = "testdb";
let success = false;
let version = 1;

let pool = new ConnectionPool();
let dataService = new DbStart(pool);

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
				.then(()=>{
					success = true;
					done();
				},()=>{
					fail();
					done();
				})
	})
	
	it('should init database',()=>{
	    expect(success).toBe(true);
	});
	
	it('should return empty array when not data',(done)=>{
		dataService.DataSourceRepository.getAll()
		.then((dataSources)=>{
			expect(dataSources).toEqual([]);
			done();
		},()=>{
			fail();
			done();
		})
	});
	
	it('should set id when inserting',(done) => {
		let insertee : IDataSource= {
			name : "ergut"
		};
		
		dataService.DataSourceRepository.save(insertee)
		.then((result)=>{
			expect(insertee.id).toBeDefined();
			done();
		}, ()=>{
			fail();
			done()
		})
	});
	
	it('should update when item exists',(done)=>{
		let insertee : IDataSource= {
			name : "ergut"
		};
		
		dataService.DataSourceRepository.save(insertee)
		.then(()=>{
			return dataService.DataSourceRepository.save({
				name : "ergut2",
				id : insertee.id
			});
		})
		.then(()=> dataService.DataSourceRepository.get(insertee.id))
		.then((fetched) => {
			expect(fetched.name).toBe("ergut2");
			done();
		},()=>{
			fail();
			done();
		});
	});
	
	it('should delete item',(done) => {
		let insertee : IDataSource= {
			name : "ergut"
		};
		
		dataService.DataSourceRepository.save(insertee)
		.then(()=>dataService.DataSourceRepository.delete(insertee.id))
		.then(()=>dataService.DataModelRepository.getAll())
		.then((result)=>{
			expect(result.length).toBe(0);
			done();
		},()=>{
			fail();
			done();
		})
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