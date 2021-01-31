/****    IMPORTS    ****/
const { app, BrowserWindow, ipcMain, Menu, MenuItem } = require('electron')
const fs = require('fs').promises
const uniqid = require('uniqid')

const dirPath = '/users/tomhinton/Zettelkasten'


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
			label: 'Save',
			accelerator: process.platform === 'darwin' ? 'Cmd+S' : 'Ctrl+S',
			click: () => win.webContents.send('please-save-file')
		},
		{
			label: 'New Note',
			accelerator: process.platform === 'darwin' ? 'Cmd+N' : 'Ctrl+N',
			click: () => {
				const id = uniqid.time()
				const filePath = dirPath + '/' + id + '.txt'
				fs.writeFile(filePath, '', { encoding: 'utf8' })
				.then(() => win.webContents.send('new-file', id))
			}
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
			}
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
	const filePath = dirPath + '/' + fileId + '.txt'
	fs.unlink(filePath)
})