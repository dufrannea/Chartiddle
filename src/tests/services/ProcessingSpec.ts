/// <reference path="../../typings/tsd.d.ts"/>
/// <reference path="../../main/model/model.d.ts"/>

import {dataSource} from './testFile'
// let fs = require('fs')

// fs.read('')
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
	let nt1={};
	start.forEach((x,i)=>{
		nt1[ts[i]] = ( x===0 ? tuple[ts[i]] : "All")
	})
	res.push(nt1);
	
	while (canupdate){
		let i = 0;
		while (start[i] != 0 && i < start.length){
			i++;
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
		var nt={};
		start.forEach((x,i)=>{
			nt[ts[i]] = ( x===0 ? tuple[ts[i]] : "All")
		})
		res.push(nt);
	}
	return null;
}

let process =  (hierarchies : IHierarchy[], measures : IMeasureDef[]) : Promise<any> => {
	let ts = TupleStructure(hierarchies);
	let simpleFacts = new Map<string, any>();
	
	return new Promise<any>((resolve, reject)=>{
		dataSource.foreach((line)=>{
			for (let tuple of GenerateAllTuples(line,ts)){
				// now here tuple has the wrong format.
				
				let key = GetUniqueName(tuple, ts);
				if (simpleFacts.has(key)){
					simpleFacts.set(key,simpleFacts.get(key) +1);					
				} else {
					simpleFacts.set(key,1);
				}
			}
		},()=>{
			simpleFacts.forEach((a,b)=>{
				// if (b.indexOf("All")!=-1){
				// 	console.info(a,b);		
				// }
			})
			resolve(simpleFacts);			
		});
	})
} 

describe("processing tests",()=>{
	it("should load data",(done)=>{
	process([{
		name : "h1",
			columns : ["pos_seq","t1_tok_min"]
	}],null)
	.then((res)=>{
		console.info("**************DONE")
			done()
	});
	})
})