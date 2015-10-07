/// <reference path="../model/model.d.ts"/>
import {dispatcher as Dispatcher} from '../infrastructure/Dispatcher'
import {AppConstants} from '../infrastructure/AppConstants'
import {EventEmitter} from '../infrastructure/EventEmitter'

const CHANGE = "CHANGE";
let files : File[] = [];

class FileStore extends EventEmitter {
	getAllFiles() : IDataSource[]{
		return [];
	}
	registerChangeListener(listener) {
		this.addEvent(CHANGE, listener);
	}
}

// all the actions that this store
// can handle.
Dispatcher.register((action) => {
	switch (action.actionType) {
		case AppConstants.ADDED_FILE:
			files.push(action.fileAction.file);
			fileStore.fireEvent(CHANGE)
			break;
	}
})

export var fileStore = new FileStore();