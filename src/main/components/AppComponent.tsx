/// <reference path="../../typings/tsd.d.ts"/>
/// <reference path="../model/model.d.ts" />

import React = require('react');
import {DataSourceList} from '../components/DataSourceList'

enum ApplicationTabs {
	DATASOURCES_VIEW
}

interface IAppComponentParams {
}
interface IAppComponentState {
	activeTab : ApplicationTabs;
}
export class AppComponent extends React.Component<IAppComponentParams,IAppComponentState> {
	constructor(){
		this.state = {
			activeTab : ApplicationTabs.DATASOURCES_VIEW
		}
		super();
	}
	render() {
		return (
			<div>
				<DataSourceList/>
			</div>
		);
	}
}