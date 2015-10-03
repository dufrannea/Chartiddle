/// <reference path="../../typings/tsd.d.ts"/>
import React = require('react');

class Application extends React.Component<any,any>{
	render(){
		return <div>Hello lads</div>
	}
}

React.render(<Application/>, document.querySelector("#main"));