/// <reference path="../model/model.d.ts"/>
/// <reference path="../dataproviders/model.d.ts"/>

import {EventEmitter} from '../infrastructure/EventEmitter'
import {dispatcher as Dispatcher, IRouteAction} from '../infrastructure/Dispatcher'
import {RouteConstants} from '../actions/RouteConstants'
import {Router} from '../app/routing';

const CHANGE = "CHANGE";

class RouteStore extends EventEmitter {
	registerChangeListener(listener) {
		this.addEvent(CHANGE, listener);
	}
	callBackId : string; 
}

export var routeStore = new RouteStore();

routeStore.callBackId = Dispatcher.register((action) => {
	let {routeActionType, routeData} = <IRouteAction>action;
	
	switch (routeActionType) {
		case RouteConstants.NAVIGATE_HOME:
			Router.goHome();
			break;
		case RouteConstants.NAVIGATE_DATASOURCES_LIST:
		    Router.goDataSourceList();
			break;
		case RouteConstants.NAVIGATE_DATASOURCE:
			Router.goDatasource(<number>routeData);
			break;
	}	
});