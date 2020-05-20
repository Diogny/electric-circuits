/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./index.ts");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./index.ts":
/*!******************!*\
  !*** ./index.ts ***!
  \******************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\r\nvar __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {\r\n    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }\r\n    return new (P || (P = Promise))(function (resolve, reject) {\r\n        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }\r\n        function rejected(value) { try { step(generator[\"throw\"](value)); } catch (e) { reject(e); } }\r\n        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }\r\n        step((generator = generator.apply(thisArg, _arguments || [])).next());\r\n    });\r\n};\r\nvar __generator = (this && this.__generator) || function (thisArg, body) {\r\n    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;\r\n    return g = { next: verb(0), \"throw\": verb(1), \"return\": verb(2) }, typeof Symbol === \"function\" && (g[Symbol.iterator] = function() { return this; }), g;\r\n    function verb(n) { return function (v) { return step([n, v]); }; }\r\n    function step(op) {\r\n        if (f) throw new TypeError(\"Generator is already executing.\");\r\n        while (_) try {\r\n            if (f = 1, y && (t = op[0] & 2 ? y[\"return\"] : op[0] ? y[\"throw\"] || ((t = y[\"return\"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;\r\n            if (y = 0, t) op = [op[0] & 2, t.value];\r\n            switch (op[0]) {\r\n                case 0: case 1: t = op; break;\r\n                case 4: _.label++; return { value: op[1], done: false };\r\n                case 5: _.label++; y = op[1]; op = [0]; continue;\r\n                case 7: op = _.ops.pop(); _.trys.pop(); continue;\r\n                default:\r\n                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }\r\n                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }\r\n                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }\r\n                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }\r\n                    if (t[2]) _.ops.pop();\r\n                    _.trys.pop(); continue;\r\n            }\r\n            op = body.call(thisArg, _);\r\n        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }\r\n        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };\r\n    }\r\n};\r\nObject.defineProperty(exports, \"__esModule\", { value: true });\r\nvar electron_1 = __webpack_require__(/*! electron */ \"electron\");\r\nvar path = __webpack_require__(/*! path */ \"path\");\r\nvar store_1 = __webpack_require__(/*! ./src/store */ \"./src/store.ts\");\r\n//import { format as formatUrl } from 'url';\r\nvar isDevelopment = \"development\" !== 'production';\r\n// First instantiate the class\r\nvar store = new store_1.default({\r\n    // We'll call our data file 'user-preferences'\r\n    configName: 'user-preferences',\r\n    defaults: {\r\n        // 800x600 is the default size of our window\r\n        windowBounds: { width: 1120, height: 800 }\r\n    }\r\n});\r\n//https://cameronnokes.com/blog/how-to-store-user-data-in-electron/\r\n//store:  <Current User>\\AppData\\Roaming\\Electron\\user-preferences.json\r\n//console.log(\"store: \", store.path);\r\n//https://www.electronjs.org/docs/tutorial/security\r\n// global reference to mainWindow (necessary to prevent window from being garbage collected)\r\nvar mainWindow;\r\nfunction createMainWindow(opt) {\r\n    // Create the browser window.\r\n    var window = new electron_1.BrowserWindow({\r\n        height: opt.height || 800,\r\n        webPreferences: {\r\n            nodeIntegration: true,\r\n            enableRemoteModule: false,\r\n        },\r\n        width: opt.width || 1120,\r\n        show: false,\r\n    });\r\n    window.once('ready-to-show', function () {\r\n        window.show();\r\n        window.focus();\r\n    });\r\n    /*\r\n    window.readConfig = function () {\r\n        const data = readFileSync('./config.json')\r\n        return data\r\n    }*/\r\n    // and load the index.html of the app.\r\n    var url = path.join(electron_1.app.getAppPath(), \"index.html\");\r\n    console.log('main index.html', url);\r\n    window.loadFile(url);\r\n    /*if (isDevelopment) {\r\n        window.loadURL(`http://localhost:${process.env.ELECTRON_WEBPACK_WDS_PORT}`)\r\n    }\r\n    else {\r\n        window.loadURL(formatUrl({\r\n            pathname: path.join(__dirname, 'index.html'),\r\n            protocol: 'file',\r\n            slashes: true\r\n        }));\r\n    }\r\n    //window.loadURL(`file://${__dirname}/index.html`)\r\n*/\r\n    if (isDevelopment) {\r\n        window.webContents.openDevTools();\r\n    }\r\n    // Emitted when the window is closed.\r\n    window.on(\"closed\", function () {\r\n        // Dereference the window object, usually you would store windows\r\n        // in an array if your app supports multi windows, this is the time\r\n        // when you should delete the corresponding element.\r\n        mainWindow = null;\r\n    });\r\n    window.webContents.on('devtools-opened', function () {\r\n        window.focus();\r\n        setImmediate(function () {\r\n            window.focus();\r\n        });\r\n    });\r\n    createMenu();\r\n    return window;\r\n}\r\nfunction createMenu() {\r\n    var template = [{\r\n            label: 'Edit',\r\n            submenu: [\r\n                { role: 'undo' },\r\n                { role: 'redo' },\r\n                { type: 'separator' },\r\n                { role: 'cut' },\r\n                { role: 'copy' },\r\n                { role: 'paste' },\r\n                { role: 'delete' }\r\n            ]\r\n        },\r\n        {\r\n            label: 'View',\r\n            submenu: [\r\n                { role: 'reload' },\r\n                { type: 'separator' },\r\n                { type: 'separator' },\r\n                { role: 'togglefullscreen' }\r\n            ]\r\n        },\r\n        { role: 'window', submenu: [{ role: 'minimize' }, { role: 'close' }] }, {\r\n            role: 'help',\r\n            submenu: [{\r\n                    label: 'Learn More',\r\n                    click: function () {\r\n                        __webpack_require__(/*! electron */ \"electron\").shell.openExternal('https://electron.atom.io');\r\n                    }\r\n                }]\r\n        }\r\n    ];\r\n    var menu = electron_1.Menu.buildFromTemplate(template);\r\n    electron_1.Menu.setApplicationMenu(menu);\r\n}\r\n// This method will be called when Electron has finished\r\n// initialization and is ready to create browser windows.\r\n// Some APIs can only be used after this event occurs.\r\nelectron_1.app.on(\"ready\", function () {\r\n    // First we'll get our height and width. This will be the defaults if there wasn't anything saved\r\n    var _a = store.get('windowBounds'), width = _a.width, height = _a.height;\r\n    mainWindow = createMainWindow({ width: width, height: height });\r\n    // The BrowserWindow class extends the node.js core EventEmitter class, so we use that API\r\n    // to listen to events on the BrowserWindow. The resize event is emitted when the window size changes.\r\n    mainWindow.on('resize', function () {\r\n        // The event doesn't pass us the window size, so we call the `getBounds` method which returns an object with\r\n        // the height, width, and x and y coordinates.\r\n        var _a = mainWindow.getBounds(), width = _a.width, height = _a.height;\r\n        // Now that we have them, save them using the `set` method.\r\n        store.set('windowBounds', { width: width, height: height });\r\n    });\r\n});\r\n// Quit when all windows are closed.\r\nelectron_1.app.on(\"window-all-closed\", function () {\r\n    // On OS X it is common for applications and their menu bar\r\n    // to stay active until the user quits explicitly with Cmd + Q\r\n    if (process.platform !== \"darwin\") {\r\n        electron_1.app.quit();\r\n    }\r\n});\r\nelectron_1.app.on(\"activate\", function () {\r\n    // On OS X it\"s common to re-create a window in the app when the\r\n    // dock icon is clicked and there are no other windows open.\r\n    if (mainWindow === null) {\r\n        mainWindow = createMainWindow({});\r\n    }\r\n});\r\nvar _sharedObj = {\r\n    app: 5,\r\n    templates: null\r\n};\r\nObject.defineProperty(global, 'shared', {\r\n    get: function () { return _sharedObj; },\r\n    set: function (value) {\r\n        _sharedObj = value;\r\n    }\r\n});\r\n//https://medium.com/@nornagon/electrons-remote-module-considered-harmful-70d69500f31\r\nelectron_1.ipcMain.handle('shared', function (event, arg) { return __awaiter(void 0, void 0, void 0, function () {\r\n    var prop;\r\n    return __generator(this, function (_a) {\r\n        prop = global[\"shared\"][arg];\r\n        return [2 /*return*/, prop];\r\n    });\r\n}); });\r\n// In this file you can include the rest of your app\"s specific main process\r\n// code. You can also put them in separate files and require them here.\r\nelectron_1.ipcMain.on('asynchronous-message', function (event, arg) {\r\n    console.log(arg); // prints \"ping\"\r\n    event.reply('asynchronous-reply', 'pong');\r\n});\r\nelectron_1.ipcMain.on('synchronous-message', function (event, arg) {\r\n    console.log(arg); // prints \"ping\"\r\n    event.returnValue = 'pong';\r\n});\r\n\n\n//# sourceURL=webpack:///./index.ts?");

