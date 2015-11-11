/// <reference path="../../typings/tsd.d.ts"/>
/// <reference path="../model/model.d.ts" />
/// <amd-dependency path="jquery-ui" />
import $ = require('jquery');

import React = require('react');
import {appActions as Actions} from '../actions/Actions'
import {chartRendererStore as ChartRendererStore} from '../stores/ChartRendererStore';
import {Chart} from './Chart'

interface IQueryOptionsParams {
}
interface IQueryOptionsState {
	options : IQueryOptions
}
export class QueryOptions extends React.Component<IQueryOptionsParams,IQueryOptionsState> {
	constructor(){
		this.state = {
			options : ChartRendererStore.getQueryOptions()
		};
		super();
	}
	__toggleSort(){
		this.state.options.sort = !this.state.options.sort;
		Actions.updateQueryOption(this.state.options); 
	}
	__toggleSortOrder(){
		this.state.options.sortOrder = 1 - this.state.options.sortOrder;
		Actions.updateQueryOption(this.state.options);
	}
	__updateResultsLimit(event){
		this.state.options.limitTo = parseInt(event.target.value); 
		Actions.updateQueryOption(this.state.options);
	}
	render() {
		let sortOptions = this.state.options.sort ? <div className="checkbox">
						<label>
						<input type="checkbox"
							onChange={this.__toggleSortOrder.bind(this)} checked={this.state.options.sortOrder == 0}/> Sort ascending
						</label>
					</div> : null;
		
		let limitOptions : JSX.Element = null;
		if (this.state.options.sort) {
			limitOptions =  <div className="form-group">
								<label>Limit to results</label>
								<input type="number" 
									   className="form-control" 
									   value={this.state.options.limitTo.toString()}
									   onChange={this.__updateResultsLimit.bind(this)}/>
							</div>
		}
		
		return (
			
			<div>
				 
				<div className="form-group">
					<div className="checkbox">
						<label>
						<input type="checkbox"
							onChange={this.__toggleSort.bind(this)} checked={this.state.options.sort}/> Sort results
						</label>
					</div>
					{sortOptions}
					{limitOptions}
				</div>
			</div>
		);
	}
	componentDidMount(){
		ChartRendererStore.registerChangeListener(this._onChange.bind(this));
	}
	_onChange(){
		this.setState({
			options: ChartRendererStore.getQueryOptions()
		});
	}
}

interface IWithKey {
	key : string
}

interface IChartConfigurationZoneState {
	columns : IWithKey[];
	rows : IWithKey[];
	measures : IMeasure[];
}

class ChartConfigurationZone extends React.Component<Object,IChartConfigurationZoneState> {
	constructor() {
		this.state = {
			rows : ChartRendererStore.getSelectedRows(),
			columns : ChartRendererStore.getSelectedColumns(),
			measures : []
		}
		super();
	}
	__handleColumnDrop(colName : string){
		Actions.dropColumn(colName);
	}
	__handleRowDrop(colName : string){
		Actions.dropRow(colName);
	}
	__handleMeasureDrop(colName : string){
		Actions.dropMeasure(colName);
	}
	__handleColumnRemove(colName : string){
		Actions.removeColumn(colName);
	}
	__handleRowRemove(colName : string){
		Actions.removeRow(colName);
	}
	__handleMeasureRemove(colName : string){
		Actions.removeMeasure(colName);
	}
	render() {
		return (
			<div className="row">
				<SimpleChartDropZone 
					items={this.state.columns}
					handleDrop={this.__handleColumnDrop}
					handleRemove={this.__handleColumnRemove}/>
				<SimpleChartDropZone 
					items={this.state.rows}
					handleDrop={this.__handleRowDrop}
					handleRemove={this.__handleRowRemove}/>
				<MeasureDropZone 
					items={this.state.measures}
					handleDrop={this.__handleMeasureDrop}
					handleRemove={this.__handleMeasureRemove}/>
			</div>
		);
	}
	componentDidMount(){
		ChartRendererStore.registerChangeListener(this._onChange.bind(this));
	}
	_onChange(){
		this.setState({ 
			rows : ChartRendererStore.getSelectedRows(),
			columns : ChartRendererStore.getSelectedColumns(),
			measures : ChartRendererStore.getSelectedMeasures()
		});	
	}
}

interface IChartDropZoneParams<X extends IWithKey> {
	items : X[];
	handleDrop : (data : string) => void;
	handleRemove : (data : string) => void;
}
class ChartDropZone<X extends IWithKey> extends React.Component<IChartDropZoneParams<X>,void> {
	constructor() {
		super();
	}
	componentDidMount() {
		let domNode = this.refs['dropzone']['getDOMNode']();
		$(domNode).droppable({
			accept: function(event){
				return true;
			},
			activeClass : 'active',
			drop : (ev, target)=>{
				let data = $(target.draggable).data()['data'];
				if (!data || data ===""){
					debugger;
				}
				this.__handleDrop(data)
			}
		})
	}
	__handleDrop(data : string){
		this.props.handleDrop(data);
	}
	__handleRemove(data : X){
		this.props.handleRemove(data.key);
	}
	render() {
		return (
			<div ref="dropzone" className="chart-drop-zone col-md-4" style={{'min-height':'200px'}}>
				<ul className="list-group">
					{this.props.items.map(x=> <li className="list-group-item" ref="x"><span className="glyphicon glyphicon-remove" onClick={()=> this.__handleRemove.bind(this)(x)}></span>{" " + x}</li>)}
				</ul>
			</div>
		);
	}
}

