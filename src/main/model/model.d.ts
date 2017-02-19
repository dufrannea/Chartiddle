/// this file defines 
/// the domain of the application.

export interface IDataSource {
    // name of the datasource, correspond to the name
    // of a datastore.
	name : string;
    
    // unique id 
    // of the datasource.
    id? : number;
}

// global configuration for the application
// store in "configuration" dataStore
export interface IConfiguration {
    // all the datasources
    // for the given configuration
    dataSources : IDataSource[];
    
    // all the datamodels
    // for the given configuration
    dataModels : IDataModel[];
    
    // all the charts created
    charts : IChartConfiguration[];
}

export interface IChartConfiguration {
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


export interface IDataModel {
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

export interface IHierarchy {
    name: string;
    columns: string[];
}

export interface IMeasure {
    key : string;
    name: string;
    type: string;
}

export interface IDataProvider {
    foreach: (stepCallback: (data: any) => void,
                completeCallback: () => void,
                bindTo?: any) => void;
}

/**
 * Simple model 
 * for a query.
 */
export interface IQuery {
    Rows: IRow[];
    Columns: IColumn[];
    Measures? : IMeasureDef[];
    drilldown?: string[];
    top?: number;
}

export interface IQueryOptions {
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
export interface IRow {
    columns: string[];
}

/**
 * A column represented as a list
 * of columns in the original datasource.
 */
export interface IColumn {
    columns: string[];
}

export interface IMeasureDef {
    column : string;
    // type can be one of
    // count, sum, min, max
    type : string;
}

/**
 * Query execution result.
 */
export interface IQueryResult {
    Rows: ITupleInfo[];
    Columns: ITupleInfo[];
    Values: number[][];
}

export interface ITupleInfo{
    members : IMemberInfo[]
}

export interface IMemberInfo {
    id : string;
    name : string;
}

export interface IDropBoxFile {
    bytes : number;
    link : string;
    name : string;
}

export interface IChartDisplayOptions {
    chartType : string;
    stacked : boolean;
}