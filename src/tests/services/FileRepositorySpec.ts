import {FileRepository} from '../../main/services/FileRepository'
import {BatchingProvider} from '../../main/dataproviders/BatchingProvider';
import {PapaLocalDataProvider} from '../../main/dataproviders/PapaLocalDataProvider';

import {ConnectionPool} from '../../main/services/ConnectionPool'

import Papa = require('papaparse');
import "es6-shim";

const DATABASE_NAME = "testdb2";
const PARSE_TEXT ="1,2,3\n4,5,6\n7,8,9";

let success = false;
let version = 1;

var blob = <File>new Blob([PARSE_TEXT],{type : 'text/html'});
let originalProvider = new PapaLocalDataProvider(blob,false);

let dataProvider = new BatchingProvider(originalProvider,1);

let pool = new ConnectionPool();

describe('FileRepositorySpec tests', () => {
	/**
	 * Drop db before tests.
	 */
	beforeEach((done) => {
		let dropRequest = window.indexedDB.deleteDatabase(DATABASE_NAME)
		dropRequest.onsuccess = () => {
			let createRequest = window.indexedDB.open(DATABASE_NAME);
			createRequest.onsuccess = (ev) => {
				pool.db = createRequest.result
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
		let repo = new FileRepository(pool,"TEST");
		repo.save({
			dataStream: dataProvider,
			id: 1,
			name: "hello"
		}).then(()=>{
			repo.close();
			done();
		},()=>{
			repo.close();
			done();
		});
	});

	it('should read all data', (done) => {
		let repo = new FileRepository(pool,"TEST");
		let allData = [];
		repo.save({
			dataStream: dataProvider,
			id: 1,
			name: "hello"
		}).then(() => {
			repo.getAsDataStream(1).foreach((data) => {
				allData.push(data);
			}, () => {
				expect(allData).toEqual([ [[ '1', '2', '3' ]], [[ '4', '5', '6' ]], [[ '7', '8', '9' ]] ] );
			})
		})
		.then(()=>{
			repo.close();
			done();
		},()=>{
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