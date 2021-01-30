/****    IMPORTS    ****/
const { app, BrowserWindow, ipcMain, Menu, MenuItem } = require('electron')
const fs = require('fs').promises



/****    WINDOWS    ****/
function createWindow () {
	const win = new BrowserWindow({
		width: 800,
		height: 600,
		webPreferences: {
			nodeIntegration: true
		}
	})
	win.webContents.openDevTools()
	win.loadURL('http://localhost:1212/')
	return win
}

// Listeners
app.whenReady().then(() => {
	const win = createWindow()

	// menu
	const menu = new Menu()
	menu.append(new MenuItem({
		submenu: [{
			label: 'Save',
			accelerator: process.platform === 'darwin' ? 'Cmd+S' : 'Ctrl+S',
			click: () => win.webContents.send('please-save-file')
		}],
		role: 'fileMenu'
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
		createWindow()
	}
})



/****    IPC MAIN    ****/
ipcMain.handle('save-file', (event, filePath, data) =>
	fs.writeFile(filePath, data, { encoding: 'utf8' })
)