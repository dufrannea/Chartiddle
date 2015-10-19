/// <reference path="../../typings/tsd.d.ts"/>
/// <reference path="../model/model.d.ts" />
/// <amd-dependency path="bootstrap"/>

import {startReact} from './main'
import {appActions as Actions} from '../actions/Actions'
import {FileService} from '../services/FileService'
import {ProxiedWorker} from "../infrastructure/ObjectProxy"
import {Container} from '../infrastructure/Container'

ProxiedWorker
	.Load<FileService>(FileService,"app/bootstrap")
	.then(fileService=> {
		Container.fileService = fileService;
		return fileService.getAllDataSourcesAsync()
	})
	.then(value => {
		Actions.modelLoaded(value);
	}); 

startReact();