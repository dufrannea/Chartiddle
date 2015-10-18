
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
		case "LOAD" :
			console.info("being asked to load...");
			let {
				requireJsPath = null,
				requireConfig = null,
				moduleName = ""
			} = data.actionBody;
			
			if (!requireJsPath){
				console.error("must provide a requirejs path");
			}
			
			// calling script 
			// main/ <-- baseUrl is "."
			//    - app/
			//        - startup.js <-- requirejs.toUrl('requireLib') returns './bower_components/requireLib' i.e. the 
			//						   path relative to the baseUrl.
			// 	  - workers/
			//        - worker.js  <-- worker will try to load
			
			// NOTE : actualPath is not correct here...
			// it should be 
			// <path from root to requireJs baseURL> + 
			// let actualPath =  /(?:\.\/)?(.*)/.exec(requireJsPath + ".js")[1];
			requireConfig.baseUrl = '../';
			importScripts(requireJsPath);
			require.config(requireConfig);
			require([moduleName], (ns) => {
				let FileRepository = ns.FileRepository;
				proxied =new FileRepository();
				postMessage("LOAD_DONE");
			})
			break;
		case "CALL":
			console.info("being asked to call");
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