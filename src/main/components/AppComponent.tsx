/// <reference path="../../typings/tsd.d.ts"/>
/// <reference path="../model/model.d.ts" />

import React = require('react');
import {DataSourceList} from './DataSourceList'
import {ChartRenderer} from './ChartRenderer'
import {NavBar} from './NavBar'
import {ApplicationTabs} from '../actions/AppConstants'
import {applicationStore as AppStore} from '../stores/ApplicationStore';

interface IAppComponentParams {
}
interface IAppComponentState {
	activeTab : ApplicationTabs;
}
export class AppComponent extends React.Component<IAppComponentParams,IAppComponentState> {
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
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}
}