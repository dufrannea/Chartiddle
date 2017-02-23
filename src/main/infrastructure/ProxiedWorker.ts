import {ObjectProxy} from "./ObjectProxy"

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