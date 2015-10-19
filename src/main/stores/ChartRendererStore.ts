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
}

export var chartRendererStore = new ChartRendererStore();

chartRendererStore.callBackId = Dispatcher.register((action) => {
	switch (action.actionType) {
		case AppConstants.DROP_COLUMN:
			selectedColumns.push(action.updateChartRendererAction.addedColumn);
			chartRendererStore.fireEvent(CHANGE);
			break;
		case AppConstants.DROP_ROW:
			selectedRows.push(action.updateChartRendererAction.addedRow);
			chartRendererStore.fireEvent(CHANGE);
			break;			
		case AppConstants.SELECT_DATASOURCE:
			Dispatcher.waitFor([ApplicationStore.callBackId]);
			
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
