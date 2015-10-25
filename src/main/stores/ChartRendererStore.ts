/// <reference path="../model/model.d.ts"/>
/// <reference path="../dataproviders/model.d.ts"/>

import {AppConstants} from '../actions/AppConstants'
import {dispatcher as Dispatcher} from '../infrastructure/Dispatcher'
import {EventEmitter} from '../infrastructure/EventEmitter'
import {Container} from '../infrastructure/Container'
import {PapaLocalDataProvider} from '../dataproviders/PapaLocalDataProvider'
import {BatchingProvider} from '../dataproviders/BatchingProvider'

import {applicationStore as ApplicationStore} from './ApplicationStore';
const CHANGE = "CHANGE";

let currentChartId = undefined;
let previewData = [];
let selectedRows = [];
let selectedColumns = [];
let selectedMeasures : string[] = [];
let queryResult : IQueryResult = null;
let dataSourceId : number = null;
let queryIsComputing : boolean = false;
let chartIsDisplaying : boolean = false;

class ChartRendererStore extends EventEmitter {
	getSelectedRows(){
		return selectedRows;
	}
	getSelectedColumns(){
		return selectedColumns;
	}
	registerChangeListener(listener) {
		this.addEvent(CHANGE, listener);
	}
	callBackId : string;
	getPreviewData(){
		return previewData;
	}
	getQueryResult(){
		return queryResult;
	}
	getSelectedMeasures(){
		return selectedMeasures;
	}
	/**
	 * Tells whether query
	 * is being processed.
	 */
	isQueryComputing(){
		return queryIsComputing;
	}
}

export var chartRendererStore = new ChartRendererStore();

let fireChange = ()=>{
	chartRendererStore.fireEvent(CHANGE);
}

let updateQueryResult = () => {
	let query : IQuery = {
		Rows : selectedRows.map(x=>{
			return {
				columns : [x]
			}
		}),
		Columns : selectedColumns.map(x=>{
			return {
				columns : [x]
			}
		}),
		Measures : [{
				column : selectedMeasures[0],
				type : "sum"
			}]
	}
	
	if (!selectedMeasures || selectedMeasures.length === 0){
		fireChange();
		return
	}
	queryIsComputing  = true;
	// fire change before
	// computing, to update 
	// selected columns/rows/measures lists.
	fireChange();
	
	return Container
		.fileService
		.Query(query, dataSourceId)
		.then((result)=>{
			queryResult = result;
			queryIsComputing = false;
			fireChange();
		});
}

chartRendererStore.callBackId = Dispatcher.register((action) => {
	switch (action.actionType) {
		case AppConstants.NAVIGATE_DATASOURCES_LIST:
			 currentChartId = undefined;
			 previewData = [];
			 selectedRows = [];
			 selectedColumns = [];
			 selectedMeasures = [];
			 queryResult  = null;
			 dataSourceId  = null;
			 queryIsComputing = false;
			 chartIsDisplaying  = false;
			 break;
		case AppConstants.DROP_COLUMN:
			selectedColumns.push(action.updateChartRendererAction.addedColumn);
			updateQueryResult()
			break;
		case AppConstants.DROP_ROW:
			selectedRows.push(action.updateChartRendererAction.addedRow);
			updateQueryResult()
			break;	
		case AppConstants.DROP_MEASURE:
			selectedMeasures.push(action.updateChartRendererAction.addedMeasure);
			updateQueryResult()
			break;
		case AppConstants.REMOVE_ROW:
			selectedRows = selectedRows.filter(x => x !=  action.updateChartRendererAction.addedRow)
			updateQueryResult()
			break;
		case AppConstants.REMOVE_COLUMN:
			selectedColumns = selectedColumns.filter(x => x !=  action.updateChartRendererAction.addedColumn)
			updateQueryResult()
			break;
		case AppConstants.REMOVE_MEASURE:
			selectedMeasures =selectedMeasures.filter(x => x !=  action.updateChartRendererAction.addedMeasure)
			updateQueryResult()
			break;
		case AppConstants.SELECT_DATASOURCE:
			Dispatcher.waitFor([ApplicationStore.callBackId]);
			dataSourceId = action.selectDataSourceAction.dataSource.id;
			// get the data
		    Container
				.fileService
				.getPreviewAsync(action
					.selectDataSourceAction
					.dataSource.id)
				.then((preview)=>{
					previewData = preview;
					chartRendererStore.fireEvent(CHANGE);
				});
			break;
	}
});
