/// <reference path="../../typings/tsd.d.ts"/>
/// <reference path="../dataproviders/model.d.ts"/>

import {Container} from '../infrastructure/Container'

interface IColumnData {
    // all the rows
    rows : Map<string, IRowData>;
    
    // account for all the measures you
    // want aggregated
    aggregates : Map<string, number>;
}

interface IRowData {
    // account for all the measures you
    // want aggregated
    aggregates : Map<string, number>;
}

const COUNT_MEASURE = "count";
let sumAggretator = (colName)=> (currValue, row) => {
        console.info(`in sum ${colName}`)
        console.info(currValue,row);
        return (currValue || 0) + parseFloat(row[colName])
}

let minAggregator = (colName)=> (currValue, row)=>{
        if (currValue){
            return Math.min(currValue, parseFloat(row[colName]))
        }
        return parseFloat(row[colName]);
}

let maxAggregator = (colName)=> (currValue, row)=>{
        if (currValue){
            return Math.max(currValue, parseFloat(row[colName]))
        }
        return parseFloat(row[colName]);
}
let countAggregator = ()=>(currValue, row)=> (currValue || 0)+1;
        
export class DataProcessor {
    /**
     * Responsible for parsing
     * all the data.
     */
    constructor(){
    }
    
    public Query(query: IQuery, dataProvider : IDataProvider): Promise<IQueryResult>{
        var filter;
        let res = new Map<string,IColumnData>(),
            // all the rows we encounter
            // across lines,some columns might not have
            // a value for each row!
            rowsSet = new Set<string>();

        let rowStructure    = this.TupleStructure(query.Rows),
            columnStructure = this.TupleStructure(query.Columns);
        
        let formatKey = (value) => {
                if (!value || value === "") {
                    return "UNKNOWN";
                }
                return value;
        }
        let measures = query.Measures || []
    
        let aggregators = measures.map(({column=null, type=null})=>{
            switch (type){
                case "count":
                    return {
                        func : countAggregator(),
                        type : "count"
                    };
                    break;
                case "sum":
                    return {
                        func : sumAggretator(column),
                        type : "sum"
                    }
                    break;
            }
        });
        
        if (aggregators.length == 0){
            aggregators.push({
                func : countAggregator(),
                type : "count"
            })
        }

        return new Promise<IQueryResult>((resolve,reject)=>{
            
            // for each page of data.
            dataProvider.foreach((dataLines : { [key : string] : any }[]) => {
                
                // for each line in the page
                // of data.
                dataLines.forEach(factRow => {
                    let colKey : string = "";
                    let rowKey : string = "";
                    if ( filter && !filter(factRow)){
                        return;
                    }

                    // compute keys for rows and columns
                    colKey = columnStructure
                                .map(x=>formatKey(factRow[x]))
                                .reduce((p,v)=>p+v,"");
                    rowKey = rowStructure
                                .map(x=>formatKey(factRow[x]))
                                .reduce((p,v)=>p+v,"");
                    
                    rowsSet.add(rowKey);
                    
                    // this hierarchical structure is probably not the right way of 
                    // doing it.
                    // consider using a single map, with a key that would be a tuple key.
                    // [a]  [b]  [m1]  -> 10
                    // [a]  [c]  [m2]  -> 11
                    // [a]  [m2]  -> 100
                    // this would be easily stored in an indexeddb with indexes!
                    if (!res.has(colKey)){
                        let colData : IColumnData = { 
                            rows : new Map<string,any>(), 
                            aggregates : new Map<string,number>()
                        };
                        colData.rows.set(rowKey,{
                            aggregates : new Map<string,number>()
                        }); 
                        aggregators.forEach(a=>{
                            colData.rows.get(rowKey).aggregates.set(a.type,a.func(null, factRow));
                            colData.aggregates.set(a.type,a.func(null, factRow));
                        })
                        res.set(colKey, colData);
                    } else {
                        let colData = res.get(colKey);
                        if (!colData.rows.has(rowKey)){
                            colData.rows.set(rowKey,{
                                aggregates : new Map<string,number>()
                            }); 
                        }
                        aggregators.forEach(a=>{
                            let newRowValue = a.func(colData.rows.get(rowKey).aggregates.get(a.type), factRow);
                            colData.rows.get(rowKey).aggregates.set(a.type,newRowValue);
                            let newColValue = a.func(colData.aggregates.get(a.type), factRow)
                            colData.aggregates.set(a.type, newColValue);
                        })
                    }
                })
            },
            () => {
                let allColumns  : any[] = [],
                    allRows : string[] = [];
                    
                res.forEach((value, index, o)=>{
                    allColumns.push(index);
                })

                rowsSet.forEach(rowName=>allRows.push(rowName))
    
                let values = [];
                for (let rowKey of allRows) {
                    let rowValuesList = [];	
                    for (let colKey of allColumns){	
                        let currRow  = res.get(colKey);
                        
                        if (currRow.rows.has(rowKey)){
                            rowValuesList.push(currRow.rows.get(rowKey).aggregates.get(aggregators[0].type));
                        } else {
                            rowValuesList.push(0); // is null
                        }
                    }
                    values.push(rowValuesList);
                }
                
                resolve({
                    Rows : allRows,
                    Columns : allColumns,
                    Values : values
                });
            })
        })
    }
    
