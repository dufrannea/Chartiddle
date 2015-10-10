/// <reference path="../../typings/tsd.d.ts"/>
/// <reference path="../model/model.d.ts" />
/// <amd-dependency path="bootstrap"/>

import React = require('react');
import {DropzoneComponent} from '../components/DropzoneComponent'
import {dataSourceStore as DataSourceStore} from '../stores/DataSourceStore'
import {fileStore as FileStore} from '../stores/FileStore'
import {appActions as Actions} from '../infrastructure/Actions'

interface IDataSourceListParams {
}

interface IDataSourceListState {
	dataSources : IDataSource[];
}

let a = FileStore;
class DataSourceList extends React.Component<IDataSourceListParams,IDataSourceListState> {
	constructor(){
		this.state = {
			dataSources : DataSourceStore.getAll()
		};
		super(this);
	}
	render() {
		let files = this.state.dataSources.map(x=> <li>{x.name}</li>)
		return (
			<div>
				<DropzoneComponent acceptFile={this._acceptFile.bind(this)}/>
				<ul>
				{files}
				</ul>
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
		this.setState({ dataSources : DataSourceStore.getAll()});	
	}
}

export function startReact(){
	let mainElement = document.querySelector("#main");
	
	React.render(
		<div>
			<DataSourceList/>
		</div>,
		mainElement
	);
}