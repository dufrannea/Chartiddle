/// <reference path="../model/model.d.ts"/>
/// <reference path="../dataproviders/model.d.ts"/>

import {AppConstants} from '../actions/AppConstants'
import {dispatcher as Dispatcher} from '../infrastructure/Dispatcher'
import {EventEmitter} from '../infrastructure/EventEmitter'
import {Container} from '../infrastructure/Container'
import {PapaLocalDataProvider} from '../dataproviders/PapaLocalDataProvider'
import {BatchingProvider} from '../dataproviders/BatchingProvider'
const CHANGE = "CHANGE";

let dataSources : IDataSource[] = [];
let loadingFile = false;

// datasource for which we display the charts
let viewedDataSource : IDataSource = null;
// list of charts for current datasource
let chartList : IChartConfiguration[] = [];

class DataSourceStore extends EventEmitter {
	getAll() : IDataSource[]{
		return dataSources;
	}
	isLoading() : boolean {
		return loadingFile;
	}
	registerChangeListener(listener) {
		this.addEvent(CHANGE, listener);
	}
	getCharts() : IChartConfiguration[]{
		return chartList;
	}
	callBackId : string; 
}

export var dataSourceStore = new DataSourceStore();

// all the actions that this store
// can handle.
dataSourceStore.callBackId = Dispatcher.register((action) => {
	switch (action.actionType) {
		case AppConstants.SELECT_DATASOURCE:
			Container
				.ApplicationService
				.getAllChartsForDataSource(action.data.id)
				.then((configs)=>{
					chartList = configs;
					dataSourceStore.fireEvent(CHANGE);
				});
				break;
		case AppConstants.MODEL_LOADED:
			dataSources = <IDataSource[]>action.data;
			dataSourceStore.fireEvent(CHANGE)
			break;
		case AppConstants.DELETE_DATASOURCE:
			let sourceToRemove = action.selectDataSourceAction.dataSourceId;
			Container
				.ApplicationService
				.deleteDataSource(sourceToRemove)
				.then(()=>{
					dataSources = dataSources.filter(x=>x.id !== sourceToRemove)
				})
			break;	
		case AppConstants.ADD_FILE:
		    let name : string = "REMOTE";
			let fileService = Container.ApplicationService; 
			loadingFile = true;
			dataSourceStore.fireEvent(CHANGE);
			let saveAction : Promise<number>;
			let dataSource : IDataSource = null;
			
			if (action.fileAction.file){
				name = action.fileAction.file.name;
				dataSource= {
					name : name
				}
				
				saveAction = fileService
					.saveFileAsync(action.fileAction.file)
					
			} else if (action.fileAction.dropboxFile){
				name = action.fileAction.dropboxFile.name;
				dataSource = {
					name : name
				}
				
				saveAction = fileService
					.saveDropboxFileAsync(action.fileAction.dropboxFile)
			}
			saveAction.then((id)=>{
						loadingFile = false;
						dataSource.id = id;
						dataSources.push(dataSource);
						dataSourceStore.fireEvent(CHANGE);
					})
					.catch(()=>{
						alert("could not upload file")
					});
			break;
	}
});
