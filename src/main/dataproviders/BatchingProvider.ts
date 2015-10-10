/// <reference path="model.d.ts"/>

export class BatchingProvider implements IDataStream {
	constructor(dataProvider : IDataStream, size : number = 40){
		this.dataProvider = dataProvider;
		this.size = size;
	}
	private dataProvider : IDataStream;
	private size : number;
	public foreach(success, done){
		let batched = [];
		let n = 0;
		this.dataProvider.foreach((data)=>{
			batched.push(data);
			n++;
			if (n == this.size){
				success(batched);
				n=0;
				batched=[];
			}
		},()=>{
			if (n!=0){
				success(batched);
				done();
			}
		})
	}
}