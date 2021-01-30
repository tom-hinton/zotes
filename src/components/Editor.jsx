/****    IMPORTS    ****/
import React, { Component } from 'react'
import { ContentEditable } from './index.js'
import { parse } from '../utils/index.js'
const path = window.require('path')
const fs = window.require('fs').promises
const chokidar = window.require('chokidar')
const ipcRenderer = window.require('electron').ipcRenderer

// Constant (TODO: make dynamic)
const dirPath = '/users/tomhinton/Zettelkasten'



/****    UTILS    ****/
function clearWatcher(watcher) {
	const watchedFiles = watcher.getWatched()

	for (const [key, value] of Object.entries(watchedFiles)) {
		const dir = key
		value.forEach(filename => {
			watcher.unwatch(dir + '/' + filename)
		})
	}
}



/****    CLASS DEFINITION    ****/
export default class Editor extends Component {
	watcher = null

	constructor(props) {
		super(props)

		this.state = {
			value: '',
			filePath: ''
		}

		this.contentEditable = React.createRef()
		this.handleChange = this.handleChange.bind(this)
		this.fetchNote = this.fetchNote.bind(this)
	}

	fetchNote() {
		const { id } = this.props.match.params
		if (typeof parseInt(id) === 'number') {
			const filename = parseInt(id).toString() + '.txt'
			const filePath = dirPath + '/' + filename
			this.setState({ filePath })

			if (this.watcher === null) {
				this.watcher = chokidar.watch(filePath, {
					usePolling: true
				})
				.on('all', (eventType, filePath) => {
					if(eventType === 'add' || eventType === 'change') {
						fs.readFile(filePath, 'utf8')
						.then(file => this.setState({ value: file }))
					}
				})
			} else {
				this.watcher.add(filePath)
			}
		}
	}

	componentDidMount() {
		this.fetchNote()

		ipcRenderer.on('please-save-file', () =>
			ipcRenderer.invoke('save-file', this.state.filePath, this.state.value)
		)

	}

	componentDidUpdate(prevProps) {
		const { id } = this.props.match.params
		const prevId = prevProps.match.params.id

		if (id !== prevId && typeof parseInt(id) === 'number' && this.watcher !== null) {
			console.log('update', id, prevId)
			const prevFilename = parseInt(prevId).toString() + '.txt'
			const prevFilePath = dirPath + '/' + prevFilename

			clearWatcher(this.watcher)
			this.fetchNote()
		}
	}

	handleChange(e) {
		const markdown = parse.html(e.target.value)
		this.setState({ value: markdown })
	}

	render() {
		const html = parse.markdown(this.state.value)
		return <ContentEditable
			innerRef={this.contentEditable}
			html={html}
			onChange={this.handleChange} id="editor" />
	}
}