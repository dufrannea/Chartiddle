/**
 * Flattens an array of arrays datastream 
 * to a simple array datastream.
 */
export class ReducerProvider<T> implements IDataStream<T>{
	private _dataProvider : IDataStream<T[]>;
	constructor(dataProvider : IDataStream<T[]>){
		this._dataProvider = dataProvider;
	}	
	public foreach(success, done){
		this._dataProvider.foreach((data)=>{
			data.forEach((v)=>success(v));			
		}, ()=>{
			done();
		})
	}
}