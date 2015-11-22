import {appActions as Actions} from '../actions/Actions'
import {dispatcher as Dispatcher} from '../infrastructure/Dispatcher'
import {AppConstants} from '../actions/AppConstants'
import crossroads = require('crossroads')
import hasher = require('hasher')

export module Router { 
	
	function setHashSilently(hash){
		hasher.changed.active = false; //disable changed signal
		hasher.setHash(hash); //set hash without dispatching changed signal
		hasher.changed.active = true; //re-enable signal
	}
	
	let startRewrite = () => {
		Dispatcher.register((action) => {
			switch (action.actionType) {
				case AppConstants.NAVIGATE_DATASOURCES_LIST:
					setHashSilently(`home`);
					break;
				case AppConstants.VIEW_CHART_FOR_DATASOURCE:
					let dataSourceId = action.selectDataSourceAction.dataSourceId;
					setHashSilently(`editor/${dataSourceId}`);
					break;
			}	
		});
	}
	
	export let setupRoutes = ()=>{
		var DEFAULT_HASH = 'home';
		
		//setup crossroads
		crossroads.addRoute('home', ()=>{
			Actions.navigateDataSourcesList();
		});
		
		crossroads.addRoute('editor/{sourceId}', (id)=>{
			let nId = parseInt(id);
			if (! (nId > 0)){
				return;
			} else {
				Actions.viewChartForDataSource(nId)
			}
		});
		crossroads.routed.add(console.log, console); //log all routes
		
		// sets a default value
		if(! hasher.getHash()){
			hasher.setHash(DEFAULT_HASH);
		}
		
		let parseHash = (newHash, oldHash) => {
			// second parameter of crossroads.parse() is the "defaultArguments" and should be an array
			// so we ignore the "oldHash" argument to avoid issues.
			crossroads.parse(newHash);
		}
		
		// hasher.initialized.add(parseHash); //parse initial hash
		hasher.changed.add(parseHash); //parse hash changes
		
		hasher.init(); //start listening for hash changes
		startRewrite();
	}
}