import { app, BrowserWindow, ipcMain, dialog } from "electron";
import * as path from "path";
import * as fs from 'fs';
import Store from "./ts/store";
import { prop } from "./ts/utils";
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
let
	mainWindow: Electron.BrowserWindow,
	printWindow: Electron.BrowserWindow,
	helpWindow: Electron.BrowserWindow;

function createMainWindow(opt: any) {

	mainWindow = new BrowserWindow({
		x: opt.x || 50,
		y: opt.y || 50,
		width: opt.width || 1120,
		height: opt.height || 800,
		useContentSize: true,
		icon: path.join(app.getAppPath(), 'html/favicon.ico'),
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

	let url = path.join(app.getAppPath(), "html/index.html");
	console.log('main index.html', url);
	mainWindow.loadFile(url);

	if (isDevelopment) {
		//uncomment for not dev
		mainWindow.webContents.openDevTools()
	}

	mainWindow.webContents.on('devtools-opened', () => {
		mainWindow.focus()
		setImmediate(() => {
			mainWindow.focus()
		})
	})

	mainWindow.removeMenu();
}

function createPrintWindow(rect: { width: number, height: number }) {
	//printing window
	printWindow = new BrowserWindow({
		parent: mainWindow,
		modal: true,
		title: "Circuit Printing",
		center: true,
		width: rect.width,
		height: rect.height,
		useContentSize: true,
		webPreferences: {
			nodeIntegration: true,
			enableRemoteModule: false,
			nodeIntegrationInSubFrames: true,
		},
		show: false,
		//closable: false,
		minimizable: false,
		maximizable: false,
		fullscreenable: false,
		//thickFrame: false,
		resizable: false,
	});
	let
		url = path.join(app.getAppPath(), "html/print.html");

	printWindow.loadFile(url);
	printWindow.once('ready-to-show', () => {
		//printWindow.show();
	});
	printWindow.webContents.openDevTools();
	printWindow.on("closed", (e: any) => {
		printWindow = <any>null;
	});
	printWindow.removeMenu();
}

function createHelpWindow() {
	//printing window
	helpWindow = new BrowserWindow({
		parent: mainWindow,
		modal: true,
		title: "Circuit Help",
		center: true,
		width: 800,
		height: 500,
		minWidth: 800,
		minHeight: 500,
		//useContentSize: true,
		webPreferences: {
			nodeIntegration: true,
			enableRemoteModule: false,
			nodeIntegrationInSubFrames: true,
		},
		show: false,
		//closable: false,
		minimizable: false,
		maximizable: false,
		fullscreenable: false,
		//thickFrame: false,
		resizable: true,
	});
	let
		url = path.join(app.getAppPath(), "html/help.html");

	helpWindow.loadFile(url);
	helpWindow.once('ready-to-show', () => {
		//helpWindow.show();
		//helpWindow.webContents.openDevTools();
	});
	helpWindow.on("closed", (e: any) => {
		helpWindow = <any>null;
	});
	helpWindow.removeMenu();
}

app.on("ready", () => {
	let
		{ width, height } = store.get('windowBounds'),
		{ x, y } = store.get('location');

	createMainWindow({ x, y, width, height });

	mainWindow.on('resize', () => {
		let
			{ width, height } = mainWindow.getContentBounds();
		store.set('windowBounds', { width, height });
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
		printWindow = <any>null;
		helpWindow = <any>null;
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

function sendMainWindowSize(width: number, height: number) {
	mainWindow.webContents.send("win-resize", { width, height });
}

ipcMain.on('get-win-size', (event, arg) => {
	let
		data = mainWindow.getContentBounds() as any;
	data.minSize = mainWindow.getMinimumSize();
	data.maxSize = mainWindow.getMaximumSize();
	data.contentSize = mainWindow.getContentSize();
	data.contentBounds = mainWindow.getContentBounds();
	event.returnValue = data
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
							filePath: value.filePaths[0],
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
							filePath: value.filePath
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

let
	printData: any = {};

ipcMain.on('print-circuit', (event, arg) => {
	//console.log(arg);
	fs.writeFile(path.join(app.getAppPath(), "data/saved-svg.svg"), arg[1], function (err) {
		if (err) {
			event.returnValue = {
				error: true,
				message: err.message
			}
		} else {
			printData = arg[2];
			if (!printWindow)
				createPrintWindow(arg[0]);
			printWindow.show();
			event.returnValue = true;
		}
	})
})

ipcMain.on('print-svg', (event, arg) => {
	event.returnValue = printWindow
		? (printWindow.webContents.print({}, (sucess, failureReason) => {
			printWindow.webContents.send("after-print", {
				success: sucess,
				failureReason: failureReason
			})
		}), true)
		: false;
})

ipcMain.on('close-print-win', (event, arg) => {
	printWindow && (printWindow.close());
})

ipcMain.on('get-svg', (event, args) => {
	fs.readFile(path.join(app.getAppPath(), "data/saved-svg.svg"), {}, function (err, data: Buffer) {
		if (err) {
			event.returnValue = {
				error: true,
				message: err.message
			}
		} else {
			event.returnValue = {
				svg: data.toString(),
				rects: printData
			}
		}
	})
})

ipcMain.on('help-circuit', (event, arg) => {
	console.log(arg);
	if (!helpWindow)
		createHelpWindow();
	helpWindow.show();
	event.returnValue = "help is working...";
})

ipcMain.on('app-quit', (event, arg) => {
	forceQuit = true;
	mainWindow.close()
})
