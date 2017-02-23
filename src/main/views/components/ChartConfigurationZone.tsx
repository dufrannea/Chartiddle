import  * as React from 'react';
import {Component} from "react";
import {IQueryResult, IQueryOptions, IChartDisplayOptions, IMeasure, IWithKey} from "../../model/model";
import {chartRendererStore as ChartRendererStore} from '../../stores/ChartRendererStore';
import {appActions as Actions} from '../../actions/Actions'
import {SimpleChartDropZone} from "./SimpleChartDropZone";
import {MeasureDropZone} from "./MeasureDropZone";

interface IChartConfigurationZoneState {
	columns : IWithKey[];
	rows : IWithKey[];
	measures : IMeasure[];
}

export class ChartConfigurationZone extends Component<void,IChartConfigurationZoneState> {
	constructor() {
		super();
		this.state = {
			rows : ChartRendererStore.getSelectedRows(),
			columns : ChartRendererStore.getSelectedColumns(),
			measures : []
		}
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
		ChartRendererStore.registerChangeListener(this._onChange);
	}
	componentWillUnmount(){
		ChartRendererStore.removeListener("CHANGE", this._onChange);
	}
	_onChange = () => {
		this.setState({ 
			rows : ChartRendererStore.getSelectedRows(),
			columns : ChartRendererStore.getSelectedColumns(),
			measures : ChartRendererStore.getSelectedMeasures()
		});	
	}
}