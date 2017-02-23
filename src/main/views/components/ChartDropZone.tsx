import  * as React from 'react';
import {Component} from "react";
import {IWithKey} from "../../model/model";
import "jquery-ui";
import "jquery-ui/ui/widgets/droppable";
import "jquery-ui/ui/widgets/draggable";
import * as $ from 'jquery';

interface IChartDropZoneParams<X extends IWithKey> {
	items : X[];
	handleDrop : (data : string) => void;
	handleRemove : (data : string) => void;
}
export class ChartDropZone<X extends IWithKey> extends React.Component<IChartDropZoneParams<X>,void> {
	constructor() {
		super();
	}
	componentDidMount() {
		let domNode = this.refs['dropzone'];
		$(domNode).droppable({
			accept: function(event){
				return true;
			},
			activeClass : 'active',
			drop : (ev, target)=>{
				let data = $(target.draggable).data()['data'];
				this.__handleDrop(data)
			}
		})
	}
	__handleDrop(data : string){
		this.props.handleDrop(data);
	}
	__handleRemove(data : X){
		this.props.handleRemove(data.key);
	}
	render() {
		return (
			<div ref="dropzone" className="chart-drop-zone col-md-4" style={{'min-height':'200px'}}>
				<ul className="list-group">
					{this.props.items.map(x=> <li className="list-group-item" ref="x"><span className="glyphicon glyphicon-remove" onClick={()=> this.__handleRemove.bind(this)(x)}></span>{" " + x}</li>)}
				</ul>
			</div>
		);
	}
}