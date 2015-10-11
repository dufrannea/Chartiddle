/// <reference path="../../typings/tsd.d.ts"/>
import React = require('react');

interface IDropzoneComponentParams {
	onDrop : (f : File) => void;
}

interface IDropzoneComponentState {
	hover : boolean;
}
export class DropzoneComponent extends React.Component<IDropzoneComponentParams,IDropzoneComponentState> {
	constructor(){
		this.state = {
			hover: false
		};
		super();
	}
	componentDidMount(){
		let element = this.refs['holder']['getDOMNode']();
		element.ondragover = () => { 
			console.info("dragging over");
			this.__startHover();
			return false; 
		};
		element.ondragend = () => { 
			console.info("dragging end");
			this.__stopHover();
		};
		element.ondrop = (e) => {
			console.info("dropping");
			e.preventDefault();
			this.__stopHover();
			var file = e.dataTransfer.files[0];
			this.props.onDrop(file);
		};
	}
	__stopHover(){
		let newState = this.state;
		newState.hover = false;
		this.setState(newState);
	}
	__startHover(){
		let newState = this.state;
		newState.hover = true;
		this.setState(newState);
	}
	componentWillUnmount(){
	}
	render() {
		let classes = 'dropzone' + (this.state.hover ? ' hover' : '');
		return (
			<div className={classes} ref="holder">
				<span>Drag file here.</span>
			</div>
		);
	}
}