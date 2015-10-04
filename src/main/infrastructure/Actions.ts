import {dispatcher as Dispatcher} from './Dispatcher'
import {AppConstants} from './AppConstants'

class AppActions {
	
	/// dispatch action to the store
	toggleTodoDone(id : number){
		Dispatcher.dispatch({
			actionType : AppConstants.TOGGLE_TODO_DONE,
			id : id
		});
	}
	
	/**
	 * Create a new todo
	 */
	createTodo(){
		Dispatcher.dispatch({
			actionType : AppConstants.CREATE_TODO
		});
	}
}

export var appActions = new AppActions();