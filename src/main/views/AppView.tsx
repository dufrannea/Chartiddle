/// <reference path="../../typings/tsd.d.ts"/>

import React = require('react');
import {HomeViewComponent} from './HomeView'
import {DataSourceList} from '../components/DataSourceList'
import {ChartRenderer} from '../components/ChartRenderer'
import {NavBar} from '../components/NavBar'
import {ApplicationTabs} from '../actions/AppConstants'
import {applicationStore as AppStore} from '../stores/ApplicationStore';

interface IAppViewComponentState {
	activeTab : ApplicationTabs;
}

export class AppViewComponent extends React.Component<Object, IAppViewComponentState> {
	constructor(){
		this.state = {
			activeTab : AppStore.getActiveTab()
		}
		super();
	}
	componentDidMount(){
		AppStore.registerChangeListener(this._onChange.bind(this));
	}
	_onChange(){
		this.setState({ 
			activeTab : AppStore.getActiveTab()
		});	
	}
	render() {
		let tabToRender = (()=>{
			switch (this.state.activeTab) {
				case ApplicationTabs.DATASOURCES_VIEW:
					return <DataSourceList/>
					break;
				case ApplicationTabs.CHART_VIEW:
					return <ChartRenderer/>
					break;
				default:
					return <div>Nothing!</div>
					break;
			}
		})()
		return (
			<div>
				<NavBar/>
				<div className="container-fluid">
					<div className="row">
						<div className="col-xs-12">
							<div>
								{tabToRender}
								{/* <HomeViewComponent /> */}
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}
}