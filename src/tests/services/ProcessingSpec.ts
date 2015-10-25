/// <reference path="../../typings/tsd.d.ts"/>
/// <reference path="../../main/model/model.d.ts"/>

import {dataSource} from './testFile'

interface IProcessingItem {
	// unique key of fact
	key : string;
	
	// ordered list of attributes
	attributes : string[];
	
	// values for aggregated 
	// measures.
	aggregates : Map<string,number>;
}

let TupleStructure = (hierarchies : IHierarchy[]) : string[] => {
	let res =  [];
	new Set<string>(
		hierarchies
			.map(h=>h.columns)
			.reduce((p,c)=>p.concat(c),[]))
			.forEach(x=>res.push(x));
	return res;
}

let GetUniqueName= (tuple : Object, ts : string[]) => {
	var name ="";
	for (var i = 0; i< ts.length; i++){
		if (i!=0){
				name += ".";	
		}
		if (!tuple.hasOwnProperty(ts[i])){
			name += "[UNKNOWN]";
		} else {
			var subname = "[" + tuple[ts[i]].trim() +"]";
			name += subname;
		}
	}
	return name;
}

let GenerateAllTuples = (tuple, ts : any[])=>{
	let start = ts.map(x=>0);
	let canupdate = true;
	let res = [];
	res.push(start.map((x,i)=>{
		return x===0 ? tuple[i] : "All"
	}));
	
	while(canupdate){
		let i = 0;
		while (start[i] != 0 && i < start.length){
			i++;
			console.info("search")
		}
		
		if (i === start.length){
			canupdate=false;
			return res;
		}
		// i is the first index that can be bumped
		start[i]+=1;
		for (let j = 0; j < i ; j++){
			start[j]=0;
		}
		let arr  = start.map((x,i)=>{
			return x===0 ? tuple[i] : "All"
		})
		console.info(arr);
		res.push(arr);
	}
	return null;
}

let process =  (hierarchies : IHierarchy[], measures : IMeasureDef[]) : Promise<void> => {
	let ts = TupleStructure(hierarchies);
	let simpleFacts = new Map<string, any>();
	
	return new Promise<void>((resolve, reject)=>{
		console.info("tests********************")
		dataSource.foreach((line)=>{
			let key = GetUniqueName(line, ts);
			
			// for (let transform of GenerateAllTuples())
			if (simpleFacts.has(key)){
				
			} else {
				
			}
		},()=>{
			console.info("****************************DONE")
			resolve();			
		});
	})
} 

describe("processing tests",()=>{
	it("should load data",()=>{
		// process([{
		// 	name : "h1",
		// 	columns : ["pos_seq","t1_tok_min"]
		// }],null).then(done)
		let allTuples = GenerateAllTuples(["a","b","c"],[1,1,1]);
		console.info(allTuples)
		for (let t of allTuples ){
			console.info(t)
		};
	})
})