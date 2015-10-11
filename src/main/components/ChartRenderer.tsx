/// <reference path="../../typings/tsd.d.ts"/>
/// <reference path="../model/model.d.ts" />

import React = require('react');
import {appActions as Actions} from '../actions/Actions'

interface IChartRendererParams {
}
interface IChartRendererState {
}

/**
 * Component that renders a chart.
 */
export class ChartRenderer extends React.Component<IChartRendererParams,IChartRendererState> {
	render() {
		return (
			<div>This is a chart</div>
		);
	}
}