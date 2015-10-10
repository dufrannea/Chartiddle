import {DataService} from '../services/DataService'

/**
 * Singleton to hold services.
 */
export class Container {
	static _dataService : DataService;
	
	static get dataService() : DataService {
		return Container._dataService;
	}
	static set dataService(value : DataService) {
		Container._dataService = value;
	}	
}