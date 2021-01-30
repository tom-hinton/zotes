import React, { Component } from 'react'
import { Switch, Route } from 'react-router-dom'
import { Editor } from './index'

export default class ViewManager extends Component {

	render() {
		return(
			<Switch>
				<Route path="/:id" component={Editor} />
			</Switch>
		)
	}
}