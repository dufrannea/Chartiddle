import {AppViewComponent} from '../views/AppView'
import React = require('react');
import {render } from "react-dom";

/**
 * Renders the main application component.
 */
export function startReact(){
	let mainElement = document.querySelector("#main");
	
	render(
		<AppViewComponent/>,
		mainElement
	);
}