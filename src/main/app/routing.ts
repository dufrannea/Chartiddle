import {appActions as Actions} from '../actions/Actions'
import {dispatcher as Dispatcher} from '../infrastructure/Dispatcher'
import crossroads = require('crossroads')
import hasher = require('hasher')

export module Router { 

	export let goHome = () => {
		hasher.setHash(`home`);
	}
	export let goDatasource = (id : number) => {
		hasher.setHash(`editor/${id}`);
	}
	export let goDataSourceList = () =>{
		hasher.setHash('datasources');	
	}
	
	export let setupRoutes = ()=>{
		var DEFAULT_HASH = 'home';
		
		crossroads.addRoute('home', ()=>{
			setTimeout(()=>Actions.navigateHome(),0);
		});
		
		crossroads.addRoute('datasources', ()=>{
			setTimeout(()=>Actions.navigateDataSourcesList(),0);
		});
		
		crossroads.addRoute('editor/{sourceId}', (id)=>{
			let nId = parseInt(id);
			if (! (nId > 0)){
				return;
			} else {
				setTimeout(()=>Actions.viewChartForDataSource(nId),0)
			}
		});
		crossroads.routed.add(console.log, console); //log all routes
		
		let parseHash = (newHash, oldHash) => {
			// second parameter of crossroads.parse() is the "defaultArguments" and should be an array
			// so we ignore the "oldHash" argument to avoid issues.
			crossroads.parse(newHash);
		}
		
		hasher.initialized.add(parseHash); //parse initial hash
		hasher.changed.add(parseHash); //parse hash changes
		
		hasher.init(); //start listening for hash changes
		
		if(! hasher.getHash()){
			hasher.setHash(DEFAULT_HASH);
		}
	}
}