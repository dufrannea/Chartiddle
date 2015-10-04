/// <reference path="../../typings/tsd.d.ts"/>
import React = require('react');

interface ITestComponentParams {
	name : string;
}
interface ITestComponentState {
}
export class TestComponent extends React.Component<ITestComponentParams,ITestComponentState> {
	render() {
		return (
			<div>This is a custom component {this.props.name}</div>
		);
	}
}