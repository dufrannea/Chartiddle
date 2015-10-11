/// <reference path="../../typings/tsd.d.ts"/>
/// <reference path="../model/model.d.ts"/>

import {dispatcher as Dispatcher} from '../infrastructure/Dispatcher'
import {AppConstants, ApplicationTabs} from './AppConstants'

class AppActions {
	goToTab(tab : ApplicationTabs) {
		Dispatcher.dispatch({
			actionType : AppConstants.NAVIGATE,
			navigateAction : {
				tab : tab
			}
		})
	}
	addFile(f : File){
		Dispatcher.dispatch({
			actionType : AppConstants.ADD_FILE,
			fileAction : {
				file : f 
			}
		});
	}
	
	previewFile(f : File){
		Dispatcher.dispatch({
			actionType : AppConstants.PREVIEW_FILE,
			fileAction : {
				file : f 
			}
		});
	}
	
	previewFileReady(){
		Dispatcher.dispatch({
			actionType : AppConstants.PREVIEW_FILE_READY,
		});
	}
	
	modelLoaded(dataSources : IDataSource[]) {
		Dispatcher.dispatch({
			actionType : AppConstants.MODEL_LOADED,
			data : dataSources
		})
	}
}

export var appActions = new AppActions();