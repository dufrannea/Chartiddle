/// this file defines 
/// the domain of the application.

interface IDataSource {
    // name of the datasource, correspond to the name
    // of a datastore.
	name : string;
    
    // unique id 
    // of the datasource.
    id? : number;
}

// global configuration for the application
// store in "configuration" dataStore
interface IConfiguration {
    // all the datasources
    // for the given configuration
    dataSources : IDataSource[];
    
    // all the datamodels
    // for the given configuration
    dataModels : IDataModel[];
    
    // all the charts created
    charts : IChartConfiguration[];
}

interface IChartConfiguration {
    id? : number;
    // type of the chart
    // ie 'pie',
    type : number;
    
    // query tied to the chart.
    query : IQuery;
    
    // options of the chart.
    options : IQueryOptions;
    
    // thumbnails.
    results : IQueryResult;
    
    // id of the datasource the chart
    // refers to.
    datasource_id : number;
}


interface IDataModel {
    // hierarchies defined in the model
    hierarchies: IHierarchy[];

    // measures defined in the model
    measures: IMeasure[];
    
    // deprecated
    columns?: string[];
    
    // id of the datasource
    // the model is bound to
    datasource_id : number;
}

interface IHierarchy {
    name: string;
    columns: string[];
}

interface IMeasure {
    key : string;
    name: string;
    type: string;
}

interface IDataProvider {
    foreach: (stepCallback: (data: any) => void,
                completeCallback: () => void,
                bindTo?: any) => void;
}

/**
 * Simple model 
 * for a query.
 */
interface IQuery {
    Rows: IRow[];
    Columns: IColumn[];
    Measures? : IMeasureDef[];
    drilldown?: string[];
    top?: number;
}

interface IQueryOptions {
    // sort results 
    sort : boolean;
    // sort in ascending/descending
    sortOrder : number;
    // limit to n results
    limitTo: number;
}

/**
 * A row represented as a list
 * of columns in the original source.
 */
interface IRow {
    columns: string[];
}

/**
 * A column represented as a list
 * of columns in the original datasource.
 */
interface IColumn {
    columns: string[];
}

interface IMeasureDef {
    column : string;
    // type can be one of
    // count, sum, min, max
    type : string;
}

/**
 * Query execution result.
 */
interface IQueryResult {
    Rows: ITupleInfo[];
    Columns: ITupleInfo[];
    Values: number[][];
}

interface ITupleInfo{
    members : IMemberInfo[]
}

interface IMemberInfo {
    id : string;
    name : string;
}

declare module "highcharts" {
    var a  : HighchartsStatic;
    export = a ;
}

interface IDropBoxFile {
    bytes : number;
    link : string;
    name : string;
}

interface IChartDisplayOptions {
    chartType : string;
    stacked : boolean;
}