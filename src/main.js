/****    IMPORTS    ****/
const { app, BrowserWindow, ipcMain } = require('electron')



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
}

//Listeners
app.whenReady().then(createWindow)
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