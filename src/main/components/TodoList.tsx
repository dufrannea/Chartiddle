/// <reference path="../../typings/tsd.d.ts"/>
/// <reference path="../model/model.d.ts"/>
import React = require('react');
import {appStore} from '../stores/AppStore';
import {appActions as Actions} from '../infrastructure/Actions'

interface ITodoListParams {
}

interface ITodoListState {
	todos: Todo[];
}

/**
 * State belongs to the store.
 * Though it is copied here
 */
export class TodoList extends React.Component<ITodoListParams, ITodoListState> {
	constructor(props) {
		super(props);
		this.state = {
			todos : appStore.getAll()
		};
	}
	
	componentDidMount() {
		appStore.registerChangeListener(this._onChange.bind(this));
	}
	
	componentWillUnmount() {
		// appStore.registerChangeListener(this._onChange.bind(this));
	}
	
	_onChange(){
		this.setState({
			todos : appStore.getAll()
		});
	}

	render() {
		let todoComps = this.state.todos.map(x=> <TodoItem key={x.id} todo={x} />)
		return (
			<div>
				<div className="todo-list">
					<ul>{todoComps}</ul>
				</div>
				<input type="submit" onClick={this._handleClick.bind(this)} value="Add Todo"/>
			</div>
		);
	}
	
	_handleClick(){
		Actions.createTodo();
	}
}

interface ITodoItemParams {
	todo: Todo;
	key : any;
}
interface ITodoItemState {
	editing : boolean;
}

/**
 * Completely stateless guy.
 */
class TodoItem extends React.Component<ITodoItemParams, ITodoItemState> {
	constructor(){
		// no editing by default.
		this.setState({
			editing :false
		});
		
		super();
	}
	render() {
		return (
			<li>
				<span>{this.props.todo.name}</span>
				<input type="checkbox" checked={this.props.todo.done} onChange={this.handleClick.bind(this)}/>
			</li>
		);
	}
	
	handleClick(){
		Actions.toggleTodoDone(this.props.todo.id);
	}
}