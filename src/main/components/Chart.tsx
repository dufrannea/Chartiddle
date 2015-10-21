/// <reference path="../../typings/tsd.d.ts"/>
/// <reference path="../model/model.d.ts" />
/// <amd-dependency path="highcharts"/>
import React = require('react');
import {appActions as Actions} from '../actions/Actions'
import {chartRendererStore as ChartRendererStore} from '../stores/ChartRendererStore';
import $ = require('jquery');

declare var Highcharts: HighchartsStatic;

const  baseConfig = {
	chart: {
		type: 'column',
		events: {
			drilldown: function (e) {
				console.info(e.point, e);
			}
		}
	},
	title: {
		text: ''
	},
	subtitle: {
		text: ''
	},
	xAxis: {
		type : 'category'
	},
	yAxis: {
		min: 0,
		title: {
			text: ''
		}
	},
	plotOptions: {
		column: {
			stacking: null //'normal'
		}
	},
	series : []
};
const stacked = false;
const graphType = "column";

let buildConfig = (result : IQueryResult) =>{
	var cats = result.Columns;
	var vals = result.Values;
	var series = []
	for (var i = 0; i< vals.length; i++){
		// should pick the name of the columns here...
		var colIndex = 0;
		var serie = vals[i].map(function(x){ 
			var colName = result.Columns[colIndex];
			colIndex+=1;
			return { name:colName , y : x, drilldown : true }
		});
		var name = result.Rows[i];
		series.push({
			name : name,
			data : serie
		});
	}

	var newConfig = baseConfig;
	newConfig.chart.type = graphType;
	newConfig.series = series;
	if (stacked) {
		newConfig.plotOptions.column.stacking = 'normal';
	} else {
		newConfig.plotOptions.column.stacking = null;
	}
	return newConfig;
}
interface IChartParams {
}
interface IChartState {
	data : IQueryResult
}
export class Chart extends React.Component<IChartParams,IChartState> {
	private chart : any;
	constructor(){
		this.state = {data :  ChartRendererStore.getQueryResult()}
		super();
	}
	render() {
		return (
			<div>
				<div ref="chart"></div>
			</div>
		);
	}
	componentDidMount(){
		ChartRendererStore.registerChangeListener(this._onChange.bind(this));
		// this.updateChart();
		
	}
	updateChart(){
		if (this.state.data != null){	
			let domElement = this.refs["chart"]['getDOMNode']();
			this.chart = $(domElement).highcharts(buildConfig(this.state.data));
		}
	}
	_onChange(){
		this.setState({ 
			data : ChartRendererStore.getQueryResult()
		});
		this.updateChart();
	}
}