class SimpleChartDropZone extends ChartDropZone<IWithKey>{
	constructor(){
		super();
	}
	render() {
		return (
			<div ref="dropzone" className="chart-drop-zone col-md-4" style={{'min-height':'200px'}}>
				<ul className="list-group">
					{this.props.items.map(x=> <li className="list-group-item" ref="x"><span className="glyphicon glyphicon-remove" onClick={()=> this.__handleRemove.bind(this)(x)}></span>{" " + x.key}</li>)}
				</ul>
			</div>
		);
	}
}

class MeasureDropZone extends ChartDropZone<IMeasure>{
	constructor(){
		super();
	}
	__selectMeasureType(measure:IMeasure){
		return (event)=>{
			measure.type = event.target.value;
			Actions.updateMeasure(measure)
		}
    	//FluxCartActions.selectProduct(event.target.value);
  	}

	render(){
		let lis = this.props.items.map(x=> 
			<li className="list-group-item" ref="x">
				<span className="glyphicon glyphicon-remove" 
					onClick={()=> this.__handleRemove.bind(this)(x)}>
				</span>{" " + x.key}
				<select onChange={this.__selectMeasureType(x)}>
				{
					["sum","count","min","max"].map(y=>{
						let selected = x.key === y
						return <option key={y} value={y} selected={selected}>{y}</option>
					})
				}
				</select>
			</li>);
			
		return (
			<div ref="dropzone" className="chart-drop-zone col-md-4" style={{'min-height':'200px'}}>
				<ul className="list-group">
					{lis}
				</ul>
			</div>
		);
	}
}


interface IDataPreviewState {
	data : IDataItem[];
}

interface IDataItem {
	[columnName : string] : any;
}

class DataPreview extends React.Component<Object ,IDataPreviewState> {
	constructor(){
		this.state = {
			data : ChartRendererStore.getPreviewData()
		}
		super();
	}
	render() {
		let headers = [];
		let headersLoaded = false;
		let tableContent = this.state.data.map((row)=>{
			let cols = [];
			for (var colName in row){
				if (!headersLoaded){
					headers.push(colName);
				}
				cols.push(<td>{row[colName]}</td>)
			};
			headersLoaded=true;
			return <tr>{cols}</tr>
		});
		let tableHeaders = headers.map(x=>{
			return <TableHeaderCell name={x}/>
		});
		return (
			<table className="table table-condensed table-bordered">
				<tr>{tableHeaders}</tr>
				{tableContent}
			</table>
		);
	}
	componentDidMount(){
		ChartRendererStore.registerChangeListener(this._onChange.bind(this));
	}
	_onChange(){
		this.setState({ data : ChartRendererStore.getPreviewData()});	
	}
}

interface ITableHeaderCellParams {
	name:string
}
interface ITableHeaderCellState {
}
class TableHeaderCell extends React.Component<ITableHeaderCellParams,ITableHeaderCellState> {
	componentDidMount(){
		let $node =$(this.refs['node']['getDOMNode']());
		$node.data("data",this.props.name);
		$node.draggable({
			revert : "invalid",
			 helper: ( event ) => {
        		return $( "<div class='column-dragged'></div>" )
							.text(this.props.name)
							.data("data",this.props.name);
      		}
		});
	}
	render() {
		return (
			<th className="table-header-cell" ref="node">{this.props.name}</th>
		);
	}
}

interface IChartRendererParams {
}
interface IChartRendererState {
	loading : boolean;
	queryResult : IQueryResult;
}
/**
 * Component that renders a chart.
 */
export class ChartRenderer extends React.Component<IChartRendererParams,IChartRendererState> {
	constructor(){
		this.state = {
			loading : false,
			queryResult : null
		}
		super();
	}
	componentDidMount(){
		ChartRendererStore.registerChangeListener(this._onChange.bind(this));
	}
	_onChange(){
		this.setState({ 
			queryResult : ChartRendererStore.getQueryResult(), 
			loading : ChartRendererStore.isQueryComputing()}
		);	
	}
	render() {
		return (
			<div className="row">
				<div className="col-md-6 col-md-offset-3">
					<Chart 
						loading={this.state.loading}
						data={this.state.queryResult} />
					<QueryOptions/>
					<ChartConfigurationZone/>
					<DataPreview/>
				</div>
			</div>
		);
	}
}