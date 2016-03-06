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
let selectedRows : { key : string }[] = [];
let selectedColumns : { key : string }[] = [];
let selectedMeasures : IMeasure[] = [];
let queryResult : IQueryResult = null;
let dataSourceId : number = null;
let queryIsComputing : boolean = false;
let chartIsDisplaying : boolean = false;
let queryOptions : IQueryOptions = {
	sort : false,
	sortOrder : 1,
	limitTo : 0
}
let getQuery = () => {
	return <IQuery>{
		Rows : selectedRows.map(x=>{
			return {
				columns : [x.key]
			}
		}),
		Columns : selectedColumns.map(x=>{
			return {
				columns : [x.key]
			}
		}),
		Measures : selectedMeasures.map(x=>{
				return {
					column : x.key,
					type : x.type
				};
			})
	}
}

let chartDisplayOptions = {
    stacked: false,
    chartType : "column"
}

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
	getQueryOptions(){
		return queryOptions;
	}
    getChartDisplayOptions(){
        return chartDisplayOptions;
    }
	getChartConfiguration() : IChartConfiguration{
		return {
			datasource_id : dataSourceId,
			options: queryOptions,
			query : getQuery(),
			type : 0,
			results : queryResult
		}
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
	if (!selectedMeasures || selectedMeasures.length === 0){
		fireChange();
		return
	}
	let query : IQuery = getQuery();
	queryIsComputing  = true;
	// fire change before
	// computing, to update 
	// selected columns/rows/measures lists.
	fireChange();
	
	return Container
		.ApplicationService
		.Query(query, dataSourceId, queryOptions)
		.then((result)=>{
			queryResult = result;
			queryIsComputing = false;
			fireChange();
		});
}

chartRendererStore.callBackId = Dispatcher.register((action) => {
	switch (action.actionType) {
        case AppConstants.CHANGE_CHARTDISPLAY_OPTIONS:
            chartDisplayOptions = action.data;
            fireChange();
            break;
		case AppConstants.SAVE_CHART:
			Container
				.ApplicationService
				.saveChart(action.data)
				.then(()=>{
					fireChange();
				});
				break;
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
			selectedColumns.push({ key : action.updateChartRendererAction.addedColumn});
			updateQueryResult()
			break;
		case AppConstants.DROP_ROW:
			selectedRows.push({
				key : action.updateChartRendererAction.addedRow
			});
			updateQueryResult()
			break;	
		case AppConstants.DROP_MEASURE:
			selectedMeasures.push({ 
				key : action.updateChartRendererAction.addedMeasure,
				type : "sum",
				name : action.updateChartRendererAction.addedMeasure
			});
			updateQueryResult()
			break;
		case AppConstants.REMOVE_ROW:
			selectedRows = selectedRows.filter(x => x.key !=  action.updateChartRendererAction.addedRow)
			updateQueryResult()
			break;
		case AppConstants.REMOVE_COLUMN:
			selectedColumns = selectedColumns.filter(x => x.key !=  action.updateChartRendererAction.addedColumn)
			updateQueryResult()
			break;
		case AppConstants.REMOVE_MEASURE:
			selectedMeasures =selectedMeasures.filter(x => x.key !=  action.updateChartRendererAction.addedMeasure)
			updateQueryResult()
			break;
		case AppConstants.VIEW_CHART_FOR_DATASOURCE:
			Dispatcher.waitFor([ApplicationStore.callBackId]);
			dataSourceId = action.selectDataSourceAction.dataSourceId;
			queryOptions = {
				sort : false,
				sortOrder : 1,
				limitTo : 0
			};
			// get the data
		    Container
				.ApplicationService
				.getPreviewAsync(dataSourceId)
				.then((preview)=>{
					previewData = preview;
					chartRendererStore.fireEvent(CHANGE);
				});
			break;
		case AppConstants.UPDATE_MEASURE : 
			let updater = action.updateChartRendererAction.updatedMeasure;
			let updatee = selectedMeasures.filter((m)=>{
				return m.key === updater.key;
			})[0];
			updatee.type = updater.type;
			fireChange();
			updateQueryResult();
			break;
		case AppConstants.UPDATE_QUERY_OPTIONS:
			queryOptions = action.updateChartRendererAction.queryOptions;
			fireChange();
			updateQueryResult();
			break;
	}
});
