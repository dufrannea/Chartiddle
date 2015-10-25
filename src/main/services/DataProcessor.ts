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
            // all the rows we encounter
            // across lines.
            rowsSet = new Set<string>();

        let rowStructure    = this.TupleStructure(query.Rows),
            columnStructure = this.TupleStructure(query.Columns);
        
        let formatKey = (value) => {
                if (!value || value === "") {
                    return "UNKNOWN";
                }
                return value;
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
                    
                    if (!res.has(colKey)){
                        let newRowsValue = { 
                            count : 1,
                            rows : new Map<string,any>() 
                        };
                        newRowsValue.rows.set(rowKey,{
                            count : 1
                        }); 
                        res.set(colKey, newRowsValue);
                    } else {
                        let colData = res.get(colKey);
                        if (!colData.rows.has(rowKey)){
                            colData.rows.set(rowKey,{
                                count : 0
                            });
                        } 
                        colData.rows.get(rowKey).count += 1 ;
                        colData['count'] += 1;
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
    
                // filter by value
                // allColumns = allColumns.filter(function(x){return x.val < 500});
    
                let filteredColumns : string[] = allColumns.map(x =>  x.name);
    
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
                        let currRow  = res.get(colKey);
                        
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
