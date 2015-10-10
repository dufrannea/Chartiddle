interface IDataStream {
	foreach: (stepCallback: (data: any) => void,
	completeCallback: () => void,
	bindTo?: any) => void;
}
interface IFileItem {
	id: number;
	name: string;
	dataStream?: IDataStream;
}