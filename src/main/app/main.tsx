/// <reference path="../../typings/tsd.d.ts"/>
import React = require('react');
import {TestComponent} from '../components/TestComponent'

class Application extends React.Component<any,any>{
	render(){
		return <div><TestComponent name="hello" /></div>
	}
}

React.render(
	<Application/>,
	document.querySelector("#main"));