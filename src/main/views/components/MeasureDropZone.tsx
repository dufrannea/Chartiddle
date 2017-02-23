import  * as React from 'react';
import {Component} from "react";
import {ChartDropZone} from "./ChartDropZone";
import {IMeasure} from "../../model/model";
import {appActions as Actions} from '../../actions/Actions'

export class MeasureDropZone extends ChartDropZone<IMeasure>{
	constructor(){
		super();
	}
	__selectMeasureType(measure:IMeasure){
		return (event)=>{
			measure.type = event.target.value;
			Actions.updateMeasure(measure)
		}
  	}

	render(){
		let lis = this.props.items.map(x=> 
			<li className="list-group-item" key={x.key}>
				<span className="glyphicon glyphicon-remove" 
					onClick={()=> this.__handleRemove.bind(this)(x)}>
				</span>{" " + x.key}
				<select onChange={this.__selectMeasureType(x)} value={x.key}>
				{
					["sum","count","min","max"].map(y=>{
						return <option key={y} value={y}>{y}</option>
					})
				}
				</select>
			</li>);
			
		return (
			<div className="col-md-4">
				<div ref="dropzone" className="chart-drop-zone">
					<ul className="list-group">
						{lis}
					</ul>
				</div>
			</div>
		);
	}
}