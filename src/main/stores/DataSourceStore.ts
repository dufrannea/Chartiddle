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

class DataSourceStore extends EventEmitter {
	getAll() : IDataSource[]{
		return dataSources;
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
			let dataService =Container.dataService; 
			
			dataService.DataSourceRepository
				.save(dataSource)
				.then(()=>{
					let fileItem : IFileItem = {
						id : dataSource.id,
						name : action.fileAction.file.name,
						dataStream : new BatchingProvider(new PapaLocalDataProvider(action.fileAction.file),100)
					};
					return dataService
						.FileRepository
						.save(fileItem)
				})
				.done(()=>{
					dataSources.push(dataSource);
					dataSourceStore.fireEvent(CHANGE);
				})
				.fail(()=>{
					alert("could not upload file")
				});
			break;
	}
});
