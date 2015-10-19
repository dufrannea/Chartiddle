/// <reference path="../../typings/tsd.d.ts"/>
/// <reference path="../model/model.d.ts" />
/// <amd-dependency path="jquery-ui" />
import $ = require('jquery');

import React = require('react');
import {appActions as Actions} from '../actions/Actions'
import {chartRendererStore as ChartRendererStore} from '../stores/ChartRendererStore';
import {Chart} from './Chart'

interface IChartConfigurationZoneParams {
}

interface IChartConfigurationZoneState {
	columns : string[];
	rows : string[];
	measures : string[];
}

class ChartConfigurationZone extends React.Component<IChartConfigurationZoneParams,IChartConfigurationZoneState> {
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
	render() {
		return (
			<div className="row">
				<ChartDropZone 
					items={this.state.columns}
					handleDrop={this.__handleColumnDrop}/>
				<ChartDropZone 
					items={this.state.rows}
					handleDrop={this.__handleRowDrop}/>
				<ChartDropZone 
					items={this.state.measures}
					handleDrop={this.__handleMeasureDrop}/>
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

interface IChartDropZoneParams {
	items : string[];
	handleDrop : (data : string) => void;
}
interface IChartDropZoneState {
}
class ChartDropZone extends React.Component<IChartDropZoneParams,IChartDropZoneState> {
	constructor() {
		super();
	}
	componentDidMount() {
		let domNode = this.refs['dropzone']['getDOMNode']();
		$(domNode).droppable({
			accept: function(event){
				console.info($(event[0]).data()['data']);
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
	render() {
		return (
			<div ref="dropzone" className="chart-drop-zone col-md-4" style={{'min-height':'200px'}}>
				<ul className="list-group">
					{this.props.items.map(x=> <li className="list-group-item" ref="x">{x}</li>)}
				</ul>
			</div>
		);
	}
}


interface IDataPreviewParams {
}

interface IDataPreviewState {
	data : IDataItem[];
}

interface IDataItem {
	[columnName : string] : any;
}

class DataPreview extends React.Component<IDataPreviewParams,IDataPreviewState> {
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
}
/**
 * Component that renders a chart.
 */
export class ChartRenderer extends React.Component<IChartRendererParams,IChartRendererState> {
	render() {
		return (
			<div className="row">
				<div className="col-md-6 col-md-offset-3">
					<Chart/>
					<ChartConfigurationZone/>
					<DataPreview/>
				</div>
			</div>
		);
	}
}