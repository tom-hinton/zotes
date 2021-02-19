/****    IMPORTS    ****/
import React, { Component } from 'react'
import { NavLink, Redirect, withRouter } from 'react-router-dom'
import _ from 'underscore'
const path = window.require('path')
const fs = window.require('fs').promises
const chokidar = window.require('chokidar')
const { remote, ipcRenderer } = window.require('electron')
const { Menu, MenuItem } = remote
const Preferences = window.require('./src/preferences.js')


class SidebarNav extends Component {

	constructor(props) {
		super(props)

		this.state = {
			notes: [],
			search: '',
			redirectId: ''
		}

		this.handleSearchChange = this.handleSearchChange.bind(this)
	}

	handleContextMenu(e) {
		e.preventDefault()
		const noteid = e.target.getAttribute('data-noteid')
		const menu = new Menu()
		menu.append(new MenuItem({
			label: 'Copy ID',
			click: () => navigator.clipboard.writeText(noteid)
		}))
		menu.append(new MenuItem({
			label: 'Copy link',
			click: () => navigator.clipboard.writeText(`[](${noteid})`)
		}))
		menu.append(new MenuItem({
			label: 'Delete Note',
			click: () => ipcRenderer.invoke('delete-file', noteid)
		}))
		menu.popup({ window: remote.getCurrentWindow() })
	}

	handleSearchChange(e) {
		this.setState({ search: e.target.value })
	}

	componentDidMount() {

		// Start watching file system
		const watcher = chokidar.watch(Preferences.get('zotesDir') + '/*.txt', {
			usePolling: true,
			ignored: /(^|[\/\\])\../,
			alwaysStat: true
		})

		// Add file
		.on('add', (filePath, stats) => {
			fs.readFile(filePath, 'utf8')
			.then(file => {
				return {
					id: path.parse(filePath).name,
					snippet: file.substring(0, 35),
					modifiedMs: stats.mtimeMs
				}
			})
			.then(note => this.setState(prevState => {
				const newState = prevState
				newState.notes.push(note)
				newState.notes = _.sortBy(newState.notes, 'modifiedMs').reverse()
				return newState
			}))
		})

		// Change (not rename) file
		.on('change', (filePath, stats) => {
			fs.readFile(filePath, 'utf8')
			.then(file => {
				return {
					id: path.parse(filePath).name,
					snippet: file.substring(0, 35),
					modifiedMs: stats.mtimeMs
				}
			})
			.then(note => this.setState( prevState => {
				const newState = prevState
				const index = newState.notes.findIndex((i) => i.id === note.id)
				newState.notes.splice(index, 1)[0]
				newState.notes.unshift(note)
				return newState
			}))
		})

		// Delete file
		.on('unlink', filePath => {
			const id = path.parse(filePath).name
			const index = this.state.notes.findIndex((i) => i.id === id)
			this.setState(prevState => {
				const newState = prevState
				newState.notes.splice(index, 1)
				return newState
			})
		})

		.on('error', err => console.log('chokidar error', err))

		// Save watcher
		this.setState({ watcher })

		// Navigation
		ipcRenderer.on('navigate-down', () => {
			let { notes, search } = this.state
			notes = this.filterNotes(notes, search)
			const currentId = this.props.location.pathname.substring(1)
			const currentIndex = notes.findIndex((note) => note.id === currentId)
			if(!!notes[currentIndex + 1]) {
				this.setState({ redirectId: notes[currentIndex + 1].id })
			}
		})
		ipcRenderer.on('navigate-up', () => {
			let { notes, search } = this.state
			notes = this.filterNotes(notes, search)
			const currentId = this.props.location.pathname.substring(1)
			const currentIndex = notes.findIndex((note) => note.id === currentId)
			if(!!notes[currentIndex - 1]) {
				this.setState({ redirectId: notes[currentIndex - 1].id })
			}
		})

		// Enable search
		ipcRenderer.on('activate-search', () => document.getElementById('search').focus())

		window.searchNotes = (query) => {
			this.setState({ search: query })
			document.getElementById('search').focus()
		}
	}

	componentDidUpdate() {
		const id = this.props.location.pathname.substring(1)
		const { redirectId } = this.state
		if(redirectId !== '' && redirectId === id) {
			this.setState({ redirectId: '' })
		}
	}

	filterNotes(notes, search) {
		if(typeof search === 'string' && search !== '') {
			// console.log({ notes, search})
			return notes = _.filter(notes, (note) =>
				( note.snippet.toLowerCase().indexOf( search.toLowerCase() ) >= 0 ) ||
				( note.id.toLowerCase().indexOf( search.toLowerCase() ) >= 0 )
			)
		}
		return notes
	}

	render() {
		let { notes, search, redirectId } = this.state
		if(typeof redirectId === 'string' && redirectId !== '') {
			return <Redirect to={'/' + redirectId} />
		}

		notes = this.filterNotes(notes, search)

		return (
			<>
				<input type="text" id="search" placeholder="Search" value={this.state.search} onChange={this.handleSearchChange} />
				<div id="nav-items">{
					notes.map((note) =>
						<NavLink key={note.id} data-noteid={note.id} to={'/' + note.id} className="nav-item" onContextMenu={this.handleContextMenu}>{note.snippet || '...'}</NavLink>
					)
				}</div>
			</>
		)
	}
}

export default withRouter(SidebarNav)
