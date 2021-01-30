import React, { Component } from 'react'
import { Switch, Route } from 'react-router-dom'
import { InlineMarkdownEditor } from './index'

export default class ViewManager extends Component {
	constructor(props) {
		super(props)

		this.state = {
			value: '## This is a heading\nHere we have some body text **in bold** and *in italic.\nAnd finally*, **another** paragraph **here.\nindented # Oops! Another heading\n### Where are these coming from?'
		}

		this.handleChange = this.handleChange.bind(this)
	}

	handleChange(value) {
		this.setState({ value })
	}

	render() {
		return(
			<Switch>
				<Route path="/test">This is interesting</Route>
				<Route path="/">
					<InlineMarkdownEditor value={this.state.value} onChange={this.handleChange} />
				</Route>
			</Switch>
		)
	}
}