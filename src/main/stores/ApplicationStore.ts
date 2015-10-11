/// <reference path="../model/model.d.ts"/>
/// <reference path="../dataproviders/model.d.ts"/>

import {AppConstants} from '../actions/AppConstants'
import {dispatcher as Dispatcher} from '../infrastructure/Dispatcher'
import {EventEmitter} from '../infrastructure/EventEmitter'
import {Container} from '../infrastructure/Container'

const CHANGE = "CHANGE";

class ApplicationStore extends EventEmitter {
	registerChangeListener(listener) {
		this.addEvent(CHANGE, listener);
	}
	callBackId : string; 
}

export var applicationStore = new ApplicationStore();

// all the actions that this store
// can handle.
applicationStore.callBackId = Dispatcher.register((action) => {
	switch (action.actionType) {
		case AppConstants.MODEL_LOADED:
			break;
		case AppConstants.ADD_FILE:
			break;
	}
});
