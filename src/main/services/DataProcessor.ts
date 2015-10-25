/// <reference path="../../typings/tsd.d.ts"/>
/// <reference path="../dataproviders/model.d.ts"/>

import {Container} from '../infrastructure/Container'

interface IColumnData {
    // all the rows
    rows : Map<string, any>;
    
    // account for all the measures you
    // want aggregated
    [measureKey : string] : any;
}

export class DataProcessor {
    /**
     * Responsible for parsing
     * all the data.
     */
    constructor(){
    }
    
    public Query(query: IQuery, dataProvider : IDataProvider): Promise<IQueryResult>{
        var filter;
        // if (query.drilldown){
        //     filter = (function(column, value){
        //         return function(data){
        //             return data[column] === value;
        //         }
        //     })("pos_seq", query.drilldown[0]);
        //     query.Columns[0] = { columns: ['t1_tok_min'] };
        // }

        let res = new Map<string,IColumnData>(),
            rowsSet = new Set<string>();

        let rowStructure = this.TupleStructure(query.Rows);
        let columnStructure = this.TupleStructure(query.Columns);
        return new Promise<IQueryResult>((resolve,reject)=>{
            dataProvider.foreach((dataLines : { [key : string] : any }[]) => {
                dataLines.forEach(data => {
                    let colKey  = "";
                    let rowKey = "";
                    let currRowData = {};
                    let currColData = {};
                    let factRow = data;
        
                    if ( filter && !filter(factRow)){
                        return;
                    }
        
                    let formatKey = (value) => {
                        if (!value || value === "") {
                            return "UNKNOWN";
                        }
                        return value;
                    }
        
                    // compute a column key 
                    // as [2015].[march]
                    for (let colName of columnStructure) {
                        let localKey = formatKey(factRow[colName]);
                        colKey += localKey;
                        currColData[colName] = localKey;
                    }
                    
                    // compute a row key 
                    // as [2015].[march]
                    for (let rowName of rowStructure) {
                        let localKey = formatKey(factRow[rowName]);
                        rowKey += localKey;
                        currRowData[rowName] = localKey;
                    }
                    
                    rowsSet.add(rowKey);
                    
                    if (!res.has(colKey)){
                        let newRowsValue = { 
                            member : currColData, 
                            count : 1, 
                            rows : new Map<string,any>() 
                        };
                        newRowsValue.rows.set(rowKey,{
                            member : currRowData,
                            count : 1
                        }); 
                        res.set(colKey, newRowsValue);
                    } else {
                        if (!res.get(colKey).rows.has(rowKey)){
                            res.get(colKey).rows.set(rowKey,{
                                member : currRowData,
                                count : 1
                            });
                            res.get(colKey)['count'] += 1;
                        } else {
                            res.get(colKey).rows.get(rowKey).count += 1 ;
                            res.get(colKey)['count'] += 1;
                        }
                    }
                })
            },
            () => {
                let allColumns  : any[] = []
                let allRows : string[] = [];
                res.forEach((value, index, o)=>{
                    allColumns.push({ name : index, val : value['count']})
                })
                // for (var j in res){
                //     
                // }
                allColumns.sort((x,y) => {
                    return y.val - x.val;
                });
                
                console.info(allColumns)
    
                // filter by value
                // allColumns = allColumns.filter(function(x){return x.val < 500});
    
                let filteredColumns : string[]= allColumns.map(x =>  x.name);
    
                // var unfiltered = allColumns;
                // allColumns = []
                // 
                // // here filter the number of results. Math.min(unfiltered.length, 10)
                // for (var i = 0; i< unfiltered.length;i++){
                //     allColumns.push(unfiltered[i]);
                // }

                rowsSet.forEach(rowName=>allRows.push(rowName))
    
                let values = [];
                
                for (let rowKey of allRows) {
                    let rowList = [];	
                    for (let colKey of filteredColumns){	
                        let  currRow  = res.get(colKey);
                        
                        if (currRow.rows.has(rowKey)){
                            rowList.push(currRow.rows.get(rowKey).count);
                        } else {
                            rowList.push(0);
                        }
                    }
                    values.push(rowList);
                }
                
                resolve({
                    Rows : allRows,
                    Columns : filteredColumns,
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
     */
    TupleStructure(hierarchies) : string[] {
        var struct = new Set<string>();
        hierarchies.forEach(hierarchy => {
                var cols = hierarchy.columns;
                cols.forEach(colName=>{
                    struct.add(colName);
                });
            }
        )
        var res = []
        struct.forEach(colName => res.push(colName))
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
