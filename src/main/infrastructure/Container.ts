import {ApplicationService} from '../services/ApplicationService'

/**
 * Singleton to hold services.
 */
export class Container {
	static _applicationService : ApplicationService;
	
	static get ApplicationService() : ApplicationService {
		return Container._applicationService;
	}
	static set ApplicationService(value : ApplicationService) {
		Container._applicationService = value;
	}
}