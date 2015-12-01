
/**
 * For some reason typings force the use of
 * a second argument by default in postmessage.
 */
declare function postMessage(arg : any);
interface IMessageEvent extends MessageEvent {
	data : IMessage;
}
interface IMessage {
	action : string,
	actionBody? : ILoadMessage,
	callActionBody? : ICallMessage
}
interface ILoadMessage {
	requireJsBase : string;
	requireJsPath : string;
	requireConfig : any;
	moduleName : string;
}

interface ICallMessage {
	arguments : any[],
	methodName : string
}

let proxied: any = null;
onmessage = ( ev : IMessageEvent ) =>{
	let {
		data = {
			action : null,
			actionBody : null
		}
	} = ev;
	
	switch (data.action) {
		// TODO : load should be a promise
		// 		and calls should wait for the promise
		//		to fullfill.
		// Note : load failure should fail
		//		  all waiting calls.
		case "LOAD" :
			console.debug("worker loading...");
			let {
				requireJsBase = null,
				requireJsPath = null,
				requireConfig = null,
				moduleName = ""
			} = data.actionBody;
			
			if (!requireJsPath){
				console.error("must provide a requirejs path");
			}

			requireConfig.baseUrl = requireJsBase;
			if (!self.hasOwnProperty("require")){
				importScripts(requireJsPath);
			}
			require.config(requireConfig);
			require([moduleName], (ns) => {
				ns.Load().then((value)=>{
					proxied = value;
					postMessage("LOAD_DONE");
				});
			})
			break;
		case "CALL":
			console.debug("worker calling method");
			let {
				methodName = null,
				arguments = []
			} = data.callActionBody;
			
			proxied[methodName].apply(proxied, arguments).then((r)=>{
				postMessage({
					action : "CALL_DONE",
					methodName : methodName,
					result : r
				});
			});
			break;
	}
}