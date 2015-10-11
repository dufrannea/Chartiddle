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
		let tableContent = this.state.data.map((row)=>{
			let cols = [];
			for (var colName in row){
				cols.push(<td>{row[colName]}</td>)
			};
			return <tr>{cols}</tr>
		})
		return (
			<table className="table">
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