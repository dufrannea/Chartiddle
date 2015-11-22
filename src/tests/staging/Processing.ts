/// <reference path="../../typings/tsd.d.ts"/>
/// <reference path="../../main/model/model.d.ts"/>

interface IProcessingItem {
	// unique key of fact
	key: string;
	
	// ordered list of attributes
	attributes: string[];
	
	// values for aggregated 
	// measures.
	aggregates: Map<string, number>;
}

/**
 * Computes a unique tuple structure 
 * (i.e. order of columns in tuple definition)
 * given a set of hierarchies.
 */
let TupleStructure = (hierarchies: IHierarchy[]): string[] => {
	let res = [];
	new Set<string>(
		hierarchies
			.map(h=> h.columns)
			.reduce((p, c) => p.concat(c), []))
		.forEach(x=> res.push(x));
	return res;
}

/**
 * Generates a tuple unique name
 * given a tuple structure.
 */
let GetUniqueName = (tuple: Object, ts: string[]) => {
	let name = "";
	for (var i = 0; i < ts.length; i++) {
		if (i != 0) {
			name += ".";
		}
		if (!tuple.hasOwnProperty(ts[i])) {
			name += "[All]";
		} else {
			let subname = "[" + tuple[ts[i]].trim() + "]";
			name += subname;
		}
	}
	return name;
}

/**
 * Will generate all the tuples a line matters for.
 * [A].[B] will need to update
 * 		- [All].[All]
 * 		- [A].[All]
 * 		- [All].[B]
 * 		- [A].[B]
 */
let GenerateAllTuples = (tuple, ts: any[]) => {
	let start = ts.map(x=> 0);
	let canupdate = true;
	let res = [];
	let nt1 = {};
	start.forEach((x, i) => {
		nt1[ts[i]] = (x === 0 ? tuple[ts[i]] : "All")
	})
	res.push(nt1);

	while (canupdate) {
		let i = 0;
		while (start[i] != 0 && i < start.length) {
			i++;
		}

		if (i === start.length) {
			canupdate = false;
			return res;
		}
		// i is the first index that can be bumped
		start[i] += 1;
		for (let j = 0; j < i; j++) {
			start[j] = 0;
		}
		var nt = {};
		start.forEach((x, i) => {
			nt[ts[i]] = (x === 0 ? tuple[ts[i]] : "All")
		})
		res.push(nt);
	}
	return null;
}

/**
 * Result of a processing
 */
interface IProcessingResult {
	/**
	 * Structure of all tuples.
	 */
	structure: string[];
	/**
	 * All the tuples with  
	 * measure values.
	 */
	data: Map<string, number>;

	hierarchies: Map<string, IWitChildren>;
}

interface IWitChildren {
	Children: Map<string, IWitChildren>;
}
interface IComputedHierarchy extends IWitChildren {
}

interface IHierarchyMember extends IWitChildren {
	/**
	 * UniqueName in the hierarchy
	 */
	FriendlyUniqueName?: string;
	/**
	 * UniqueName in the whole cube.
	 */
	UniqueName: string;
}

/**
 * Adds a tuple to a hierarchy.
 */
let addTupleToHierarchy = (columns: string[], hierarchy: IComputedHierarchy, tuple: Object) => {
	columns.reduce((p, c) => {
		let value = tuple[c];
		if (!p.Children.has(value)) {
			p.Children.set(value, {
				Children: new Map<string, IWitChildren>()
			});
		}
		return p.Children.get(tuple[c]);
	},
		(<IWitChildren>hierarchy)
	);
}

/**
 *  Will create the exhaustive list of tuples
 *  for the fact table.
 */
export let process = (hierarchies: IHierarchy[], measures: IMeasureDef[], dataSource: IDataProvider): Promise<IProcessingResult> => {
	let ts = TupleStructure(hierarchies);
	let simpleFacts = new Map<string, number>();
	let computedHierarchies = new Map<string, IComputedHierarchy>();
	// prefill hierarchies.
	hierarchies.forEach(h => {
		computedHierarchies.set(h.name, {
			Children: new Map<string, IWitChildren>()
		});
	});

	return new Promise<any>((resolve, reject) => {
		dataSource.foreach((line) => {
			// compute hierarchies
			hierarchies.forEach(h => {
				addTupleToHierarchy(h.columns, computedHierarchies.get(h.name), line);
			})
			
			// compute aggregations
			for (let tuple of GenerateAllTuples(line, ts)) {
				// now here tuple has the wrong format.
				
				let key = GetUniqueName(tuple, ts);
				if (simpleFacts.has(key)) {
					simpleFacts.set(key, simpleFacts.get(key) + 1);
				} else {
					simpleFacts.set(key, 1);
				}
			}
		}, () => {
			let result = {
				data: simpleFacts,
				structure: ts,
				hierarchies: computedHierarchies
			};
			// result.hierarchies.get(hierarchies[0].name).Children.forEach((value, index)=>{
			// 	console.info(index + " " + value.Children.size)
			// 	value.Children.forEach((v, i )=>{
			// 		console.info(`\t ${i} (${v.Children.size})`)
			// 	})
			// })
			resolve(result);
		});
	})
}

/**
 * Builds a tuple uniqueName from its values
 * for the columns of the hierarchy and the global
 * tuple structure.
 */
let getTupleUniqueNameForHierarchy = (hierarchyColumns: string[], ts: string[], values: string[]) : string=> {
	let colValues = new Map<string, string>();

	for (let index in hierarchyColumns) {
		let colName = hierarchyColumns[index]; // colName in the array
		let colValue = values[index]; // member value for this column.
		colValues.set(colName, colValue);
	}

	return ts
		.map(value=> {
			if (colValues.has(value)) {
				return colValues.get(value);
			}
			return "All";
		})
		.map(x=> `[${x}]`)
		.join(".");
}

export let query = (cube: IProcessingResult) => (cols: IHierarchy[], rows: IHierarchy[]): (string|number)[][] => {
	// build the tuples you need.
	let hierarchies = cols.map(x=> x).concat(rows);

	let values =  hierarchies
		.map(h=> {
			let hierarchyLevel1Tuples : string[] = [];
			// add every level1 members
			cube.hierarchies
				.get(h.name).Children
				.forEach((memberChildren, memberName) => {
					let tupleUName = getTupleUniqueNameForHierarchy(
						[h.columns[0]],
						cube.structure,
						[memberName]);
					hierarchyLevel1Tuples.push(tupleUName);
				});
			return hierarchyLevel1Tuples;
		})
		.reduce((p, c) => p.concat(c))
		.map(x=>{
		 	return [x,cube.data.get(x)];
		});
	
	return values;
}