/// <reference path="../../typings/tsd.d.ts"/>

import React = require('react');
import {HomeViewComponent} from './HomeView'
import {DataSourcesViewComponent} from '../views/DataSourcesView'
import {ChartViewComponent} from '../views/ChartView'
import {NavBar} from '../views/components/NavBar'
import {ApplicationTabs} from '../actions/AppConstants'
import {applicationStore as AppStore} from '../stores/ApplicationStore';

interface IAppViewComponentState {
	activeTab: ApplicationTabs;
}

export class AppViewComponent extends React.Component<Object, IAppViewComponentState> {
	constructor() {
		this.state = {
			activeTab: AppStore.getActiveTab()
		}
		super();
	}
	componentDidMount() {
		AppStore.registerChangeListener(this._onChange.bind(this));
	}
	_onChange() {
		this.setState({
			activeTab: AppStore.getActiveTab()
		});
	}
	render() {
		let tabToRender = (() => {
			switch (this.state.activeTab) {
				case ApplicationTabs.HOME_VIEW:
					return <HomeViewComponent/>
					break;
				case ApplicationTabs.DATASOURCES_VIEW:
					return <DataSourcesViewComponent/>
					break;
				case ApplicationTabs.CHART_EDITOR_VIEW:
					return <ChartViewComponent/>
					break;
				default:
					return <div>Nothing!</div>
					break;
			}
		})()
		return (
			<div>
				<NavBar/>
				{tabToRender}
				<footer id="footer">
					<div className="container">
						<span className="glyphicon glyphicon-copyright-mark" aria-hidden="true"></span>
						2015 Chartiddle Inc.
					</div>
				</footer>
			</div>
		);
	}
}