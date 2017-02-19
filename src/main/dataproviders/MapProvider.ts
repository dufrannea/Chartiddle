export class MapProvider implements IDataStream<{UniqueName : string, Value : Object}> {
	private _data : Map<string,any>;
	constructor(data : Map<string,any>){
		this._data = data;
	}
	
	public foreach(success, done){
		this._data.forEach((value, index)=>{
			success({
				UniqueName : index,
				Value : value
			})
		});
		done();
	}
}