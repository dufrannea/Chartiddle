import {FileService} from '../services/FileService'

/**
 * Singleton to hold services.
 */
export class Container {
	static _fileService : FileService;
	
	static get fileService() : FileService {
		return Container._fileService;
	}
	static set fileService(value : FileService) {
		Container._fileService = value;
	}
}