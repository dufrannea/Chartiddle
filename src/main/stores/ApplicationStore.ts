/// <reference path="../model/model.d.ts"/>
/// <reference path="../dataproviders/model.d.ts"/>

import {AppConstants, ApplicationTabs} from '../actions/AppConstants'
import {dispatcher as Dispatcher} from '../infrastructure/Dispatcher'
import {EventEmitter} from '../infrastructure/EventEmitter'
import {Container} from '../infrastructure/Container'

const CHANGE = "CHANGE";

// default active tab.
let activeTab = ApplicationTabs.DATASOURCES_VIEW;
let activeDataSource : IDataSource= null;

class ApplicationStore extends EventEmitter {
	getActiveTab(){
		return activeTab;
	}
	registerChangeListener(listener) {
		this.addEvent(CHANGE, listener);
	}
	activeDataSource() :IDataSource {
		return activeDataSource;
	}
	callBackId : string; 
}

export var applicationStore = new ApplicationStore();

// all the actions that this store
// can handle.
applicationStore.callBackId = Dispatcher.register((action) => {
	switch (action.actionType) {
		case AppConstants.SELECT_DATASOURCE:
			activeDataSource = action.selectDataSourceAction.dataSource;
			activeTab = ApplicationTabs.CHART_VIEW;
			applicationStore.fireEvent(CHANGE);
			break;
	}
});
