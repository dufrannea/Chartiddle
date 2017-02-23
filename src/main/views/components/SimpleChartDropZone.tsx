import  * as React from 'react';
import {Component} from "react";
import {ChartDropZone} from "./ChartDropZone";
import {IWithKey} from "../../model/model";

export class SimpleChartDropZone extends ChartDropZone<IWithKey>{
	constructor(){
		super();
	}
	render() {
		return (
			<div className="col-md-4">
				<div ref="dropzone" className="chart-drop-zone">
					<ul className="list-group">
						{this.props.items.map(x=> <li className="list-group-item" ref="x"><span className="glyphicon glyphicon-remove" onClick={()=> this.__handleRemove.bind(this)(x)}></span>{" " + x.key}</li>)}
					</ul>
				</div>
			</div>
		);
	}
}