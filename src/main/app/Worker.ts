import {Load} from "./bootstrap";

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
	callArguments : any[],
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
			
			Load().then((value)=>{
				proxied = value;
				postMessage("LOAD_DONE");
			});
			
			break;
		case "CALL":
			console.debug("worker calling method");
			let {
				methodName = null,
				callArguments = []
			} = data.callActionBody;
			
			proxied[methodName].apply(proxied, callArguments).then((r)=>{
				postMessage({
					action : "CALL_DONE",
					methodName : methodName,
					result : r
				});
			});
			break;
	}
}