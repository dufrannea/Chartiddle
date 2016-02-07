// homepage
// - marketing
// - features
// - howto

/// <reference path="../../typings/tsd.d.ts"/>
import React = require('react');

export class HomeViewComponent extends React.Component<Object,Object> {
	constructor(){
		this.state = {};
		super();
	}
	
	render() {
		return (
			<div>
				<div className="jumbotron">
					<div className="container">
						<div className="row">
							<div className="col-md-7">
								<h1>Chartiddle</h1>
								<p>
									Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque tristique nunc augue. Mauris vehicula aliquam libero eget venenatis.
								</p>
							</div>
							<div className="col-md-5">
								screenshot
							</div>
						</div>
					</div>
				</div>
				<div className="container">
					<div className="row">
						<div className="col-md-4">
							Praesent ornare neque dolor, id lobortis felis tincidunt quis. Donec ut commodo sapien, sit amet sollicitudin tellus. Donec feugiat suscipit bibendum.
						</div>
						<div className="col-md-4">
							Praesent ornare neque dolor, id lobortis felis tincidunt quis. Donec ut commodo sapien, sit amet sollicitudin tellus. Donec feugiat suscipit bibendum.
						</div>
						<div className="col-md-4">
							Praesent ornare neque dolor, id lobortis felis tincidunt quis. Donec ut commodo sapien, sit amet sollicitudin tellus. Donec feugiat suscipit bibendum.
						</div>
					</div>
				</div>
			</div>
		);
	}
}