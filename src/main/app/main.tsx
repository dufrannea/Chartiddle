/// <reference path="../../typings/tsd.d.ts"/>
import React = require('react');
import {TodoList} from '../components/TodoList';

React.render(
	<TodoList/>,
	document.querySelector("#main"));