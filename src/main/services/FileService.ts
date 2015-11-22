/// <reference path="../../typings/tsd.d.ts"/>
/// <reference path="../model/model.d.ts"/>
import {FileRepository} from './FileRepository'
import {Repository} from './Repository'
import {BatchingProvider} from '../dataproviders/BatchingProvider'
import {PapaLocalDataProvider} from '../dataproviders/PapaLocalDataProvider'
import {DataProcessor} from '../services/DataProcessor'

export class FileService {
	private _sourcesRepo : Repository<IDataSource, number>;
	private _fileRepo : FileRepository;
	private _processor : DataProcessor;
	private _chartRepo : Repository<IChartConfiguration, number>;
	
	constructor(
		sourcesRepo : Repository<IDataSource,number>,
		fileRepo : FileRepository,
		processor : DataProcessor,
		chartRepo : Repository<IChartConfiguration, number>)
	{
		this._sourcesRepo = sourcesRepo;
		this._fileRepo = fileRepo;
		this._processor = processor;
		this._chartRepo = chartRepo;
	}
	
	/**
	 * Save a chart
	 * @param {IChartConfiguration} : the chart to save.
	 * @return {Promise<number>} : the id of the created configuration.
	 */
	public saveChart(chart: IChartConfiguration){
		return this._chartRepo.save(chart).then(()=>{
			return chart.id;
		});
	}
	
	/**
	 * Get all charts for a given datasource.
	 * @param {number} datasourceId : the id of the datasource.
	 * @return {Promise<IChartConfiguration[]>} : the charts configurations.
	 */
	public getAllChartsForDataSource(datasourceId : number){
		return this
			._chartRepo
			.getAll()
			.then(charts =>{
				if (!charts){
					return []
				} else{
					return charts.filter(c =>{
						return c.datasource_id === datasourceId;
					})
				}
			});
	}
	
	/**
	 * Get the list of datasources.
	 * @return {Promise<IDataSource[]>}
	 */
	public getAllDataSourcesAsync() : Promise<IDataSource[]> {
		return this._sourcesRepo.getAll();
	}
	
	public deleteDataSource(id : number) : Promise<void> {
		return this._fileRepo.deleteFile(id).then(()=>{
				return this._sourcesRepo.delete(id);
			});
	}
	/**
	 * Run a query against a datasource.
	 * @param queryModel {IQuery} : the query.
	 * @param sourceId {number} : the unique id of the source to query.
	 */
	public Query(
		queryModel : IQuery, 
		sourceId : number, 
		queryOptions? : IQueryOptions){
			
		let source = this._fileRepo.getAsDataStream(sourceId);
		return this._processor.Query(queryModel, source, queryOptions);	
	}
	
	/**
	 * Save a file.
	 * @param file {File} : the file object to save.
	 * @param id {number} : NOT SUPPORTED YET, the id
	 * 		of the file to replace if it already exists. 
	 */
	public saveFileAsync(file : File, id : number = null){
		if (id){
			throw "Replace not implemented yet";
		}
		let savee : IDataSource={
			name : file.name
		};
		let dataStream = new BatchingProvider(
				new PapaLocalDataProvider(file),
				100);
		
		return this.__saveFileAsync(dataStream, savee);
	}
	
	public saveDropboxFileAsync(file : IDropBoxFile){
		let savee : IDataSource = {
			name : file.name
		}
		
		return PapaLocalDataProvider.createFromURL(file.link)
			.then(dataStream =>{
				return new BatchingProvider(dataStream);
			}).then(p=>{
				return this.__saveFileAsync(p,savee); 
			})
	}
	
	private __saveFileAsync(provider : IDataProvider, savee : IDataSource){
		return this._sourcesRepo
			.save(savee)
			.then(()=>{
				let dataStream = provider;
				
				return this._fileRepo.save({
					id : savee.id,
					dataStream : dataStream,
					name : null
				})
			}).then<number>(()=>{
				return savee.id;
			});
	}
	
	/**
	 * Return a preview of the file, ie its first lines.
	 * @param id {number} : id of the file to preview.
	 * @return {Promise<{ [key : string] : any; }[]>} : the "flattened" lines.
	 */
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