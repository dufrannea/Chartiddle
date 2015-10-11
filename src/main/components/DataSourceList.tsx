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
	render() {
		let files = this.state.dataSources.map(x=> {
			return <button key={x.id} onClick={this.__handleDataSourceClick(x)} className="list-group-item">{x.name}</button>
		});
		return (
			<div className="col-md-6 col-md-offset-3 displayNone">
				<DropzoneComponent 
					loading={this.state.loading}
					onDrop={this._acceptFile.bind(this)}/>
				<div className="panel panel-default">
					<div className="panel-heading">Your files :</div>
					<div className="list-group">
					{files}
					</div>
				</div>
			</div>
		);
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