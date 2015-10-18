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


declare module "jquery-hive" {
    var a : JQueryStatic;
	export = a;
}