import  * as React from 'react';
import {Component} from "react";
import {appActions as Actions} from '../actions/Actions'
import {chartRendererStore as ChartRendererStore} from '../stores/ChartRendererStore';
import {Chart} from './components/Chart'
import {IQueryResult, IQueryOptions, IChartDisplayOptions, IMeasure} from "../model/model";
import {ChartDropZone} from "./components/ChartDropZone";
import {QueryOptions} from "./components/QueryOptions";
import {ChartConfigurationZone} from "./components/ChartConfigurationZone";
import {DataPreview} from "./components/DataPreview";

interface IChartViewComponentParams {
}
interface IChartViewComponentState {
	loading : boolean;
	queryResult : IQueryResult;
    displayOptions : IChartDisplayOptions;
}
/**
 * Component that renders a chart.
 */
export class ChartViewComponent extends React.Component<IChartViewComponentParams,IChartViewComponentState> {
	constructor(){
		super();
		this.state = {
			loading : false,
			queryResult : null,
            displayOptions : {
                stacked : false,
                chartType : "column"
            }
		}
	}
	componentDidMount(){
		ChartRendererStore.registerChangeListener(this._onChange);
	}
	componentWillUnmount(){
		ChartRendererStore.removeListener("CHANGE", this._onChange);
	}
	_onChange = () => {
        let displayOptions = ChartRendererStore.getChartDisplayOptions();
		this.setState({ 
			queryResult : ChartRendererStore.getQueryResult(), 
			loading : ChartRendererStore.isQueryComputing(),
            displayOptions :  ChartRendererStore.getChartDisplayOptions()
        });	
	}
	render() {
		return (
			<div className="container">
				<ChartRendererToolbar/>
				<Chart loading={this.state.loading}	
                       data={this.state.queryResult} 
                       chartType={this.state.displayOptions.chartType} 
                       stacked={this.state.displayOptions.stacked}/>
				<div className="panel panel-default">
					<div className="panel-heading">Options</div>
					<div className="panel-body">
						<QueryOptions/>
					</div>
				</div>
				<div className="well">
					<ChartConfigurationZone/>
				</div>
				<DataPreview/>
			</div>
		);
	}
}

interface IChartRendererToolbarParams {
}
interface IChartRendererToolbarState {
}
export class ChartRendererToolbar extends React.Component<IChartRendererToolbarParams,IChartRendererToolbarState> {
	constructor(){
		super();
		this.state = {};
	}
	render() {
		return (
			<div className="panel panel-default">
				<div className="panel-body">
					<button className="btn"
								onClick={this.__handleClickSave} >Save
						<span className="glyphicon glyphicon-floppy-disk"></span>			
					</button>
				</div>
			</div>
		);
	}
	__handleClickSave(){
		Actions.saveChart(ChartRendererStore.getChartConfiguration())
	}
	_onChange(){
		this.setState({});
	}
}