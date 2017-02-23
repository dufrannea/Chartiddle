/**
 * Groups data before streaming.
 */
export class BatchingProvider<T> implements IDataStream<T[]> {
	constructor(dataProvider : IDataStream<T>, size : number = 40){
		this.dataProvider = dataProvider;
		this.size = size;
	}
	private dataProvider : IDataStream<T>;
	private size : number;
	public foreach(success : (value : T[]) => void , done) {
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