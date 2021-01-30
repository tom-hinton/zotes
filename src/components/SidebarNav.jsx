/****    IMPORTS    ****/
import React, { Component } from 'react'
import { NavLink } from 'react-router-dom'
const path = window.require('path')
const fs = window.require('fs').promises
const chokidar = window.require('chokidar')


export default class SidebarNav extends Component {

	constructor(props) {
		super(props)

		this.state = {
			notes: []
		}
	}

	componentDidMount() {
		const dirPath = '/users/tomhinton/Zettelkasten'

		// Start watching file system
		const watcher = chokidar.watch(dirPath, {
			usePolling: true,
			ignored: /(^|[\/\\])\../
		})

		// Add file
		.on('add', filePath =>
			fs.readFile(filePath, 'utf8')
			.then(file => {
				return {
					id: path.parse(filePath).name,
					snippet: file.substring(0, 50)
				}
			})
			.then(note => this.setState(prevState => {
				const newState = prevState
				newState.notes.push(note)
				return newState
			}))
		)

		// Change (not rename) file
		.on('change', filePath =>{
			fs.readFile(filePath, 'utf8')
			.then(file => {
				return {
					id: path.parse(filePath).name,
					snippet: file.substring(0, 50)
				}
			})
			.then(note => this.setState( prevState => {
				const newState = prevState
				const index = newState.notes.findIndex((i) => i.id === note.id)
				newState.notes[index] = note
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

		// Save watcher
		this.setState({ watcher })
	}

	render() {
		return (
			<div id="nav-items">{
				this.state.notes.map((note) =>
					<NavLink key={note.id} to={'/' + note.id} className="nav-item">{note.snippet}</NavLink>
				)
			}</div>
		)
	}
}