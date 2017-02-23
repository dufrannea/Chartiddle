import  * as React from 'react';
import {Component} from "react";

interface ITableHeaderCellParams {
	name:string
}
interface ITableHeaderCellState {
}
export class TableHeaderCell extends React.Component<ITableHeaderCellParams,ITableHeaderCellState> {
	componentDidMount(){
		let $node =$(this.refs['node']);
		$node.data("data",this.props.name);
		$node.draggable({
			revert : "invalid",
			 helper: ( event ) => {
        		return $( "<div class='column-dragged'></div>" )
							.text(this.props.name)
							.data("data",this.props.name);
      		}
		});
	}
	render() {
		return (
			<th className="table-header-cell" ref="node">{this.props.name}</th>
		);
	}
}