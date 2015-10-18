/// <reference path="../../typings/tsd.d.ts"/>
/// <reference path="../model/model.d.ts" />
/// <amd-dependency path="bootstrap"/>

import {startReact} from './main'
import {dataSourceStore as DataSourceStore} from '../stores/DataSourceStore'
import {appActions as Actions} from '../actions/Actions'
import {DataService} from '../services/DataService'
import {ConnectionPool} from '../services/ConnectionPool'
import {Container} from '../infrastructure/Container'

let pool = new ConnectionPool();
let dataService = new DataService(pool);
Container.dataService = dataService;

dataService
	.initDatabase("Chartiddle", 100)
	.catch(()=>{
		console.error("db updgrade failed, sorry.")
	})
	.then(() => dataService.DataSourceRepository.getAll())
	.then(value=> {
		Actions.modelLoaded(value);
	}); 

startReact();
// import {FileRepository} from "../services/FileRepository";
// import {ProxiedWorker} from "../infrastructure/ObjectProxy"
// 
// ProxiedWorker.Load<FileRepository>(FileRepository,"services/FileRepository").then(x=>{
// 	return x.saveFile(
// 		33,
// 		<File>new Blob(["1,2,3\n5,6,7"], {type : "text/html"})
// 	);
// }).then(()=>{
// 	console.info("file has been saved")
// });