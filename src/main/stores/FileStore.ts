/// <reference path="../model/model.d.ts"/>
import {dispatcher as Dispatcher} from '../infrastructure/Dispatcher'
import {AppConstants} from '../infrastructure/AppConstants'
import {EventEmitter} from '../infrastructure/EventEmitter'
import {Container} from '../infrastructure/Container'
import {PapaLocalDataProvider} from '../dataproviders/PapaLocalDataProvider'
import {dataSourceStore as DataSourceStore} from './DataSourceStore'
const CHANGE = "CHANGE";

let dataSources : IDataSource[] = [];

class FileStore extends EventEmitter {
	getAllFiles() : IDataSource[]{
		return dataSources;
	}
	registerChangeListener(listener) {
		this.addEvent(CHANGE, listener);
	}
	
	public callBackId : string; 
}

// create a store singleton
export var fileStore = new FileStore();

// store id of callback
fileStore.callBackId = Dispatcher.register((action) => {
	switch (action.actionType) {
		case AppConstants.ADD_FILE:
			Dispatcher.waitFor([DataSourceStore.callBackId]);
			console.info("dataSource has been recorded")
			// 
		    // let file : IFileItem = {
			// 	id : 42,
			// 	name : action.fileAction.file.name,
			// 	dataStream : new PapaLocalDataProvider(action.fileAction.file)
			// }
			// 
		    // Container
			// 	.dataService
			// 	.FileRepository
			// 	.save(file).done()
			// dataSources.push({
			// 	id : Math.max.apply(null, dataSources.map(x=>x.id)) +1,
			// 	name : action.fileAction.file.name
			// });
			// fileStore.fireEvent(CHANGE)
			break;
	}
});

