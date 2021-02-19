/****    IMPORTS    ****/
const { app, BrowserWindow, ipcMain, Menu, MenuItem, dialog } = require('electron')
const fs = require('fs').promises
const path = require('path')
const uniqid = require('uniqid')
const Preferences = require('./preferences.js')


/****    WINDOWS    ****/
let win
function createWindow () {
	const crwin = new BrowserWindow({
		width: 800,
		height: 600,
		webPreferences: {
			nodeIntegration: true,
			enableRemoteModule: true
		}
	})
	crwin.webContents.openDevTools()
	crwin.loadURL('http://localhost:1212/')
	return crwin
}

// Listeners
app.whenReady().then(() => {
	win = createWindow()

	// menu
	const menu = new Menu()
	menu.append(new MenuItem({ role: 'appMenu' }))
	menu.append(new MenuItem({
		submenu: [{
			label: 'Select Folder',
			click: () => {
				dialog.showOpenDialog(win, {
					properties: ['openDirectory']
				}).then(result => {
					if(!result.canceled) {
						Preferences.set('zotesDir', result.filePaths[0])
					}
				})
			}
		},
		{
			label: 'New Note',
			accelerator: process.platform === 'darwin' ? 'Cmd+N' : 'Ctrl+N',
			click: () => {
				const id = uniqid.time()
				const filePath = Preferences.get('zotesDir') + '/' + id + '.txt'
				fs.writeFile(filePath, '', { encoding: 'utf8' })
				.then(() => win.webContents.send('new-file', id))
			}
		},
		{
			label: 'Save Note',
			accelerator: process.platform === 'darwin' ? 'Cmd+S' : 'Ctrl+S',
			click: () => win.webContents.send('please-save-file')
		}],
		label: 'File',
		// role: 'fileMenu'
	}))
	menu.append(new MenuItem({ role: 'editMenu' }))
	menu.append(new MenuItem({
		label: 'View',
		submenu: [
			{ role: 'reload'},
			{ role: 'toggleDevTools'},
			{ type: 'separator' },
			{
				label: 'Search Notes',
				accelerator: process.platform === 'darwin' ? 'Cmd+L' : 'Ctrl+L',
				click: () => win.webContents.send('activate-search')
			},
			{ type: 'separator' },
			{
				label: 'Note Below',
				accelerator: process.platform === 'darwin' ? 'Cmd+Option+Down' : 'Ctrl+Down',
				click: () => win.webContents.send('navigate-down')
			},
			{
				label: 'Note Above',
				accelerator: process.platform === 'darwin' ? 'Cmd+Option+Up' : 'Ctrl+Up',
				click: () => win.webContents.send('navigate-up')
			},
		]
	}))
	Menu.setApplicationMenu(menu)

})
app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit()
	}
})
app.on('activate', () => {
	if (BrowserWindow.getAllWindows().length === 0) {
		win = createWindow()
	}
})



/****    IPC MAIN    ****/
ipcMain.handle('save-file', (event, filePath, data) =>
	fs.writeFile(filePath, data, { encoding: 'utf8' })
)
ipcMain.handle('delete-file', (event, fileId) => {
	const filePath = Preferences.get('zotesDir') + '/' + fileId + '.txt'
	fs.unlink(filePath)
})
