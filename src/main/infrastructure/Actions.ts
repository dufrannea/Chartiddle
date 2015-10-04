import {dispatcher as Dispatcher} from './Dispatcher'
import {AppConstants} from './AppConstants'

class AppActions {
	
	deleteAllDone(){
		Dispatcher.dispatch({
			actionType : AppConstants.DELETE_ALL_DONE
		});
	}
	updateTodoName(id : number, name :string){
		Dispatcher.dispatch({
			actionType : AppConstants.UPDATE_TODO_NAME,
			id : id,
			name : name
		});
	}
	/// dispatch action to the store
	toggleTodoDone(id : number){
		Dispatcher.dispatch({
			actionType : AppConstants.TOGGLE_TODO_DONE,
			id : id
		});
	}
	
	deleteTodo(id:number){
		Dispatcher.dispatch({
			actionType : AppConstants.DELETE_TODO,
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