/// <reference path="../../typings/tsd.d.ts"/>
/// <reference path="../model/model.d.ts" />
/// <amd-dependency path="bootstrap"/>

import {startReact} from './main'
// import {dataSourceStore as DataSourceStore} from '../stores/DataSourceStore'
// import {appActions as Actions} from '../actions/Actions'
// import {DataService} from '../services/DataService'
// import {ConnectionPool} from '../services/ConnectionPool'
// import {Container} from '../infrastructure/Container'
// 
// let pool = new ConnectionPool();
// let dataService = new DataService(pool);
// Container.dataService = dataService;
// 
// dataService
// 	.initDatabase("Chartiddle")
// 	.fail(()=>{
// 		console.error("db updgrade failed, sorry.")
// 	})
// 	.then(() => dataService.DataSourceRepository.getAll())
// 	.then(value=> {
// 		Actions.modelLoaded(value);
// 	}); 

//startReact();
import {FileRepository} from "../services/FileRepository";


// should be loaded as 
// a blob.
let worker = new Worker(requirejs.toUrl('app/Worker')+".js");
let currentRequireConfig = requirejs['s'].contexts._.config;
let newRequireConfig = {
	paths : currentRequireConfig.paths
}
declare function URL(txt : string) : void;

let requireJsBaseURI : string = (new URL(requirejs['s'].head.baseURI)).pathname;

let messageBody = {
	action : "LOAD", 
	actionBody : {
		requireJsPath : requireJsBaseURI+ (requireJsBaseURI === "/" ? "" : "/") + /(?:\.\/)?(.*)/.exec(requirejs.toUrl("requireLib") + ".js")[1],
		requireConfig : newRequireConfig,
		moduleName : "services/FileRepository"
	}
};
worker.postMessage(messageBody)
worker.onmessage = (ev)=>{
	switch (ev.data) {
		case "LOAD_DONE":
			console.info("worker has been loaded");
			plugProxy();
			break;
	}
}



class ObjectProxy {
	static proxy<T>(functionConstructor : FunctionConstructor, w : Worker) : T {
		let innerProxy : T =<T>{};
		let queued : {
			[key : string] : Function
		} = {}
		for (var methodName in functionConstructor.prototype){
			if (typeof functionConstructor.prototype[methodName] === "function"){
				let innerMethodName = methodName;
				innerProxy[innerMethodName]=  ((innerMethodName)=> (...args) => {
					return new Promise(function(resolve, reject){
						queued[innerMethodName] = resolve.bind(this);
						w.postMessage({
							action : "CALL",
							callActionBody : {
								methodName: innerMethodName,
								arguments : args,
							}	
						});
					});
				})(methodName)
			}		
		}
		
		w.addEventListener("message", function(ev: MessageEvent){
			let  {
				action = null,
				methodName = null,
				result = null
			} = ev.data;
			if (action === "CALL_DONE"){
				queued[methodName](result);	
			}
		})
		
		return innerProxy;
	}
}
function plugProxy(){
	let blob = <File>new Blob(["1,2,3\n4,5,6\n7,8,9"],{type : 'text/html'});
	let proxy = ObjectProxy.proxy<FileRepository>(<any>FileRepository, worker);
	proxy.saveFile(42,blob).then(()=>{
		console.info("done darlign")
	});
}