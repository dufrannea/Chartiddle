/// <reference path="../../../typings/tsd.d.ts"/>
import React = require('react');
import {applicationStore as AppStore} from '../../stores/ApplicationStore'
import {appActions as Actions} from '../../actions/Actions'
interface INavBarParams { 
}
interface INavBarState {
}
export class NavBar extends React.Component<INavBarParams,INavBarState> {
	constructor(){
		this.state = {};
		super();
	}
	__handleMainClick(){
		Actions.navigateDataSourcesList();
	}
	render() {
		return (
				<nav className="navbar navbar-inverse">
					<div className="container-fluid">
						<div className="navbar-header">
							<a className="navbar-brand" href="#" onClick={this.__handleMainClick}>Chartiddle</a>
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