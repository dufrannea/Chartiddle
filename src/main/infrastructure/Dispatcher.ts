import {Dispatcher} from 'flux';
import {AppConstants, ApplicationTabs} from '../actions/AppConstants'
import {IDropBoxFile, IMeasure, IQueryOptions} from "../model/model";

export interface IFileAction {
	file? : File;
	dropboxFile? : IDropBoxFile;
}

export interface IPreviewAction {
	// file to start preview for.
	file? : File;
	// data to preview when it is ready.
	previewData : any;
}

export interface ISelectDataSourceAction {
	dataSourceId : number;
}

export interface IUpdateChartRendererModelAction {
	addedColumn? : string;
	addedRow?: string;
	addedMeasure?:string;
	updatedMeasure? : IMeasure;
	queryOptions? : IQueryOptions;
}

export interface IActionType {
	actionType : AppConstants; 
	
	fileAction? : IFileAction;
	
	previewAction? : IPreviewAction;
	
	selectDataSourceAction? : ISelectDataSourceAction;
	
	updateChartRendererAction? : IUpdateChartRendererModelAction;
	// weakly typed data,
	// use with care.	
	data? : any;
}

export interface IRouteAction extends IActionType {
	routeActionType: string;
	routeData? : number | string;
}

// here create an AppDispatcher

export var dispatcher = new Dispatcher<IActionType>();