/***/ }),

/***/ "./src/store.ts":
/*!**********************!*\
  !*** ./src/store.ts ***!
  \**********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\r\nObject.defineProperty(exports, \"__esModule\", { value: true });\r\nvar electron_1 = __webpack_require__(/*! electron */ \"electron\");\r\nvar path = __webpack_require__(/*! path */ \"path\");\r\nvar fs = __webpack_require__(/*! fs */ \"fs\");\r\nvar Store = /** @class */ (function () {\r\n    function Store(opts) {\r\n        // Renderer process has to get `app` module via `remote`, whereas the main process can get it directly\r\n        // app.getPath('userData') will return a string of the user's app data directory path.\r\n        var userDataPath = electron_1.app.getPath('userData');\r\n        // We'll use the `configName` property to set the file name and path.join to bring it all together as a string\r\n        this.path = path.join(userDataPath, opts.configName + '.json');\r\n        this.data = parseDataFile(this.path, opts.defaults);\r\n    }\r\n    // This will just return the property on the `data` object\r\n    Store.prototype.get = function (key) {\r\n        return this.data[key];\r\n    };\r\n    // ...and this will set it\r\n    Store.prototype.set = function (key, val) {\r\n        this.data[key] = val;\r\n        // Wait, I thought using the node.js' synchronous APIs was bad form?\r\n        // We're not writing a server so there's not nearly the same IO demand on the process\r\n        // Also if we used an async API and our app was quit before the asynchronous write had a chance to complete,\r\n        // we might lose that data. Note that in a real app, we would try/catch this.\r\n        fs.writeFileSync(this.path, JSON.stringify(this.data));\r\n    };\r\n    return Store;\r\n}());\r\nexports.default = Store;\r\nfunction parseDataFile(filePath, defaults) {\r\n    // We'll try/catch it in case the file doesn't exist yet, which will be the case on the first application run.\r\n    // `fs.readFileSync` will return a JSON string which we then parse into a Javascript object\r\n    try {\r\n        return JSON.parse(fs.readFileSync(filePath).toString());\r\n    }\r\n    catch (error) {\r\n        // if there was some kind of error, return the passed in defaults instead.\r\n        return defaults;\r\n    }\r\n}\r\n\n\n//# sourceURL=webpack:///./src/store.ts?");

/***/ }),

/***/ "electron":
/*!***************************!*\
  !*** external "electron" ***!
  \***************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = require(\"electron\");\n\n//# sourceURL=webpack:///external_%22electron%22?");

/***/ }),

/***/ "fs":
/*!*********************!*\
  !*** external "fs" ***!
  \*********************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = require(\"fs\");\n\n//# sourceURL=webpack:///external_%22fs%22?");

/***/ }),

/***/ "path":
/*!***********************!*\
  !*** external "path" ***!
  \***********************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = require(\"path\");\n\n//# sourceURL=webpack:///external_%22path%22?");

/***/ })

/******/ });