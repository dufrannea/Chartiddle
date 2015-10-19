import {DataProcessor} from '../../main/services/DataProcessor'

/**
 * Helper function to create datasets.
 */
let makeObj = (data : any[])=>{
	let result = {};
	for (var index in data){
		result["col"+index] = data[index];
	}
	return result;
}
		
describe("DataProcessor tests",()=>{
	let processor = new DataProcessor();
	let query : IQuery = {
		Columns : [{columns : ["col1"]}],
		Rows : [{columns : ["col2"]}]
	}
	it("should process single line datasource",(done)=>{
		let dataProvider : IDataProvider = {
			foreach : (stepcallback, done) =>{
				[[makeObj([1,1,1])]].forEach( line =>{
					stepcallback(line)
				})
				done();
			}
		}

		processor.Query(query, dataProvider).then(result => {
			expect(result).toBeDefined();
			expect(result.Rows.length).toBe(1);
			expect(result.Rows[0]).toBe("1");
			
			expect(result.Columns.length).toBe(1);
			expect(result.Columns[0]).toBe("1");
			
			expect(result.Values.length).toBe(1);
			expect(result.Values[0].length).toBe(1);
			expect(result.Values[0][0]).toBe(1);
			done();
		}).catch(()=>{
			fail();
			done();
		});
	});
	
	it("should process more complicated  datasource",(done)=>{

		let dataProvider : IDataProvider = {
			foreach : (stepcallback, done) =>{
				[[
					[1,1,1],
					[1,1,1],
					[1,1,1],
					[1,1,1]
				].map(makeObj)]
				.forEach( line =>{
					stepcallback(line)
				})
				done();
			}
		}

		processor.Query(query, dataProvider).then(result => {
			expect(result).toBeDefined();
			expect(result.Rows.length).toBe(1);
			expect(result.Rows[0]).toBe("1");
			
			expect(result.Columns.length).toBe(1);
			expect(result.Columns[0]).toBe("1");
			
			expect(result.Values.length).toBe(1);
			expect(result.Values[0].length).toBe(1);
			expect(result.Values[0][0]).toBe(4);
			done();
		}).catch(()=>{
			fail();
			done();
		});
	})
})