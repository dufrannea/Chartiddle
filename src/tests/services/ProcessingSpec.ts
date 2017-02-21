import {dataSource} from './testFile'
import {process, query} from '../../main/services/Processing'
import "es6-shim";

describe("processing tests", () => {
	var data;
	
	beforeAll((done)=>{
		process([{
			name: "h1",
			columns: ["pos_seq", "t1_tok_min"]
		}], null, dataSource)
			.then((res) => {
				data = res;
				done()
			})
			.catch(()=>{
				fail();
				done();
			});
	});
	
	it("should query ", ()=>{
		let result = query(data)([{
			name: "h1",
			columns: ["pos_seq", "t1_tok_min"]
		}],[]);
	})
})