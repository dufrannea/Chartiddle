/// <reference path="../../typings/tsd.d.ts"/>
/// <reference path="./model.d.ts"/>

import Papa = require('papaparse');

export class PapaLocalDataProvider implements IDataStream{
	private file : File;
	private preview : number;
	private header : boolean;
	
	constructor(
		file : File,
		header : boolean = true,
		preview : number = 0){
		this.file = file;
		this.header = header;
		this.preview =preview;
	}
	
	foreach(success, done){ 
		Papa.parse(this.file, {
			header : this.header,
			preview : this.preview,
			step : (result : PapaParse.ParseResult) => {
				success(result.data[0])
			},
			complete : ()=>{
				done();
			}
		});
	}
	
	static createFromURL(url : string) : Promise<PapaLocalDataProvider> {
		return new Promise<PapaLocalDataProvider>((resolve, reject)=>{
			var oReq = new XMLHttpRequest();
			oReq.open("GET", url, true);
			oReq.responseType = "blob";
			oReq.onload = function(oEvent) {
				resolve(new PapaLocalDataProvider(<File>oReq.response));
			};
			oReq.onerror = (e)=>{
				console.error(e);
				reject();
			}
			oReq.send();
		})
	}
}