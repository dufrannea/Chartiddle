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

class ChartRendererStore extends EventEmitter {
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
		case AppConstants.SELECT_DATASOURCE:
			Dispatcher.waitFor([ApplicationStore.callBackId]);
			
			// get the data
		    let dataSource = Container
				.dataService
				.FileRepository
				.getAll(action
					.selectDataSourceAction
					.dataSource.id, 1);
			
			let allData = [];
			dataSource.foreach((data)=>{
				allData.push.apply(allData, data);
			},()=>{
				previewData = allData;
				chartRendererStore.fireEvent(CHANGE);
			})
			break;
	}
});
