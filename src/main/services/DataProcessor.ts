/// <reference path="../../typings/tsd.d.ts"/>
/// <reference path="../dataproviders/model.d.ts"/>

import {Container} from '../infrastructure/Container'

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

        var res = {},
            rowsMap = {},
            allRows: string[] = []

        var rowStructure = this.TupleStructure(query.Rows);
        var columnStructure = this.TupleStructure(query.Columns);
        return new Promise<IQueryResult>((resolve,reject)=>{
            dataProvider.foreach((dataLines : { [key : string] : any }[]) => {
                dataLines.forEach(data => {
                    var colKey  = "";
                    var rowKey = "";
                    var currRowData = {};
                    var currColData = {};
                    var currData = data;
        
                    if ( filter && !filter(currData)){
                        return;
                    }
        
                    let formatKey = (value) => {
                        if (!value || value === "") {
                            return "UNKNOWN";
                        }
                        return value;
                    }
        
                    // compute key
                    for (var keyIndex in columnStructure) {
                        var localKey = formatKey(currData[columnStructure[keyIndex]]);
                        colKey += localKey;
                        currColData[columnStructure[keyIndex]] = localKey;
                    }
        
                    for (var keyIndex in rowStructure) {
                        var localKey = formatKey(currData[rowStructure[keyIndex]]);
                        rowKey += localKey;
                        currRowData[rowStructure[keyIndex]] = localKey;
                    }
                    
                    if (!rowsMap.hasOwnProperty(rowKey)){
                        rowsMap[rowKey] = undefined;
                    }
        
                    if (!res.hasOwnProperty(colKey)){
                        res[colKey] = { member : currColData, count : 1, rows : {} }
                        res[colKey].rows[rowKey] = {
                            member : currRowData,
                            count : 1
                        } 
                    } else {
                        if (!res[colKey].rows.hasOwnProperty(rowKey)){
                            res[colKey].rows[rowKey] = {
                                member : currRowData,
                                count : 1
                            } 	
                            res[colKey].count += 1;
                        } else {
                            res[colKey].rows[rowKey].count += 1 ;
                            res[colKey].count += 1;
                        }
                    }
                })
            },
            () => {
                var allColumns  : any[] = []
                for (var j in res){
                    allColumns.push({ name : j, val : res[j].count })
                }
                allColumns.sort(function(x,y){
                    return y.val - x.val;
                });
    
                // filter by value
                allColumns = allColumns.filter(function(x){return x.val < 500});
    
                allColumns = allColumns.map(function(x){return x.name});
    
                var unfiltered = allColumns;
                allColumns = []
                for (var i = 0; i<Math.min(unfiltered.length, 10);i++){
                    allColumns.push(unfiltered[i]);
                }
    
    
                for (var member in rowsMap) {
                    allRows.push(member);
                }
    
                var values = [];
    
                
                for (var rowKeyIndex in allRows) {
                    var rowKey = allRows[rowKeyIndex];
                    var rowList = [];	
                    for (var colKeyIndex in allColumns){	
                        var colKey = allColumns[colKeyIndex]
                        var currRow  = res[colKey];
                        
                        if (currRow.rows.hasOwnProperty(rowKey)){
                            rowList.push(currRow.rows[rowKey].count);
                        } else {
                            rowList.push(0);
                        }
                    }
                    values.push(rowList);
                }
                resolve({Rows : allRows, Columns : allColumns, Values : values});
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
    private computeHierarchies(h, data){
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
    private TupleStructure(hierarchies){
        var struct = {}
        hierarchies.forEach(function(h){
                var cols = h.columns;
                cols.forEach(function(colName){
                    if (!struct.hasOwnProperty(colName)){
                        struct[colName] = undefined;
                    }
                });
            }
        )
        var res = []
        for (var j in struct){
            res.push(j);
        }
        return res;
    }

    /**
     * Builds a uniquename
     * for a tuple.
     */
    private GetUniqueName(tuple, ts){
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
    private Compute(hierarchies, data){

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
