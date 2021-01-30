import React from 'react'
import './App.global.css'
import { BrowserRouter as Router } from 'react-router-dom'
import { SidebarNav, ViewManager } from './components/index.js'

export default function App(props) {
	return (
		<Router>
			<aside id="sidebar">
				<SidebarNav />
			</aside>
			<main id="main">
				<ViewManager />
			</main>
		</Router>
	)
}