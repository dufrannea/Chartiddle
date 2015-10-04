/// <reference path="../model/model.d.ts"/>

import {dispatcher as Dispatcher} from '../infrastructure/Dispatcher'
import {AppConstants} from '../infrastructure/AppConstants'
import {EventEmitter} from '../infrastructure/EventEmitter'

const CHANGE = "CHANGE";

let _todos = [{
			id : 1,
			name : "todo1",
			done :false
		},{
			id : 2,
			name : "todo2",
			done :false
		}];
		
class AppStore extends EventEmitter {
	getAll() : Todo[] {
		return _todos;
	}
	
	registerChangeListener(listener){
		this.addEvent(CHANGE, listener);
	}
}

// all the actions that this store
// can handle.
Dispatcher.register((action) => {
	switch (action.actionType){
		case AppConstants.TOGGLE_TODO_DONE :
			let todoToUpdate = _todos.filter(x=>x.id=== action.id)[0];
			todoToUpdate.done = !(todoToUpdate.done);
			appStore.fireEvent(CHANGE);
			break;
		case AppConstants.CREATE_TODO :
			let newTodo = {
				name : "new todo",
				id : Math.max.apply(null, _todos.map(x=>x.id)) +1,
				done : false				
			} 
			// can call the server here.
			_todos.push(newTodo);
			appStore.fireEvent(CHANGE);
			break;
	}
})

export var appStore = new AppStore();