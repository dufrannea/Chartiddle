/// <reference path="../../typings/tsd.d.ts"/>

import {Dispatcher} from 'flux';
import {AppConstants} from './AppConstants'

export interface IActionType {
	// operation to be done on todo.
	actionType : AppConstants; 
	// id of the todo to update
	id? : number;
	// used to update todo.
	name? : string;
}

// here create an AppDispatcher

export var dispatcher = new Dispatcher<IActionType>();