/// <reference path="../../typings/tsd.d.ts"/>

import {Dispatcher} from 'flux';
import {AppConstants, ApplicationTabs} from '../actions/AppConstants'

export interface IFileAction {
	file : File;
}

export interface IPreviewAction {
	// file to start preview for.
	file? : File;
	// data to preview when it is ready.
	previewData : any;
}

export interface ISelectDataSourceAction {
	dataSource : IDataSource;
}

export interface IActionType {
	// operation to be done on todo.
	actionType : AppConstants; 
	
	fileAction? : IFileAction;
	
	previewAction? : IPreviewAction;
	
	selectDataSourceAction? : ISelectDataSourceAction;
	// weakly typed data,
	// use with care.	
	data? : any;
}

// here create an AppDispatcher

export var dispatcher = new Dispatcher<IActionType>();