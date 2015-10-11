/// <reference path="../../typings/tsd.d.ts"/>
/// <reference path="../model/model.d.ts" />

import React = require('react');
import {appActions as Actions} from '../actions/Actions'
import {chartRendererStore as ChartRendererStore} from '../stores/ChartRendererStore';

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
	render() {
		return (
			<th>{this.props.name}</th>
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
			<div>
				<div>Here goes the chart</div>
				<DataPreview/>
			</div>
		);
	}
}