import  * as React from 'react';
import {Component} from "react";
import {chartRendererStore as ChartRendererStore} from '../../stores/ChartRendererStore';
import {TableHeaderCell} from "./TableHeaderCell";

interface IDataPreviewState {
	data : IDataItem[];
}

interface IDataItem {
	[columnName : string] : any;
}

export class DataPreview extends React.Component<void ,IDataPreviewState> {
	constructor(){
		super();
		this.state = {
			data : ChartRendererStore.getPreviewData()
		}
	}
	render() {
		let headers = [];
		let headersLoaded = false;
		let tableContent = this.state.data.map((row, index)=>{
			let cols = [];
			let colIndex = 0;
			for (var colName in row){
				if (!headersLoaded){
					headers.push(colName);
				}
				cols.push(<td key={colIndex}>{row[colName]}</td>)
				colIndex++;
			};
			headersLoaded=true;
			return <tr key={index}>{cols}</tr>
		});
		let tableHeaders = headers.map((x,index)=>{
			return <TableHeaderCell key={index} name={x}/>
		});
		return (
			<div className="table-responsive">
				<table className="table table-condensed table-bordered table-striped">
					<tbody>
						<tr>{tableHeaders}</tr>
						{tableContent}
					</tbody>
				</table>
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
		this.setState({ data : ChartRendererStore.getPreviewData()});	
	}
}
