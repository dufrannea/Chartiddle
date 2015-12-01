/// <reference path="../../typings/tsd.d.ts"/>
/// <reference path="../model/model.d.ts" />

import {DbStart} from '../services/DbStart'
import {ApplicationService} from '../services/ApplicationService'
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
			Container.ApplicationService = new ApplicationService(
				dataService.DataSourceRepository, 
				dataService.FileRepository,
				dataService.ProcessingRepository,
				new DataProcessor(),
				dataService.ChartConfigurationRepository);
			return Container.ApplicationService;
		});
}