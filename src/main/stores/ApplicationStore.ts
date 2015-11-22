/// <reference path="../model/model.d.ts"/>
/// <reference path="../dataproviders/model.d.ts"/>

import {AppConstants, ApplicationTabs} from '../actions/AppConstants'
import {dispatcher as Dispatcher} from '../infrastructure/Dispatcher'
import {EventEmitter} from '../infrastructure/EventEmitter'
import {Container} from '../infrastructure/Container'

const CHANGE = "CHANGE";

// default active tab.
let activeTab = ApplicationTabs.DATASOURCES_VIEW;
let activeDataSourceId : number = null;

class ApplicationStore extends EventEmitter {
	getActiveTab(){
		return activeTab;
	}
	registerChangeListener(listener) {
		this.addEvent(CHANGE, listener);
	}
	activeDataSourceId() :number {
		return activeDataSourceId;
	}
	callBackId : string; 
}

export var applicationStore = new ApplicationStore();

// all the actions that this store
// can handle.
applicationStore.callBackId = Dispatcher.register((action) => {
	switch (action.actionType) {
		case AppConstants.VIEW_CHART_FOR_DATASOURCE:
			activeDataSourceId = action.selectDataSourceAction.dataSourceId;
			activeTab = ApplicationTabs.CHART_VIEW;
			applicationStore.fireEvent(CHANGE);
			break;
		case AppConstants.NAVIGATE_DATASOURCES_LIST:
			activeDataSourceId = null;
			activeTab = ApplicationTabs.DATASOURCES_VIEW;
			applicationStore.fireEvent(CHANGE);
			break;
	}
});
