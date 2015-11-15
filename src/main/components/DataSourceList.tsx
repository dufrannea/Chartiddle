/// <reference path="../../typings/tsd.d.ts"/>
/// <reference path="../model/model.d.ts" />
/// <amd-dependency path="bootstrap"/>

import React = require('react');
import {DropzoneComponent} from './DropzoneComponent'
import {dataSourceStore as DataSourceStore} from '../stores/DataSourceStore'
import {appActions as Actions} from '../actions/Actions'
import {ApplicationTabs} from '../actions/AppConstants'

interface IDataSourceListParams {
}

interface IDataSourceListState {
	dataSources : IDataSource[];
	loading : boolean;
}

export class DataSourceList extends React.Component<IDataSourceListParams,IDataSourceListState> {
	constructor(){
		this.state = {
			dataSources : DataSourceStore.getAll(),
			loading : false
		};
		super(this);
	}
	__handleDataSourceClick(dataSource : IDataSource){
		return ()=>{
			Actions.selectDataSource(dataSource)
		}
	}
	__handleDataSourceDelete(dataSource : IDataSource){
		return ()=>{
			Actions.deleteDataSource(dataSource)
		}
	}
	render() {
		let files = this.state.dataSources.map(x=> {
			return <DataSourceItem 
						data={x} 
						key={x.id}
						onSelect={this.__handleDataSourceClick(x)}
						onClickDelete={this.__handleDataSourceDelete(x)}/>
		});
		return (
			<div className="col-md-6 col-md-offset-3 displayNone">
				<DropzoneComponent 
					loading={this.state.loading}
					onDrop={this._acceptFile.bind(this)}
					onDropboxChoose={this._loadUrl.bind(this)}/>
				<div className="panel panel-default">
					<div className="panel-heading">Your files :</div>
					<div className="list-group">
					{files}
					</div>
				</div>
			</div>
		);
	}
	_loadUrl(f : IDropBoxFile){
		console.info("asked to load url : ", f)
		Actions.addFileFromURL(f);
	}
	_acceptFile(f: File){
		Actions.addFile(f);
	}
	componentDidMount(){
		DataSourceStore.registerChangeListener(this._onChange.bind(this));
	}
	_onChange(){
		this.setState({ dataSources : DataSourceStore.getAll(), loading : DataSourceStore.isLoading()});	
	}
}


interface IDataSourceItemParams {
	data : IDataSource;
	onSelect : (data : IDataSource) => void;
	onClickDelete : (data : IDataSource) => void;
	key : any;
}
interface IDataSourceItemState {
}
export class DataSourceItem extends React.Component<IDataSourceItemParams,IDataSourceItemState> {
	constructor(){
		this.state = {};
		super();
	}
	render() {
		return (
			<div className="list-group-item text-right">
				<span className="pull-left">
					{this.props.data.name}
				</span>
				<div className="btn-group" >
					<button type="button" 
							className="btn btn-default"
							onClick={()=>this.props.onClickDelete(this.props.data)}>
						<span className="glyphicon glyphicon-trash" 
						      aria-hidden="true"></span>
					</button>
					<button type="button" 
							className="btn btn-default"
							onClick={()=>this.props.onSelect(this.props.data)}>
						<span className="glyphicon glyphicon-eye-open"
						      aria-hidden="true"></span>
					</button>
				</div>
			</div>
		);
	}
	componentDidMount(){
	}
	_onChange(){
		this.setState({});
	}
}