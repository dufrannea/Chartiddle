import {dispatcher as Dispatcher} from './Dispatcher'
import {AppConstants} from './AppConstants'

class AppActions {
	addFile(f : File){
		Dispatcher.dispatch({
			actionType : AppConstants.ADDED_FILE,
			fileAction : {
				file : f 
			}
		});
	}
}

export var appActions = new AppActions();