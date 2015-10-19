/// <reference path="../../typings/tsd.d.ts"/>
/// <reference path="../model/model.d.ts"/>
import {FileRepository} from './FileRepository'
import {Repository} from './Repository'
import {BatchingProvider} from '../dataproviders/BatchingProvider'
import {PapaLocalDataProvider} from '../dataproviders/PapaLocalDataProvider'

export class FileService {
	private _sourcesRepo : Repository<IDataSource, number>;
	private _fileRepo : FileRepository;
	
	constructor(
		sourcesRepo : Repository<IDataSource,number>,
		fileRepo : FileRepository){
		this._sourcesRepo = sourcesRepo;
		this._fileRepo = fileRepo;
	}
	
	public getAllDataSourcesAsync() : Promise<IDataSource[]> {
		return this._sourcesRepo.getAll();
	}
	
	/**
	 * Save a file.
	 */
	public saveFileAsync(file : File, id : number = null){
		if (id){
			throw "Replace not implemented yet";
		}
		let savee : IDataSource={
			name : file.name
		};
		
		return this._sourcesRepo
			.save(savee)
			.then(()=>{
				let dataStream = new BatchingProvider(
						new PapaLocalDataProvider(file),
						100);
				
				return this._fileRepo.save({
					id : savee.id,
					dataStream : dataStream,
					name : null
				})
			}).then<number>(()=>{
				return savee.id;
			});
	}
	
	public getPreviewAsync(id : number) : Promise<{ [key : string] : any; }[]>{
		return new Promise((resolve,reject)=>{
			let stream = this._fileRepo.getAsDataStream(id, 1);
			let result =[];
			stream.foreach((data)=>{
					result.push.apply(result, data);
				},()=>{
					resolve(result);
				})
		})
	}
} {}