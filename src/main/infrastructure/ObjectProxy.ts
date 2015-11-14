/// <amd-dependency path="text!app/Worker.js"/>
// declare function URL(txt : string) : void;
declare var require : Require;

var workerTemplate = require('text!app/Worker.js');
// delcare
export class ProxiedWorker<T> {
	constructor(){
	}
	
	/**
	 * Loads.
	 */
	public static  Load<T>(ctor : Function , moduleName : string) : Promise<T> {
		return new Promise<T>((resolve, reject)=>{
			// let blob = new Blob([workerTemplate],{type : 'application/javascript'});
			// let worker = new Worker(URL.createObjectURL(blob));
			// IE 11 bug : when worker is created from blob
			// indexeddb is not available.
			let worker = new Worker("app/Worker.js");
			let currentRequireConfig = requirejs['s'].contexts._.config;
			let newRequireConfig = {
				paths : currentRequireConfig.paths
			}

			let requireJsBaseURI : string = requirejs['s'].head.baseURI;
			debugger;
			let messageBody = {
				action : "LOAD", 
				actionBody : {
					requireJsBase : requireJsBaseURI,
					requireJsPath : requireJsBaseURI+  /(?:\.\/)?(.*)/.exec(requirejs.toUrl("requireLib") + ".js")[1],
					requireConfig : newRequireConfig,
					moduleName : moduleName
				}
			};
			worker.postMessage(messageBody)
			worker.onmessage = (ev)=>{
				switch (ev.data) {
					case "LOAD_DONE":
						console.info("worker has been loaded");
						resolve(ObjectProxy.proxy<T>(<any>ctor, worker));
						break;
				}
			}
		})
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
				console.info("received call done");
				queued[methodName](result);	
			}
		})
		return innerProxy;
	}
}