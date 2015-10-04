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
				<input type="submit" onClick={this._handleDeleteAllDone.bind(this)} value="Clear all done"/>
			</div>
		);
	}
	
	_handleDeleteAllDone(){
		Actions.deleteAllDone();
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
		this.state = {
			editing : false
		};
		
		super();
	}
	render() {
		return (
			<li>
				{ this.state.editing ?
						<input type="text" ref="theinput" defaultValue={this.props.todo.name}/>
				    :
						<span>{this.props.todo.name}</span>
				}
				<input type="checkbox" checked={this.props.todo.done} onChange={this._handleToggleDone.bind(this)}/>
				{ this.state.editing ?
						<input type="submit" value='Save' onClick={this._handleDoneEditing.bind(this)}/>
				    :
						<input type="submit" value='Edit' onClick={this._handleClickEdit.bind(this)}/>
				}
				<input type="submit" value="Delete" onClick={this._handleClickDelete.bind(this)}/>
			</li>
		);
	}
	
	_handleDoneEditing(event, target){
		Actions.updateTodoName(this.props.todo.id, this.refs['theinput']['getDOMNode']().value);
		this.setState({
			editing : false
		});
	}
	
	_handleClickDelete(){
		Actions.deleteTodo(this.props.todo.id);
	}
	
	_handleClickEdit(){
		this.setState({
			editing : true
		});	
	}
	
	_handleToggleDone(){
		Actions.toggleTodoDone(this.props.todo.id);
	}
}