import { app, BrowserWindow, Menu, ipcMain } from "electron";
import * as path from "path";
import Store from "./src/store";
//import { format as formatUrl } from 'url';

const isDevelopment = process.env.NODE_ENV !== 'production'

// First instantiate the class
const store = new Store({
	// We'll call our data file 'user-preferences'
	configName: 'user-preferences',
	defaults: {
		// 800x600 is the default size of our window
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
	// Create the browser window.
	const window = new BrowserWindow({
		height: opt.height || 800,
		webPreferences: {
			nodeIntegration: true,
			enableRemoteModule: false,
			//preload: path.join(app.getAppPath(), "preload.js")
		},
		width: opt.width || 1120,
		show: false,
	});

	window.once('ready-to-show', () => {
		window.show()
		window.focus()
	});

	/*
	window.readConfig = function () {
		const data = readFileSync('./config.json')
		return data
	}*/

	// and load the index.html of the app.
	let url = path.join(app.getAppPath(), "index.html");
	console.log('main index.html', url);
	window.loadFile(url);
	/*if (isDevelopment) {
		window.loadURL(`http://localhost:${process.env.ELECTRON_WEBPACK_WDS_PORT}`)
	}
	else {
		window.loadURL(formatUrl({
			pathname: path.join(__dirname, 'index.html'),
			protocol: 'file',
			slashes: true
		}));
	}
	//window.loadURL(`file://${__dirname}/index.html`)
*/

	if (isDevelopment) {
		window.webContents.openDevTools()
	}

	// Emitted when the window is closed.
	window.on("closed", () => {
		// Dereference the window object, usually you would store windows
		// in an array if your app supports multi windows, this is the time
		// when you should delete the corresponding element.
		mainWindow = <any>null;
	});

	window.webContents.on('devtools-opened', () => {
		window.focus()
		setImmediate(() => {
			window.focus()
		})
	})

	createMenu();

	return window;
}

function createMenu() {
	const template: Electron.MenuItemConstructorOptions[] = [{
		label: 'Edit',
		submenu: [
			{ role: 'undo' },
			{ role: 'redo' },
			{ type: 'separator' },
			{ role: 'cut' },
			{ role: 'copy' },
			{ role: 'paste' },
			{ role: 'delete' }
		]
	},
	{
		label: 'View',
		submenu: [
			{ role: 'reload' },
			{ type: 'separator' },
			{ type: 'separator' },
			{ role: 'togglefullscreen' }
		]
	},
	{ role: 'window', submenu: [{ role: 'minimize' }, { role: 'close' }] },
	{
		role: 'help',
		submenu: [{
			label: 'Learn More',
			click() {
				require('electron').shell.openExternal('https://electron.atom.io');
			}
		}]
	}
	];

	let menu = Menu.buildFromTemplate(template);
	Menu.setApplicationMenu(menu);
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", () => {
	// First we'll get our height and width. This will be the defaults if there wasn't anything saved
	let { width, height } = store.get('windowBounds');

	mainWindow = createMainWindow({ width, height });

	// The BrowserWindow class extends the node.js core EventEmitter class, so we use that API
	// to listen to events on the BrowserWindow. The resize event is emitted when the window size changes.
	mainWindow.on('resize', () => {
		// The event doesn't pass us the window size, so we call the `getBounds` method which returns an object with
		// the height, width, and x and y coordinates.
		let { width, height } = mainWindow.getBounds();
		// Now that we have them, save them using the `set` method.
		store.set('windowBounds', { width, height });
	});

});

// Quit when all windows are closed.
app.on("window-all-closed", () => {
	// On OS X it is common for applications and their menu bar
	// to stay active until the user quits explicitly with Cmd + Q
	if (process.platform !== "darwin") {
		app.quit();
	}
});

app.on("activate", () => {
	// On OS X it"s common to re-create a window in the app when the
	// dock icon is clicked and there are no other windows open.
	if (mainWindow === null) {
		mainWindow = createMainWindow({});
	}
});

let
	_sharedObj = {
		app: 5,
		templates: null
	};

Object.defineProperty(global, 'shared', {
	get() { return _sharedObj },
	set(value) {
		_sharedObj = value
	}
})

//https://medium.com/@nornagon/electrons-remote-module-considered-harmful-70d69500f31
ipcMain.handle('shared', async (event, arg: string) => {
	let
		prop = global["shared"][arg];
	return prop;
});

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
ipcMain.on('asynchronous-message', (event, arg) => {
	console.log(arg) // prints "ping"
	event.reply('asynchronous-reply', 'pong')
})

ipcMain.on('synchronous-message', (event, arg) => {
	console.log(arg) // prints "ping"
	event.returnValue = 'pong'
})