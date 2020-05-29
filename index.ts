import { app, BrowserWindow, Menu, ipcMain } from "electron";
import * as path from "path";
import Store from "./src/store";
//import { format as formatUrl } from 'url';

const isDevelopment = process.env.NODE_ENV !== 'production'

const args = process.argv.slice(1);
let
	serve = args.some(val => val === '--serve');
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

	const window = new BrowserWindow({
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

	window.once('ready-to-show', () => {
		window.show()
		window.focus()
	});

	// load the index.html of the app.
	let url = path.join(app.getAppPath(), "index.html");
	console.log('main index.html', url);
	window.loadFile(url);

	if (isDevelopment) {
		//window.webContents.openDevTools()
		//it's in the menu now, but for release it'd be removed and use this.
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
	//this's just an start ...
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
			{ role: 'toggleDevTools' },
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

	let
		menu = Menu.buildFromTemplate(template);
	Menu.setApplicationMenu(menu);
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", () => {
	// defaults if there wasn't anything saved
	let
		{ width, height } = store.get('windowBounds'),
		{ x, y } = store.get('location');

	mainWindow = createMainWindow({ x, y, width, height });
	//sendMainWindowSize(width, height);

	// The BrowserWindow class extends the node.js core EventEmitter class, so we use that API
	// to listen to events on the BrowserWindow. The resize event is emitted when the window size changes.
	mainWindow.on('resize', () => {
		// The event doesn't pass us the window size, so we call the `getBounds` method which returns an object with
		// the height, width, and x and y coordinates.
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
//this's the recommended new way to communicate between main process and ui renderer
ipcMain.handle('shared', async (event, arg: string) => {
	let
		prop = global["shared"][arg];
	return prop;
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

//this will contain the communication section...
ipcMain.on('asynchronous-message', (event, arg) => {
	console.log(arg) // prints "ping"
	event.reply('asynchronous-reply', 'pong')
})

ipcMain.on('synchronous-message', (event, arg) => {
	console.log(arg) // prints "ping"
	event.returnValue = 'pong'
})