/// <reference path="../../typings/tsd.d.ts"/>

import {Dispatcher} from 'flux';
import {AppConstants} from '../actions/AppConstants'

export interface IFileAction {
	file : File;
}

export interface IPreviewAction {
	// file to start preview for.
	file? : File;
	// data to preview when it is ready.
	previewData : any;
}

export interface IActionType {
	// operation to be done on todo.
	actionType : AppConstants; 
	
	fileAction? : IFileAction;
	
	previewAction? : IPreviewAction;
	
	// weakly typed data,
	// use with care.	
	data? : any;
}

// here create an AppDispatcher

export var dispatcher = new Dispatcher<IActionType>();