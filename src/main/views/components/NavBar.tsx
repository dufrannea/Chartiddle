import * as  React from 'react';
import {applicationStore as AppStore} from '../../stores/ApplicationStore'
import {NavigationActions} from '../../actions/NavigationActions'
import {ApplicationTabs} from '../../actions/AppConstants'
interface INavBarParams { 
}
interface INavBarState {
}
export class NavBar extends React.Component<INavBarParams,INavBarState> {
	constructor(){
		super();
		this.state = {};
	}
	
	getNavbarClassName() {
		var classes = "navbar navbar-default";
		if (AppStore.getActiveTab() == ApplicationTabs.HOME_VIEW) {
			classes += " navbar-home";
		}
		return classes;
	}
	
	getTabClassName(tab: ApplicationTabs) {
		if (tab == AppStore.getActiveTab()) {
			return "active";
		}
		return null;
	}
	
	getBrandLink() {
		if (AppStore.getActiveTab() != ApplicationTabs.HOME_VIEW) {
			return (<a className="navbar-brand" href="#/home">Chartiddle</a>);
		}
		return null;
	}
	
	render() {
		return (
				<nav className={this.getNavbarClassName()} role="navigation">
					<div className="container">
						<div className="navbar-header">
							<button type="button" className="navbar-toggle collapsed" data-toggle="collapse" data-target="#main-navbar" aria-expanded="false">
								<span className="sr-only">Toggle navigation</span>
								<span className="icon-bar"></span>
								<span className="icon-bar"></span>
								<span className="icon-bar"></span>
							</button>
							{this.getBrandLink()}
						</div>
						<div id="main-navbar" className="collapse navbar-collapse">
							<ul className="nav navbar-nav navbar-right">
								<li className={this.getTabClassName(ApplicationTabs.DATASOURCES_VIEW)}><a href="#/datasources">Datasources</a></li>
								<li className={this.getTabClassName(ApplicationTabs.CHART_EDITOR_VIEW)}><a href="#/charts">Charts</a></li>
							</ul>
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