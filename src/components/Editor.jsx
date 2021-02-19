/****    IMPORTS    ****/
import React, { Component } from 'react'
import { ContentEditable } from './index.js'
import { parse } from '../utils/index.js'
import { Redirect } from 'react-router-dom'
const path = window.require('path')
const fs = window.require('fs').promises
const chokidar = window.require('chokidar')
const ipcRenderer = window.require('electron').ipcRenderer
const Preferences = window.require('./src/preferences.js')



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
			filePath: '',
			redirectId: null,
			modifiedMs: 0
		}

		this.contentEditable = React.createRef()
		this.handleChange = this.handleChange.bind(this)
		this.fetchNote = this.fetchNote.bind(this)
	}

	fetchNote() {
		const { id } = this.props.match.params
		if (typeof id === 'string') {
			const filename = id + '.txt'
			const filePath = Preferences.get('zotesDir') + '/' + filename

			if (this.watcher === null) {
				this.watcher = chokidar.watch(filePath, {
					usePolling: true,
					alwaysStat: true
				})
				.on('all', (eventType, filePath, stat) => {
					if(eventType === 'add' || eventType === 'change') {
						fs.readFile(filePath, 'utf8')
						.then(file => this.setState({
							value: file,
							filePath,
							redirectId: null
						}))
					}
				})
			} else {
				this.watcher.add(filePath)
			}
		}
	}

	componentDidMount() {
		this.fetchNote()

		ipcRenderer.on('please-save-file', () =>{
			// console.log(this.state)
			ipcRenderer.invoke('save-file', this.state.filePath, this.state.value)
		})
		ipcRenderer.on('new-file', (event, id) => {
			this.setState({ redirectId: id })
		})

		window.handleInternalLink = (redirectId) => this.setState({ redirectId })
	}

	componentDidUpdate(prevProps) {
		const { id } = this.props.match.params
		const prevId = prevProps.match.params.id

		// console.log('update', id, prevId)
		if (id !== prevId && typeof id === 'string' && this.watcher !== null) {
			const prevFilename = prevId + '.txt'
			const prevFilePath = Preferences.get('zotesDir') + '/' + prevFilename

			clearWatcher(this.watcher)
			this.fetchNote()
		}
	}

	handleChange(e) {
		const markdown = parse.html(e.target.value)
		this.setState({ value: markdown })
	}

	render() {
		if (typeof this.state.redirectId === 'string') {
			return <Redirect to={'/' + this.state.redirectId} />
		}
		const html = parse.markdown(this.state.value)
		return <ContentEditable
			innerRef={this.contentEditable}
			html={html}
			onChange={this.handleChange} id="editor" />
	}
}