/// <reference path="../../../typings/tsd.d.ts"/>
import React = require('react');
import {applicationStore as AppStore} from '../../stores/ApplicationStore'
import {NavigationActions} from '../../actions/NavigationActions'
interface INavBarParams { 
}
interface INavBarState {
}
export class NavBar extends React.Component<INavBarParams,INavBarState> {
	constructor(){
		this.state = {};
		super();
	}
	render() {
		return (
				<nav className="navbar navbar-inverse">
					<div className="container-fluid">
						<div className="navbar-header">
							<a className="navbar-brand" href="#/datasources">Chartiddle</a>
						</div>
					</div>
				</nav>
		);
	}
	componentDidMount(){
		AppStore.registerChangeListener(this._onChange.bind(this));
	}
	_onChange(){
		this.setState({});
	}
}