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
}