/// <reference path="../../typings/tsd.d.ts"/>
import {FileRepository, IDataStream} from '../../main/services/FileRepository'
import $ = require('jquery');
import Papa = require('papaparse');

const DATABASE_NAME = "testdb2";
let success = false;
let version = 1;

let originalProvider = { 
	foreach : (success, done)=>{ 
		Papa.parse("1,2,3\n4,5,6\n7,8,9", {
			step : (result : PapaParse.ParseResult) => {
				success(result.data[0])
			},
			complete : ()=>{
				done();
			}
		});
}};

class BatchingProvider {
	constructor(dataProvider : IDataStream, size : number = 40){
		this.dataProvider = dataProvider;
		this.size = size;
	}
	private dataProvider : IDataStream;
	private size : number;
	public foreach(success, done){
		let batched = [];
		let n = 0;
		this.dataProvider.foreach((data)=>{
			batched.push(data);
			n++;
			if (n == this.size){
				success(batched);
				n=0;
				batched=[];
			}
		},()=>{
			if (n!=0){
				success(batched);
				done();
			}
		})
	}
}

let dataProvider = new BatchingProvider(originalProvider,1);

describe('DataService tests', () => {
	let db: IDBDatabase;
	
	/**
	 * Drop db before tests.
	 */
	beforeEach((done) => {
		let dropRequest = window.indexedDB.deleteDatabase(DATABASE_NAME)
		dropRequest.onsuccess = () => {
			console.info("*****dropdbsuccess")
			let createRequest = window.indexedDB.open(DATABASE_NAME);
			createRequest.onsuccess = (ev) => {
				db = createRequest.result
				done();
			}
			createRequest.onerror = (ev) => {
				fail();
				done();
			}
			createRequest.onblocked = (ev) => {
				console.error("creation of db is blocked")
				done();
			}
		};
		dropRequest.onblocked = (ev) => {
				console.error("drop of db is blocked")
				done();
			}
		dropRequest.onerror = (ev) => {
				console.error("drop of db is error")
				done();
			}
	});

	it('should init database', (done) => {
		console.info("basetest**********")
		let repo = new FileRepository(db);
		repo.save({
			dataStream: dataProvider,
			id: 1,
			name: "hello"
		}).always(()=>{
			repo.close();
			done();
		});
	});

	it('should read all data', (done) => {
		console.info("completetest**********")
		let repo = new FileRepository(db);
		let allData = [];
		repo.save({
			dataStream: dataProvider,
			id: 1,
			name: "hello"
		}).done(() => {
			repo.getAll(1).foreach((data) => {
				allData.push(data);
				console.info("reading", data);
			}, () => {
				expect(allData).toEqual([ [[ '1', '2', '3' ]], [[ '4', '5', '6' ]], [[ '7', '8', '9' ]] ] );
				console.info("soure read")
			})
		})
			.always(()=>{
				repo.close();
				done();
			});
	});

	/**
	 * Drop db after tests.
	 */
	afterAll((done) => {
		let dropdb = window.indexedDB.deleteDatabase(DATABASE_NAME);
		dropdb.onblocked = done;
		dropdb.onerror = done;
		dropdb.onsuccess = done;
	})
})