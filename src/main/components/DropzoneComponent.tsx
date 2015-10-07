/// <reference path="../../typings/tsd.d.ts"/>

import React = require('react');
import Dropzone = require('dropzone');


export interface IDropzoneComponentProps {
	acceptFile?: (f: File) => void;
}
export interface IDropzoneComponentState {
}

export class DropzoneComponent extends React.Component<IDropzoneComponentProps, IDropzoneComponentState> {
	componentWillMount() {
	}
	componentDidMount() {
		let zoneElement = this.refs['zone']['getDOMNode']();
		let myDropZone = new Dropzone(zoneElement, {
			 accept: this._onAddFile.bind(this)
		});
	}
	_onAddFile(file:File, done:(error?:string|Error) => void):void {
		this.props.acceptFile(file);
	}
	render() {
		return (
			<form className="dropzone" action= ";" ref= "zone"></form>
		);
	}
}