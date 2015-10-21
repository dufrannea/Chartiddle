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
let selectedMeasures = [];
let queryResult : IQueryResult = null;
let dataSourceId : number = null;

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
}

export var chartRendererStore = new ChartRendererStore();
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
	}
	return Container
		.fileService
		.Query(query, dataSourceId)
		.then((result)=>{
			queryResult = result;
			chartRendererStore.fireEvent(CHANGE);
		});
}
chartRendererStore.callBackId = Dispatcher.register((action) => {
	switch (action.actionType) {
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
			selectedRows =selectedRows.filter(x => x !=  action.updateChartRendererAction.addedRow)
			updateQueryResult()
			break;
		case AppConstants.REMOVE_COLUMN:
			selectedColumns =selectedColumns.filter(x => x !=  action.updateChartRendererAction.addedColumn)
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
