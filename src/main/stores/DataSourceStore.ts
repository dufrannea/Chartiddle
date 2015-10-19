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
	callBackId : string; 
}

export var dataSourceStore = new DataSourceStore();

// all the actions that this store
// can handle.
dataSourceStore.callBackId = Dispatcher.register((action) => {
	switch (action.actionType) {
		case AppConstants.MODEL_LOADED:
			dataSources = <IDataSource[]>action.data;
			dataSourceStore.fireEvent(CHANGE)
			break;
		case AppConstants.ADD_FILE:
			let dataSource : IDataSource= {
				name : action.fileAction.file.name
			}
			let fileService = Container.fileService; 
			loadingFile = true;
			dataSourceStore.fireEvent(CHANGE);
			
			fileService
				.saveFileAsync(action.fileAction.file)
				.then((id)=>{
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
