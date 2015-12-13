/// <reference path="../../../typings/tsd.d.ts"/>
/// <reference path="../../model/model.d.ts" />
/// <amd-dependency path="bootstrap"/>

import React = require('react');
import {DropzoneComponent} from './DropzoneComponent'
import {dataSourceStore as DataSourceStore} from '../../stores/DataSourceStore'
import {appActions as Actions} from '../../actions/Actions'
import {NavigationActions} from '../../actions/NavigationActions'
import {ApplicationTabs} from '../../actions/AppConstants'
import {Chart} from './Chart'

interface IDataSourceListParams {
}

interface IDataSourceListState {
	dataSources : IDataSource[];
	loading : boolean;
}

export class DataSourceList extends React.Component<IDataSourceListParams,IDataSourceListState> {
	constructor(){
		super();
		this.state = {
			dataSources : DataSourceStore.getAll(),
			loading : false
		};
	}
	__handleDataSourceClick(dataSource : IDataSource){
		return ()=>{
			NavigationActions.viewChartForDataSource(dataSource.id)
		}
	}
	__handleDataSourceDelete(dataSource : IDataSource){
		return ()=>{
			Actions.deleteDataSource(dataSource.id)
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
				<ChartList/>
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
		DataSourceStore.registerChangeListener(this._onChange);
	}
	componentWillUnmount(){
		DataSourceStore.removeListener("CHANGE", this._onChange)	
	}
	_onChange = () => {
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
		super();
	}
	__selectDataSource(){
		Actions.previewChartsForDataSource(this.props.data);
	}
	render() {
		return (
			<div className="list-group-item text-right">
				<span className="pull-left">
					{this.props.data.name}
				</span>
				<div className="btn-group" >
					<button
							type="button"
							className="btn btn-default"
							onClick={this.__selectDataSource.bind(this)}>
						<span className="glyphicon glyphicon-option-horizontal" 
						      aria-hidden="true"></span>	
					</button>
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
}

interface IChartListParams {
}
interface IChartListState {
	charts : IChartConfiguration[];
}
export class ChartList extends React.Component<IChartListParams,IChartListState> {
	constructor(){
		this.state = {
			charts : []
		};
		super();
	}
	render() {
		let charts = this.state.charts.map(c =>{
			return <Chart
						key={c.id}
						data={c.results}
						loading={false}
					/>
		})
		return (
			<ul>
				{charts}
			</ul>
		);
	}
	componentDidMount(){
		DataSourceStore.registerChangeListener(this._onChange.bind(this));
	}
	_onChange(){
		this.setState({
			charts : DataSourceStore.getCharts()
		});	
	}
}