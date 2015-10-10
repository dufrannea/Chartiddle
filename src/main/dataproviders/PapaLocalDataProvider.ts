/// <reference path="../../typings/tsd.d.ts"/>
/// <reference path="./model.d.ts"/>

import Papa = require('papaparse');

export class PapaLocalDataProvider implements IDataStream{
	private file : File;
	
	constructor(file : File){
		this.file = file;
	}
	
	foreach(success, done){ 
		Papa.parse(this.file, {
			step : (result : PapaParse.ParseResult) => {
				success(result.data[0])
			},
			complete : ()=>{
				done();
			}
		});
	}
}