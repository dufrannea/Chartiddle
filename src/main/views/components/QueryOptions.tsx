import  * as React from 'react';
import {Component} from "react";
import {IQueryResult, IQueryOptions, IChartDisplayOptions, IMeasure} from "../../model/model";
import {chartRendererStore as ChartRendererStore} from '../../stores/ChartRendererStore';
import {appActions as Actions} from '../../actions/Actions'

interface IQueryOptionsParams {
}
interface IQueryOptionsState {
	options : IQueryOptions,
    displayOptions : IChartDisplayOptions
}

export class QueryOptions extends React.Component<IQueryOptionsParams,IQueryOptionsState> {
	constructor(){
		super();
		this.state = {
			options : ChartRendererStore.getQueryOptions(),
            displayOptions : ChartRendererStore.getChartDisplayOptions()
		};
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
        this._onChange();
	}
    __triggerOptionsUpdate(){
        Actions.updateQueryOption(this.state.options); 
    }
    __toggleStacking(){
        this.state.displayOptions.stacked = !this.state.displayOptions.stacked; 
        let newState = {
            stacked : this.state.displayOptions.stacked,
            chartType : this.state.displayOptions.chartType
        };

        Actions.updateChartDisplayOptions(newState);
    }
    __selectChartType(event){
        this.state.displayOptions.chartType = event.target.value 

        let newState = {
            stacked : this.state.displayOptions.stacked,
            chartType : this.state.displayOptions.chartType
        };

        Actions.updateChartDisplayOptions(newState);
}
	render() {
		let sortOptions = this.state.options.sort ? <div className="checkbox">
						<label>
						<input type="checkbox"
							   onChange={this.__toggleSortOrder.bind(this)} 
                               checked={this.state.options.sortOrder == 0}/> Sort ascending
						</label>
					</div> : null;
		
		let limitOptions : JSX.Element = null;
		if (this.state.options.sort) {
			limitOptions =  <div className="form-group">
								<label>Limit to results</label>
								<input type="number" 
									   className="form-control" 
									   value={this.state.options.limitTo.toString()}
                                       onBlur={this.__triggerOptionsUpdate.bind(this)}
									   onChange={this.__updateResultsLimit.bind(this)}/>
							</div>
		}
        
		return (
			<div>
				<div className="form-group">
					<div className="checkbox">
						<label>
						<input  type="checkbox"
							    onChange={this.__toggleSort.bind(this)} 
                                checked={this.state.options.sort}/> Sort results
						</label>
					</div>
					{sortOptions}
					{limitOptions}
                    <div className="form-group">
                        <div className="checkbox">
                            <label>
                            <input  type="checkbox"
                                    onChange={this.__toggleStacking.bind(this)} 
                                    checked={this.state.displayOptions.stacked}/> Stacked
                            </label>
                        </div>
                    </div>
                    <select onChange={this.__selectChartType.bind(this)}
							value={this.state.displayOptions.chartType}>
                        {
                            ["column","pie","spline","bar"].map(option=>{
                                return <option key={option} 
                                               value={option}>{option}</option>
                            })
                        }
				    </select>
				</div>
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
			options: ChartRendererStore.getQueryOptions(),
            displayOptions : ChartRendererStore.getChartDisplayOptions()
		});
	}
}