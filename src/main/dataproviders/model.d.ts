interface IDataStream<T> {
	foreach: (stepCallback: (data: T) => void,
	completeCallback: () => void,
	bindTo?: any) => void;
}
interface IFileItem {
	id: number;
	name: string;
	dataStream?: IDataStream<any>;
}