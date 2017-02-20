export class ProxiedWorker<T> {
	public static  Load<T>(ctor : Function , moduleName : string) : Promise<T> {
		return new Promise<T>((resolve, reject)=>{
			const workerConstructor = require("worker-loader!../app/Worker");
			const worker = new workerConstructor();

			const messageBody = {
				action : "LOAD"
			};
			worker.postMessage(messageBody)
			worker.onmessage = (ev)=>{
				switch (ev.data) {
					case "LOAD_DONE":
						console.debug("worker has been loaded");
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
		for (let methodName of Object.getOwnPropertyNames(functionConstructor.prototype)){
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
				console.debug("received call done");
				queued[methodName](result);	
			}
		})
		return innerProxy;
	}
}