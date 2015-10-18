/// <reference path="../../typings/tsd.d.ts"/>
/// <reference path="../model/model.d.ts"/>

import {dispatcher as Dispatcher} from '../infrastructure/Dispatcher'
import {AppConstants, ApplicationTabs} from './AppConstants'

class AppActions {
	selectDataSource(dataSource : IDataSource) {
		Dispatcher.dispatch({
			actionType : AppConstants.SELECT_DATASOURCE,
			selectDataSourceAction : {
				dataSource: dataSource
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
	
	modelLoaded(dataSources : IDataSource[]) {
		Dispatcher.dispatch({
			actionType : AppConstants.MODEL_LOADED,
			data : dataSources
		})
	}
	
	dropRow(rowName : string){
		Dispatcher.dispatch({
			actionType : AppConstants.DROP_ROW,
			updateChartRendererAction : {
				addedRow : rowName
			}
		})
	}
	
	dropColumn(columnName : string){
		Dispatcher.dispatch({
			actionType : AppConstants.DROP_COLUMN,
			updateChartRendererAction : {
				addedColumn : columnName
			}
		})
	}
}

export var appActions = new AppActions();