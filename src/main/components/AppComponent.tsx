/// <reference path="../../typings/tsd.d.ts"/>
/// <reference path="../model/model.d.ts" />

import React = require('react');
import {DataSourceList} from '../components/DataSourceList'

interface IAppComponentParams {
}
interface IAppComponentState {
}
export class AppComponent extends React.Component<IAppComponentParams,IAppComponentState> {
	render() {
		return (
			<div>
				<DataSourceList/>
			</div>
		);
	}
}