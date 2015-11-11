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
			expect(result.Rows[0].members[0].name).toBe("1");
			
			expect(result.Columns.length).toBe(1);
			expect(result.Columns[0].members[0].name).toBe("1");
			
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
			expect(result.Rows[0].members[0].name).toBe("1");
			
			expect(result.Columns.length).toBe(1);
			expect(result.Columns[0].members[0].name).toBe("1");
			
			expect(result.Values.length).toBe(1);
			expect(result.Values[0].length).toBe(1);
			expect(result.Values[0][0]).toBe(4);
			done();
		}).catch(()=>{
			fail();
			done();
		});
	});
	
	it("should compute sum",(done)=>{
		let dataProvider : IDataProvider = {
			foreach : (stepcallback, done) =>{
				[	
					[
						[1,1,1],
						[1,1,-1],
						[1,1,1],
						[1,1,-1]
					].map(makeObj)
				].forEach( line =>{
					stepcallback(line)
				})
				done();
			}
		}
		let query : IQuery = {
			Columns : [{columns : ["col0"]}],
			Rows : [{columns : ["col1"]}],
			Measures : [
				{
					column : "col2",
					type : "sum"
				}
			]
		}

		processor.Query(query, dataProvider).then(result => {
			expect(result).toBeDefined();
			expect(result.Rows.length).toBe(1);
			expect(result.Rows[0].members[0].name).toBe("1");
			
			expect(result.Columns.length).toBe(1);
			expect(result.Columns[0].members[0].name).toBe("1");
			
			expect(result.Values.length).toBe(1);
			expect(result.Values[0].length).toBe(1);
			expect(result.Values[0][0]).toBe(0);
			done();
		}).catch(()=>{
			fail();
			done();
		});
	})
	
	it("should compute min",(done)=>{
		let dataProvider : IDataProvider = {
			foreach : (stepcallback, done) =>{
				[	
					[
						[1,1,-1],
						[1,1,-12],
						[1,1,1],
						[1,1,-7]
					].map(makeObj)
				].forEach( line =>{
					stepcallback(line)
				})
				done();
			}
		}
		let query : IQuery = {
			Columns : [{columns : ["col0"]}],
			Rows : [{columns : ["col1"]}],
			Measures : [
				{
					column : "col2",
					type : "min"
				}
			]
		}

		processor.Query(query, dataProvider).then(result => {
			expect(result).toBeDefined();
			expect(result.Rows.length).toBe(1);
			expect(result.Rows[0].members[0].name).toBe("1");
			
			expect(result.Columns.length).toBe(1);
			expect(result.Columns[0].members[0].name).toBe("1");
			
			expect(result.Values.length).toBe(1);
			expect(result.Values[0].length).toBe(1);
			expect(result.Values[0][0]).toBe(-12);
			done();
		}).catch(()=>{
			fail();
			done();
		});
	})
	
	it("should compute several measures",(done)=>{
		let dataProvider : IDataProvider = {
			foreach : (stepcallback, done) =>{
				[	
					[
						[1,1,-1],
						[1,1,-12],
						[1,1,1],
						[1,1,-7]
					].map(makeObj)
				].forEach( line =>{
					stepcallback(line)
				})
				done();
			}
		}
		let query : IQuery = {
			Columns : [{columns : ["col0"]}],
			Rows : [{columns : ["col1"]}],
			Measures : [
				{
					column : "col2",
					type : "min"
				},
				{
					column : "col2",
					type : "sum"
				}
			]
		}

		processor.Query(query, dataProvider).then(result => {
			expect(result).toBeDefined();
			expect(result.Rows.length).toBe(1);
			expect(result.Rows[0].members[0].name).toBe("1");
			
			// a column per measure
			expect(result.Columns.length).toBe(2);
			
			expect(result.Values.length).toBe(1);
			expect(result.Values[0].length).toBe(2);
			expect(result.Values[0][0]).toBe(-12);
			expect(result.Values[0][1]).toBe(-19);
			done();
		}).catch(()=>{
			fail();
			done();
		});
	})
})