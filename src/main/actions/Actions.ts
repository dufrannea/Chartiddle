/// <reference path="../../typings/tsd.d.ts"/>
/// <reference path="../model/model.d.ts"/>

import {dispatcher as Dispatcher} from '../infrastructure/Dispatcher'
import {AppConstants, ApplicationTabs} from './AppConstants'

class AppActions {
	/**
	 * Select a datasource to 
	 * go and play with it.
	 */
	selectDataSource(dataSource : IDataSource) {
		Dispatcher.dispatch({
			actionType : AppConstants.SELECT_DATASOURCE,
			selectDataSourceAction : {
				dataSource: dataSource
			}
		})
	}
	
	/**
	 * Back to the datasources list.
	 */
	navigateDataSourcesList(){
		Dispatcher.dispatch({
			actionType : AppConstants.NAVIGATE_DATASOURCES_LIST
		})
	}
	
	/**
	 * Add a file to indexeddb.
	 */
	addFile(f : File){
		Dispatcher.dispatch({
			actionType : AppConstants.ADD_FILE,
			fileAction : {
				file : f 
			}
		});
	}
	
	/**
	 * Add a file to indexeddb.
	 */
	addFileFromURL(file : IDropBoxFile){
		Dispatcher.dispatch({
			actionType : AppConstants.ADD_FILE,
			fileAction : {
				dropboxFile : file 
			}
		});
	}
	
	/**
	 * Model has been loaded,
	 * application is ready.
	 */
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
	
	dropMeasure(columnName : string){
		Dispatcher.dispatch({
			actionType : AppConstants.DROP_MEASURE,
			updateChartRendererAction : {
				addedMeasure : columnName
			}
		})
	}
	
	removeRow(rowName : string){
		Dispatcher.dispatch({
			actionType : AppConstants.REMOVE_ROW,
			updateChartRendererAction : {
				addedRow : rowName
			}
		})
	}
	
	removeColumn(columnName : string){
		Dispatcher.dispatch({
			actionType : AppConstants.REMOVE_COLUMN,
			updateChartRendererAction : {
				addedColumn : columnName
			}
		})
	}
	
	removeMeasure(columnName : string){
		Dispatcher.dispatch({
			actionType : AppConstants.REMOVE_MEASURE,
			updateChartRendererAction : {
				addedMeasure : columnName
			}
		})
	}
	
	updateMeasure(measure: IMeasure){
		Dispatcher.dispatch({
			actionType:AppConstants.UPDATE_MEASURE,
			updateChartRendererAction : {
				updatedMeasure : measure
			}
		})
	}
	
	updateQueryOption(queryOptions : IQueryOptions){
		Dispatcher.dispatch({
			actionType:AppConstants.UPDATE_QUERY_OPTIONS,
			updateChartRendererAction : {
				queryOptions : queryOptions
			}
		})
	}
}

export var appActions = new AppActions();