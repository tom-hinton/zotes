import React, { Component } from 'react'
import { ContentEditable } from './index.js'
import { parse } from '../utils/index.js'

export default class InlineMarkdownEditor extends Component {
	constructor(props) {
		super(props)

		this.contentEditable = React.createRef()
		this.handleChange = this.handleChange.bind(this)
	}

	handleChange(e) {
		const markdown = parse.html(e.target.value)
		this.props.onChange(markdown)
	}

	render() {
		const html = parse.markdown(this.props.value)
		return <ContentEditable
			innerRef={this.contentEditable}
			html={html}
			onChange={this.handleChange} id="editor" />
	}
}