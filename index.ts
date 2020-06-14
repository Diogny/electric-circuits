import { app, BrowserWindow, ipcMain, dialog } from "electron";
import * as path from "path";
import * as fs from 'fs';
import Store from "./src/store";
import { prop } from "src/utils";
//import { format as formatUrl } from 'url';

const isDevelopment = process.env.NODE_ENV !== 'production'

const args = process.argv.slice(1);
let
	serve = args.some(val => val === '--serve'),
	forceQuit = false;

if (serve) {
	require('electron-reload')(__dirname, {});
}


const store = new Store({
	// data file
	configName: 'user-preferences',
	defaults: {
		location: { x: 50, y: 50 },
		// default size of our main window
		windowBounds: { width: 1120, height: 800 }
	}
});
//https://cameronnokes.com/blog/how-to-store-user-data-in-electron/
//store:  <Current User>\AppData\Roaming\Electron\user-preferences.json
//console.log("store: ", store.path);

//https://www.electronjs.org/docs/tutorial/security
// global reference to mainWindow (necessary to prevent window from being garbage collected)
let mainWindow: Electron.BrowserWindow;

function createMainWindow(opt: any) {

	mainWindow = new BrowserWindow({
		x: opt.x || 50,
		y: opt.y || 50,
		width: opt.width || 1120,
		height: opt.height || 800,
		useContentSize: true,
		webPreferences: {
			nodeIntegration: true,
			enableRemoteModule: false,
			//preload: path.join(app.getAppPath(), "preload.js")
		},
		show: false,
	});

	mainWindow.once('ready-to-show', () => {
		mainWindow.show()
		mainWindow.focus()
	});

	let url = path.join(app.getAppPath(), "index.html");
	console.log('main index.html', url);
	mainWindow.loadFile(url);

	if (isDevelopment) {
		//uncomment for dev
		mainWindow.webContents.openDevTools()
	}

	mainWindow.webContents.on('devtools-opened', () => {
		mainWindow.focus()
		setImmediate(() => {
			mainWindow.focus()
		})
	})

	// Disable menu
	mainWindow.removeMenu();
}

app.on("ready", () => {
	// defaults if there wasn't anything saved
	let
		{ width, height } = store.get('windowBounds'),
		{ x, y } = store.get('location');

	createMainWindow({ x, y, width, height });
	//sendMainWindowSize(width, height);

	mainWindow.on('resize', () => {
		let { width, height } = mainWindow.getContentBounds(); //.getBounds();
		// save them
		store.set('windowBounds', { width, height });
		//send
		sendMainWindowSize(width, height);
	});

	mainWindow.on('move', () => {
		let pos = mainWindow.getPosition();
		store.set('location', { x: pos[0], y: pos[1] });
	});

	mainWindow.on("close", (e: MouseEvent) => {
		if (!forceQuit) {
			e.preventDefault();
			mainWindow.webContents.send("check-before-exit", {});
		}
	});

	mainWindow.on("closed", (e: any) => {
		mainWindow = <any>null;
	});
});

app.on("window-all-closed", () => {
	if (process.platform !== "darwin") {
		app.quit();
	}
});

app.on("activate", () => {
	if (mainWindow === null) {
		createMainWindow({});
	}
});

let
	_sharedObj = {
		app: {
			circuit: {
				modified: false
			}
		},
		templates: null
	};

Object.defineProperty(global, 'shared', {
	get() { return _sharedObj },
	set(value) {
		_sharedObj = value
	}
})

//https://medium.com/@nornagon/electrons-remote-module-considered-harmful-70d69500f31
//this's the recommended new way to communicate between main process and ui renderer
ipcMain.handle('shared', async (event, arg: string) => {
	let
		prop = global["shared"][arg];
	console.log(`shared.${arg} =` + JSON.stringify(prop))
	return prop;
});

ipcMain.handle('shared-data', async (event, arg: any[]) => {
	let
		nm = arg[0],
		value = arg[1];
	return prop(global["shared"], nm, value)
});

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.

function sendMainWindowSize(width: number, height: number) {
	//send
	mainWindow.webContents.send("win-resize", { width, height });
}

ipcMain.on('get-win-size', (event, arg) => {
	let
		data = mainWindow.getContentBounds() as any;
	//extra
	data.minSize = mainWindow.getMinimumSize();
	data.maxSize = mainWindow.getMaximumSize();
	data.contentSize = mainWindow.getContentSize();
	data.contentBounds = mainWindow.getContentBounds();
	//
	event.returnValue = data //.getBounds();
})

ipcMain.on('openFile', (event, path) => {
	dialog.showOpenDialog(mainWindow, {
		filters: [{ name: "Schematic", extensions: ["xml"] }],
		properties: ["openFile"]
	})
		.then((value) => {
			if (!value.canceled) {
				fs.readFile(value.filePaths[0], 'utf-8', (err: any, data: any) => {
					if (err) {
						event.returnValue = {
							error: true,
							message: err.message
						};
					} else {
						event.returnValue = {
							filepath: value.filePaths[0],
							data: data
						};
						//event.reply('fileData', data)
					}
				})
			} else
				event.returnValue = {
					canceled: true,
					message: "File Open Canceled"
				};
		}).catch(err => {
			event.returnValue = {
				error: true,
				message: err.message
			}
		})
})

ipcMain.on('saveFile', (event, arg) => {
	let
		options = <any>{
			filters: [{ name: "Schematic", extensions: ["xml"] }],
			properties: ["createDirectory"]
		};
	arg.filePath
		&& (options.defaultPath = arg.filePath);

	dialog.showSaveDialog(mainWindow, options)
		.then((value) => {
			if (!value.canceled) {
				fs.writeFile(<string>value.filePath, arg.data, (err: any) => {
					if (err) {
						event.returnValue = {
							error: true,
							message: err.message
						}
					} else
						event.returnValue = {
							filepath: value.filePath
						}
				})
			} else
				event.returnValue = {
					canceled: true,
					message: "File Save Canceled"
				}
		}).catch(err => {
			event.returnValue = {
				error: true,
				message: err.message
			}
		})
})

ipcMain.on('app-quit', (event, arg) => {
	forceQuit = true;
	mainWindow.close()
})

//this will contain the communication section...
ipcMain.on('asynchronous-message', (event, arg) => {
	console.log(arg) // prints "ping"
	event.reply('asynchronous-reply', 'pong')
})

ipcMain.on('synchronous-message', (event, arg) => {
	console.log(arg) // prints "ping"
	event.returnValue = 'pong'
})