/// <reference path="../../typings/tsd.d.ts"/>
import {FileRepository} from '../../main/services/FileRepository'
import {BatchingProvider} from '../../main/dataproviders/BatchingProvider';
import {PapaLocalDataProvider} from '../../main/dataproviders/PapaLocalDataProvider';

import {ConnectionPool} from '../../main/services/ConnectionPool'

import $ = require('jquery');
import Papa = require('papaparse');

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
			console.info("*****dropdbsuccess")
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
		console.info("basetest**********")
		let repo = new FileRepository(pool);
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
		let repo = new FileRepository(pool);
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