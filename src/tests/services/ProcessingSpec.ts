/// <reference path="../../typings/tsd.d.ts"/>
/// <reference path="../../main/model/model.d.ts"/>

import {dataSource} from './testFile'
import {process, query} from '../staging/Processing'
describe("processing tests", () => {
	var data;
	
	beforeAll((done)=>{
		process([{
			name: "h1",
			columns: ["pos_seq", "t1_tok_min"]
		}], null, dataSource)
			.then((res) => {
				console.info("**************DONE")
				data = res;
				done()
			})
			.catch(()=>{
				fail();
				done();
			});
	});
	
	// it("should load data", (done) => {
	// });
	
	it("should query ", ()=>{
		let result = query(data)([{
			name: "h1",
			columns: ["pos_seq", "t1_tok_min"]
		}],[]);
		console.info(result);
	})
})