/// <reference path="../../typings/tsd.d.ts"/>
/// <reference path="../model/model.d.ts" />

import {AppComponent} from '../components/AppComponent'
import React = require('react');

export function startReact(){
	let mainElement = document.querySelector("#main");
	
	React.render(
		<AppComponent/>,
		mainElement
	);
}