/// <reference path="../../typings/tsd.d.ts"/>
import React = require('react');

declare var Dropbox : any;

interface IDropzoneComponentParams {
	onDrop : (f : File) => void;
	onDropboxChoose : (file : IDropBoxFile) => void;
	loading : boolean;
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
		this.__renderDropBox();
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
		let dropbox = <div ref='dropbox-item'/>
		
		return (
			<div className={classes} ref="holder">
				<span style={{ position : "absolute"}}>Drag file here.</span>
				<div className="spinner-centerer">
				    <div className="spinner-container">
					{dropbox}
					</div>
				</div>
				<div style={{display: this.props.loading? '' : 'none'}} className="spinner-centerer">
				    <div className="spinner-container">
						<div className="whirly-loader"/>
					</div>
				</div>
			</div>
		);
	}
	__renderDropBox(){
		let options = {
		
			// Required. Called when a user selects an item in the Chooser.
			success: (files : IDropBoxFile[]) => {
				this.props.onDropboxChoose(files[0]);
			},
		
			// Optional. Called when the user closes the dialog without selecting a file
			// and does not include any parameters.
			cancel: function() {
		
			},
		
			// Optional. "preview" (default) is a preview link to the document for sharing,
			// "direct" is an expiring link to download the contents of the file. For more
			// information about link types, see Link types below.
			linkType: "direct",
		
			// Optional. A value of false (default) limits selection to a single file, while
			// true enables multiple file selection.
			multiselect: false, // or true
		
			// Optional. This is a list of file extensions. If specified, the user will
			// only be able to select files with these extensions. You may also specify
			// file types, such as "video" or "images" in the list. For more information,
			// see File types below. By default, all extensions are allowed.
			extensions: ['.csv', '.tsv'],
		};
		let element = this.refs['dropbox-item']['getDOMNode']();
		var button = Dropbox.createChooseButton(options);
		element.appendChild(button);
	}
}