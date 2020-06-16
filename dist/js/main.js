"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var electron_1 = require("electron");
var path = require("path");
var fs = require("fs");
var store_1 = require("./store");
var utils_1 = require("src/utils");
//import { format as formatUrl } from 'url';
var isDevelopment = process.env.NODE_ENV !== 'production';
var args = process.argv.slice(1);
var serve = args.some(function (val) { return val === '--serve'; }), forceQuit = false;
if (serve) {
    require('electron-reload')(__dirname, {});
}
var store = new store_1.default({
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
var mainWindow;
function createMainWindow(opt) {
    mainWindow = new electron_1.BrowserWindow({
        x: opt.x || 50,
        y: opt.y || 50,
        width: opt.width || 1120,
        height: opt.height || 800,
        useContentSize: true,
        icon: path.join(electron_1.app.getAppPath(), 'html/favicon.ico'),
        webPreferences: {
            nodeIntegration: true,
            enableRemoteModule: false,
        },
        show: false,
    });
    mainWindow.once('ready-to-show', function () {
        mainWindow.show();
        mainWindow.focus();
    });
    var url = path.join(electron_1.app.getAppPath(), "html/index.html");
    console.log('main index.html', url);
    mainWindow.loadFile(url);
    if (isDevelopment) {
        //uncomment for not dev
        mainWindow.webContents.openDevTools();
    }
    mainWindow.webContents.on('devtools-opened', function () {
        mainWindow.focus();
        setImmediate(function () {
            mainWindow.focus();
        });
    });
    mainWindow.removeMenu();
}
electron_1.app.on("ready", function () {
    var _a = store.get('windowBounds'), width = _a.width, height = _a.height, _b = store.get('location'), x = _b.x, y = _b.y;
    createMainWindow({ x: x, y: y, width: width, height: height });
    //sendMainWindowSize(width, height);
    mainWindow.on('resize', function () {
        var _a = mainWindow.getContentBounds(), width = _a.width, height = _a.height;
        // save them
        store.set('windowBounds', { width: width, height: height });
        //send
        sendMainWindowSize(width, height);
    });
    mainWindow.on('move', function () {
        var pos = mainWindow.getPosition();
        store.set('location', { x: pos[0], y: pos[1] });
    });
    mainWindow.on("close", function (e) {
        if (!forceQuit) {
            e.preventDefault();
            mainWindow.webContents.send("check-before-exit", {});
        }
    });
    mainWindow.on("closed", function (e) {
        mainWindow = null;
    });
});
electron_1.app.on("window-all-closed", function () {
    if (process.platform !== "darwin") {
        electron_1.app.quit();
    }
});
electron_1.app.on("activate", function () {
    if (mainWindow === null) {
        createMainWindow({});
    }
});
var _sharedObj = {
    app: {
        circuit: {
            modified: false
        }
    },
    templates: null
};
Object.defineProperty(global, 'shared', {
    get: function () { return _sharedObj; },
    set: function (value) {
        _sharedObj = value;
    }
});
//https://medium.com/@nornagon/electrons-remote-module-considered-harmful-70d69500f31
//this's the recommended new way to communicate between main process and ui renderer
electron_1.ipcMain.handle('shared', function (event, arg) { return __awaiter(void 0, void 0, void 0, function () {
    var prop;
    return __generator(this, function (_a) {
        prop = global["shared"][arg];
        console.log("shared." + arg + " =" + JSON.stringify(prop));
        return [2 /*return*/, prop];
    });
}); });
electron_1.ipcMain.handle('shared-data', function (event, arg) { return __awaiter(void 0, void 0, void 0, function () {
    var nm, value;
    return __generator(this, function (_a) {
        nm = arg[0], value = arg[1];
        return [2 /*return*/, utils_1.prop(global["shared"], nm, value)];
    });
}); });
function sendMainWindowSize(width, height) {
    mainWindow.webContents.send("win-resize", { width: width, height: height });
}
electron_1.ipcMain.on('get-win-size', function (event, arg) {
    var data = mainWindow.getContentBounds();
    //extra
    data.minSize = mainWindow.getMinimumSize();
    data.maxSize = mainWindow.getMaximumSize();
    data.contentSize = mainWindow.getContentSize();
    data.contentBounds = mainWindow.getContentBounds();
    //
    event.returnValue = data; //.getBounds();
});
electron_1.ipcMain.on('openFile', function (event, path) {
    electron_1.dialog.showOpenDialog(mainWindow, {
        filters: [{ name: "Schematic", extensions: ["xml"] }],
        properties: ["openFile"]
    })
        .then(function (value) {
        if (!value.canceled) {
            fs.readFile(value.filePaths[0], 'utf-8', function (err, data) {
                if (err) {
                    event.returnValue = {
                        error: true,
                        message: err.message
                    };
                }
                else {
                    event.returnValue = {
                        filePath: value.filePaths[0],
                        data: data
                    };
                    //event.reply('fileData', data)
                }
            });
        }
        else
            event.returnValue = {
                canceled: true,
                message: "File Open Canceled"
            };
    }).catch(function (err) {
        event.returnValue = {
            error: true,
            message: err.message
        };
    });
});
electron_1.ipcMain.on('saveFile', function (event, arg) {
    var options = {
        filters: [{ name: "Schematic", extensions: ["xml"] }],
        properties: ["createDirectory"]
    };
    arg.filePath
        && (options.defaultPath = arg.filePath);
    electron_1.dialog.showSaveDialog(mainWindow, options)
        .then(function (value) {
        if (!value.canceled) {
            fs.writeFile(value.filePath, arg.data, function (err) {
                if (err) {
                    event.returnValue = {
                        error: true,
                        message: err.message
                    };
                }
                else
                    event.returnValue = {
                        filePath: value.filePath
                    };
            });
        }
        else
            event.returnValue = {
                canceled: true,
                message: "File Save Canceled"
            };
    }).catch(function (err) {
        event.returnValue = {
            error: true,
            message: err.message
        };
    });
});
electron_1.ipcMain.on('app-quit', function (event, arg) {
    forceQuit = true;
    mainWindow.close();
});
//this will contain the communication section...
electron_1.ipcMain.on('asynchronous-message', function (event, arg) {
    console.log(arg); // prints "ping"
    event.reply('asynchronous-reply', 'pong');
});
electron_1.ipcMain.on('synchronous-message', function (event, arg) {
    console.log(arg); // prints "ping"
    event.returnValue = 'pong';
});
//# sourceMappingURL=main.js.map