interface IDataStream {
	foreach: (stepCallback: (data: any) => void,
	completeCallback: () => void,
	bindTo?: any) => void;
}
