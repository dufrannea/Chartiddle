/// <reference path="../../typings/tsd.d.ts"/>
/// <reference path="../model/model.d.ts" />

import {DbStart} from '../services/DbStart'
import {FileService} from '../services/FileService'
import {ConnectionPool} from '../services/ConnectionPool'
import {DataProcessor} from '../services/DataProcessor'
import {Container} from '../infrastructure/Container'
import {ProxiedWorker} from "../infrastructure/ObjectProxy"


let pool = new ConnectionPool();
let dataService = new DbStart(pool);

export function Load(){
	return dataService
		.initDatabase("Chartiddle")
		.catch(()=>{
			console.error("db updgrade failed, sorry.")
		})
		.then(()=>{
			Container.fileService = new FileService(
				dataService.DataSourceRepository, 
				dataService.FileRepository,
				new DataProcessor(),
				dataService.ChartConfigurationRepository);
			return Container.fileService;
		});
}