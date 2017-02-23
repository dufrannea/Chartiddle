export class ObjectProxy {
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
								callArguments : args,
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