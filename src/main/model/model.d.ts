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

declare enum ChartType {
    BAR,
    SPLINE        
}

interface IChartConfiguration {
    // type of the chart
    // ie 'pie',
    type : ChartType;
    
    // rows of the chart
    columns : IHierarchy[];
    
    // columns of the chart
    rows : IHierarchy[];
    
    // measures of the chart
    measures : IMeasure[];
    
    // id of the model the chart
    // refers to.
    model_id : number;
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
    Measures? : IColumn[];
    drilldown?: string[];
    top?: number;
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

/**
 * Query execution result.
 */
interface IQueryResult {
    Rows: string[];
    Columns: string[];
    Values: number[][];
}

declare module "highcharts" {
    var a  : HighchartsStatic;
    export = a ;
}