    /**
     * Now done synchronously.
     * We can imagine all those tasks could
     * be performed by webworkers when they
     * are available.
     * NB: should do all columns in only one go.
     */
    computeHierarchies(h, data){
        var computedHierarchies = {}

        data.parse(function(data){
            var currData = data.data[0];

            for (var hIndex = 0; hIndex < h.length; hIndex += 1){
                var currentHierarchy = h[hIndex];
                var colNames = currentHierarchy.columns;
                var uniqueName = currentHierarchy.name;

                var root;
                if (computedHierarchies.hasOwnProperty(uniqueName)){
                    root = computedHierarchies[uniqueName];
                } else {
                    root = {};
                }
                var currDict = root;

                for (var j = 0; j < colNames.length; j++){
                    var colName = colNames[j];
                    
                    var currVal = currData[colName];
                    if (!currDict.hasOwnProperty(currVal)){
                        var newVal;
                        if (j === (colNames.length -1)){
                            newVal = undefined;
                        } else {
                            newVal = {}
                        }
                        currDict[currVal] = newVal;
                    }
                    currDict = currDict[currVal];
                }

                computedHierarchies[uniqueName] = root;
            }
        },function(){console.info(computedHierarchies)},this);

        //return computedHierarchies;
    }
    
    /**
     * Computes a unique tuple structure from 
     * hierarchies.
     * TODO : Does order matter here?
     */
    TupleStructure(hierarchies : IRow[] | IColumn[]) : string[] {
        let res =  [];
        new Set<string>(
            hierarchies
                .map(h=>h.columns)
                .reduce((p,c)=>p.concat(c)))
                .forEach(x=>res.push(x));
        return res;
    }

    /**
     * Builds a uniquename
     * for a tuple.
     */
    GetUniqueName(tuple, ts){
        var name ="";
        for (var i = 0; i< ts.length; i++){
            if (i!=0){
                    name += ".";	
            }
            if (!tuple.hasOwnProperty(ts[i])){
                name += "[]";
            } else {
                var subname = "[" + tuple[ts[i]]+"]";
                name += subname;
            }
        }
        return name;
    }

    /**
     * Should not care about hierarchies.
     * Or should it?
     * Yeah well, it should not.
     */
    Compute(hierarchies, data){

        // compute the structure of a tuple 
        // for all representations.
        var ts = this.TupleStructure(hierarchies);
        var tupleIndex = {};

        // TODO : remember which columns
        // have been processed to avoid reprocessing.

        // process every line in the input data
        for (var i = 0; i< data.length; i++) {
            // for every hierarchy
            for (var hIndex = 0; hIndex <hierarchies.length; hIndex++){
                var currentHierarchy = hierarchies[hIndex];
                var uniqueName = currentHierarchy.name;

                var currTuple = {}
                for (var colIndex = 0; colIndex < ts.length; colIndex++){
                    var colName = ts[colIndex];
                    currTuple[colName] = data[i][colName]
                }
                var tupleUniqueName = this.GetUniqueName(currTuple, ts);
                
                if (!tupleIndex.hasOwnProperty(tupleUniqueName)){
                    tupleIndex[tupleUniqueName] = 1;
                } else {
                    tupleIndex[tupleUniqueName] = tupleIndex[tupleUniqueName] + 1;
                }
            }
        }

        // now aggregate over.
        for (var i = 0; i< hierarchies.length; i++){

        }
        return tupleIndex;
    }
}
