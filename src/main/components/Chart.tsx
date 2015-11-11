/// <reference path="../../typings/tsd.d.ts"/>
/// <reference path="../model/model.d.ts" />
/// <amd-dependency path="highcharts"/>
import React = require('react');
import {appActions as Actions} from '../actions/Actions'
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
			var columnTuple = result.Columns[colIndex];
			colIndex+=1;
			return { 
				name:columnTuple.members.map(x=>x.name).reduce((p,c)=>p+","+c) ,
				y : x,
				drilldown : true 
			}
		});
		var name = result.Rows[i].members.map(x=>x.name).reduce((p,c)=>p+","+c);
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
	data : IQueryResult;
	loading : boolean;
}
interface IChartState {
}
export class Chart extends React.Component<IChartParams,IChartState> {
	private chart : any;
	private changeListener : any;
	constructor(){
		super();
	}
	render() {
		return (
			<div>
				<div ref="chart"></div>
				<div style={{display: this.props.loading? '' : 'none'}} className="spinner-centerer">
				    <div className="spinner-container">
						<div className="whirly-loader"/>
					</div>
				</div>
			</div>
		);
	}
	componentWillUnmount(){
		if (this.chart){
			$(this.chart).highcharts().destroy();
		}
	}

	updateChart(data : IQueryResult){
		if (data != null){	
			let domElement = this.refs["chart"]['getDOMNode']();
			this.chart = $(domElement).highcharts(buildConfig(data));
		}
	}
	componentWillReceiveProps(props : IChartParams){
		let oldData = this.props.data;
		if (oldData !== props.data){
			this.updateChart(props.data);
		}
	}
}