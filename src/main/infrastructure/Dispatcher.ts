/// <reference path="../../typings/tsd.d.ts"/>

import {Dispatcher} from 'flux';
import {AppConstants} from '../actions/AppConstants'

export interface IFileAction {
	file : File;
}

export interface IActionType {
	// operation to be done on todo.
	actionType : AppConstants; 
	
	fileAction? : IFileAction;
	
	// weakly typed data,
	// use with care.	
	data? : any;
}

// here create an AppDispatcher

export var dispatcher = new Dispatcher<IActionType>();