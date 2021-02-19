const electron = require('electron')
const app = electron.app || electron.remote.app
const path = require('path')
const fs = require('fs')

console.log('electron', typeof electron)

class Preferences {
	constructor(opts) {
		const userDataPath = app.getPath('userData')
		this.path = path.join(userDataPath, opts.configName + '.json')
		// fs.writeFile(this.path, JSON.stringify({}), {
		// 	encoding: 'utf8',
		// 	flag: 'wx'
		// }, (err) => {
		// 	if(err) throw err
		// 	console.log(`Saved to ${this.path}`)
		// })
		this.defaults = opts.defaults
		this.data = parseDataFile(this.path, opts.defaults)

	}

	get(key) {
		return this.data[key] || this.defaults[key]
	}
	set(key, val) {
		this.data[key] = val;
		fs.writeFileSync(this.path, JSON.stringify(this.data))
	}
}

function parseDataFile(filePath, defaults) {
	try {
		return JSON.parse(fs.readFileSync(filePath));
	} catch(error) {
		console.log('error parsing data file')
		return defaults
	}
}

const preferences = new Preferences({
	configName: 'user-preferences',
	defaults: {
		zotesDir: path.join(app.getPath('home'), 'Zotes')
	}
})

// expose the class
module.exports = preferences