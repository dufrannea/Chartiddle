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
	.initDatabase("Chartiddle")
	.fail(()=>{
		console.error("db updgrade failed, sorry.")
	})
	.then(() => dataService.DataSourceRepository.getAll())
	.then(value=> {
		Actions.modelLoaded(value);
	}); 

startReact();