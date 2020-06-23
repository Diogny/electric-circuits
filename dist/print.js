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
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/css/print.css":
/*!***************************!*\
  !*** ./src/css/print.css ***!
  \***************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("// extracted by mini-css-extract-plugin\n\n//# sourceURL=webpack:///./src/css/print.css?");

/***/ }),

/***/ "./src/css/svg.css":
/*!*************************!*\
  !*** ./src/css/svg.css ***!
  \*************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("// extracted by mini-css-extract-plugin\n\n//# sourceURL=webpack:///./src/css/svg.css?");

/***/ }),

/***/ "./src/css/windows.css":
/*!*****************************!*\
  !*** ./src/css/windows.css ***!
  \*****************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("// extracted by mini-css-extract-plugin\n\n//# sourceURL=webpack:///./src/css/windows.css?");

/***/ }),

/***/ "./src/index.print.ts":
/*!****************************!*\
  !*** ./src/index.print.ts ***!
  \****************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\r\nObject.defineProperty(exports, \"__esModule\", { value: true });\r\nvar electron_1 = __webpack_require__(/*! electron */ \"electron\");\r\nvar utils_1 = __webpack_require__(/*! ./ts/utils */ \"./src/ts/utils.ts\");\r\nvar dab_1 = __webpack_require__(/*! ./ts/dab */ \"./src/ts/dab.ts\");\r\nvar dialog_windows_1 = __webpack_require__(/*! ./ts/dialog-windows */ \"./src/ts/dialog-windows.ts\");\r\nvar div = utils_1.qS('#board'), controls = utils_1.qS('#board-controls'), svg = void 0, rects = void 0, isPrinting = false, app = {\r\n    templates: {}\r\n}, printSVG = function () {\r\n    controls.classList.add(\"hide\");\r\n    isPrinting = true;\r\n    electron_1.ipcRenderer.sendSync(\"print-svg\");\r\n}, msgBox, clickHandler = function (e) {\r\n    var target = e.target, index = parseInt(target.getAttribute(\"data-index\"));\r\n    document.activeElement.blur();\r\n    if (target.value == \"Print\") {\r\n        printSVG();\r\n    }\r\n    else {\r\n        setViewBox(index);\r\n    }\r\n}, setViewBox = function (index) {\r\n    if (!rects || !svg)\r\n        return;\r\n    var item = rects[index], input = controls.children[index], selected = Array.from(controls.children)\r\n        .find(function (item) { return item.classList.contains(\"selected\"); });\r\n    selected && selected.classList.remove(\"selected\");\r\n    input.classList.add(\"selected\");\r\n    dab_1.attr(svg, { \"viewBox\": item.rect.x + \" \" + item.rect.y + \" \" + item.rect.width + \" \" + item.rect.height });\r\n};\r\nelectron_1.ipcRenderer.on(\"after-print\", function (event, arg) {\r\n    controls.classList.remove(\"hide\");\r\n    isPrinting = false;\r\n    if (arg.failureReason)\r\n        msgBox.showMessage(\"Print Information\", arg.failureReason);\r\n});\r\nutils_1.templatesDOM(\"dialogWin01\")\r\n    .then(function (templates) {\r\n    app.templates = templates;\r\n    msgBox = new dialog_windows_1.DialogWindow({\r\n        app: app,\r\n        id: \"win-dialog\",\r\n    });\r\n    utils_1.qS('body').append(msgBox.win);\r\n    window.dialog = msgBox;\r\n    var answer = electron_1.ipcRenderer.sendSync(\"get-svg\");\r\n    if (answer.svg) {\r\n        document.addEventListener(\"keydown\", function (ev) {\r\n            if (ev.ctrlKey && ev.code == \"KeyP\") {\r\n                printSVG();\r\n            }\r\n            else if (ev.code == 'Escape') {\r\n                electron_1.ipcRenderer.sendSync(\"close-print-win\");\r\n            }\r\n        }, false);\r\n        rects = answer.rects;\r\n        controls.innerHTML = rects.map(function (o, ndx) {\r\n            return \"<input type=\\\"button\\\" value=\\\"\" + o.zoom + \"\\\" data-index=\\\"\" + ndx + \"\\\">\";\r\n        })\r\n            .concat(['<input type=\"button\" value=\"Print\">'])\r\n            .join('');\r\n        Array.from(controls.children)\r\n            .forEach(function (item) { return dab_1.aEL(item, \"click\", clickHandler, false); });\r\n        div.innerHTML = answer.svg;\r\n        svg = div.querySelector(\"svg\");\r\n        setViewBox(rects.length - 1);\r\n    }\r\n    else {\r\n        msgBox.showMessage(\"Print Information\", answer.message);\r\n    }\r\n});\r\n\n\n//# sourceURL=webpack:///./src/index.print.ts?");

/***/ }),

/***/ "./src/ts/ajaxp.ts":
/*!*************************!*\
  !*** ./src/ts/ajaxp.ts ***!
  \*************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\r\nObject.defineProperty(exports, \"__esModule\", { value: true });\r\nvar ajaxp = /** @class */ (function () {\r\n    function ajaxp() {\r\n    }\r\n    ajaxp.x = function () { return window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject('Microsoft.XMLHTTP'); };\r\n    ajaxp.query = function (data, ask) {\r\n        var query = [];\r\n        for (var key in data) {\r\n            query.push(encodeURIComponent(key) + \"=\" + encodeURIComponent(data[key]));\r\n        }\r\n        return ((ask && query.length) ? \"?\" : \"\") + query.join(\"&\");\r\n    };\r\n    ajaxp.update = function (io, obj) {\r\n        for (var p in io) {\r\n            obj[p] = obj[p] || io[p];\r\n        }\r\n        return obj;\r\n    };\r\n    ajaxp.send = function (url, ox) {\r\n        return new Promise(function (resolve, reject) {\r\n            var x = ajaxp.x();\r\n            ox = ajaxp.update(ajaxp.xobj, ox);\r\n            x.open(ox.method, url, true);\r\n            x[ajaxp.rt] = ox.responseType;\r\n            x.onreadystatechange = function () {\r\n                var DONE = 4, // readyState 4 means the request is done.\r\n                OK = 200, // status 200 is a successful return.\r\n                NOT_MODIFIED = 304;\r\n                if (x.readyState == DONE) {\r\n                    var isJson = x[ajaxp.rt] && (x[ajaxp.rt] == \"json\");\r\n                    if (x.status === OK || x.status === NOT_MODIFIED) {\r\n                        resolve(isJson ? x.response : x.responseText);\r\n                    }\r\n                    else {\r\n                        reject({ status: x.status, d: x.response, xhr: x });\r\n                    }\r\n                }\r\n            };\r\n            if (ox.method == ajaxp.sPost) {\r\n                x.setRequestHeader(\"Content-type\", \"application/x-www-form-urlencoded\");\r\n            }\r\n            x.onerror = function (e) {\r\n                reject(e);\r\n            };\r\n            try {\r\n                x.send(ox.data);\r\n            }\r\n            catch (e) {\r\n                reject({ status: x.status, statusText: x.statusText, xhr: x });\r\n            }\r\n        });\r\n    };\r\n    ajaxp.get = function (url, ox) {\r\n        return (ox = ox || {}, ox.method = ajaxp.sGet, url += ajaxp.query(ox.data, true), ox.data = void 0, ajaxp.send(url, ox));\r\n    };\r\n    ajaxp.post = function (url, ox) {\r\n        return (ox = ox || {}, ox.method = ajaxp.sPost, ox.data = ajaxp.query(ox.data, false), ajaxp.send(url, ox));\r\n    };\r\n    ajaxp.sGet = \"GET\";\r\n    ajaxp.sPost = \"POST\";\r\n    ajaxp.xobj = {\r\n        method: ajaxp.sGet,\r\n        data: void 0,\r\n        responseType: \"text\"\r\n    };\r\n    ajaxp.rt = \"responseType\";\r\n    return ajaxp;\r\n}());\r\nexports.default = ajaxp;\r\n\n\n//# sourceURL=webpack:///./src/ts/ajaxp.ts?");

/***/ }),

/***/ "./src/ts/base-window.ts":
/*!*******************************!*\
  !*** ./src/ts/base-window.ts ***!
  \*******************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\r\nvar __extends = (this && this.__extends) || (function () {\r\n    var extendStatics = function (d, b) {\r\n        extendStatics = Object.setPrototypeOf ||\r\n            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||\r\n            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };\r\n        return extendStatics(d, b);\r\n    };\r\n    return function (d, b) {\r\n        extendStatics(d, b);\r\n        function __() { this.constructor = d; }\r\n        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());\r\n    };\r\n})();\r\nObject.defineProperty(exports, \"__esModule\", { value: true });\r\nvar item_1 = __webpack_require__(/*! ./item */ \"./src/ts/item.ts\");\r\nvar types_1 = __webpack_require__(/*! ./types */ \"./src/ts/types.ts\");\r\nvar dab_1 = __webpack_require__(/*! ./dab */ \"./src/ts/dab.ts\");\r\nvar utils_1 = __webpack_require__(/*! ./utils */ \"./src/ts/utils.ts\");\r\nvar BaseWindow = /** @class */ (function (_super) {\r\n    __extends(BaseWindow, _super);\r\n    function BaseWindow(options) {\r\n        var _this = _super.call(this, options) || this;\r\n        _this.settings.win = utils_1.html(dab_1.nano(_this.app.templates[_this.settings.templateName], {\r\n            id: _this.id,\r\n            class: _this.class\r\n        }));\r\n        _this.move(_this.x, _this.y);\r\n        _this.setVisible(!!_this.settings.visible);\r\n        return _this;\r\n    }\r\n    Object.defineProperty(BaseWindow.prototype, \"type\", {\r\n        get: function () { return types_1.Type.WIN; },\r\n        enumerable: false,\r\n        configurable: true\r\n    });\r\n    Object.defineProperty(BaseWindow.prototype, \"app\", {\r\n        get: function () { return this.settings.app; },\r\n        enumerable: false,\r\n        configurable: true\r\n    });\r\n    Object.defineProperty(BaseWindow.prototype, \"win\", {\r\n        get: function () { return this.settings.win; },\r\n        enumerable: false,\r\n        configurable: true\r\n    });\r\n    Object.defineProperty(BaseWindow.prototype, \"title\", {\r\n        get: function () { return this.settings.title; },\r\n        enumerable: false,\r\n        configurable: true\r\n    });\r\n    BaseWindow.prototype.setTitle = function (value) {\r\n        return this.settings.title = value, this;\r\n    };\r\n    Object.defineProperty(BaseWindow.prototype, \"ClientRect\", {\r\n        get: function () {\r\n            var b = this.win.getBoundingClientRect(); //gives the DOM screen info\r\n            return dab_1.obj({\r\n                width: b.width | 0,\r\n                height: b.height | 0\r\n            });\r\n        },\r\n        enumerable: false,\r\n        configurable: true\r\n    });\r\n    Object.defineProperty(BaseWindow.prototype, \"box\", {\r\n        get: function () {\r\n            return this.win.getBBox();\r\n        },\r\n        enumerable: false,\r\n        configurable: true\r\n    });\r\n    BaseWindow.prototype.clear = function () {\r\n        return this.win.innerHTML = \"\", this;\r\n    };\r\n    BaseWindow.prototype.propertyDefaults = function () {\r\n        return dab_1.extend(_super.prototype.propertyDefaults.call(this), {\r\n            app: void 0,\r\n            visible: false,\r\n            ignoreHeight: false,\r\n            title: \"\",\r\n            templateName: \"baseWin01\"\r\n        });\r\n    };\r\n    return BaseWindow;\r\n}(item_1.default));\r\nexports.default = BaseWindow;\r\n\n\n//# sourceURL=webpack:///./src/ts/base-window.ts?");

/***/ }),

/***/ "./src/ts/dab.ts":
/*!***********************!*\
  !*** ./src/ts/dab.ts ***!
  \***********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\r\n//still in progress...\r\nObject.defineProperty(exports, \"__esModule\", { value: true });\r\nexports.createClass = exports.addClassX = exports.union = exports.unique = exports.range = exports.getParentAttr = exports.condClass = exports.toggleClass = exports.removeClass = exports.addClass = exports.hasClass = exports.aCld = exports.dP = exports.rEL = exports.aEL = exports.propDescriptor = exports.attr = exports.css = exports.defEnum = exports.clone = exports.obj = exports.pojo = exports.isElement = exports.inherit = exports.copy = exports.extend = exports.nano = exports.splat = exports.round = exports.clamp = exports.pInt = exports.isInt = exports.isNumeric = exports.isNum = exports.isArr = exports.isObj = exports.isStr = exports.dfnd = exports.isFn = exports.typeOf = exports.empty = exports.ts = exports.consts = void 0;\r\nvar c = {\r\n    s: \"string\",\r\n    o: \"object\",\r\n    b: \"boolean\",\r\n    i: \"integer\",\r\n    n: \"number\",\r\n    a: \"array\",\r\n    fn: \"function\",\r\n    sp: \"super\",\r\n    c: \"color\",\r\n    t: \"type\",\r\n    d: \"defaut\",\r\n    u: \"undefined\",\r\n    v: \"value\",\r\n    svgNs: \"http://www.w3.org/2000/svg\"\r\n};\r\nexports.consts = c;\r\nvar ts = function (t) { return ({}).toString.call(t); };\r\nexports.ts = ts;\r\n//it can be extended later to array [] and object {}\r\nvar empty = function (s) { return typeof s == void 0 || !s || (isStr(s) && s.match(/^ *$/) !== null); };\r\nexports.empty = empty;\r\n//returned values: array, date,\tfunction, number, object, regexp, string, undefined  \tglobal,\tJSON, null\r\nexports.typeOf = function (o) { return ts(o).slice(8, -1).toLowerCase(); };\r\n//nullOrWhiteSpace(s) {\r\n//\treturn !s || s.match(/^ *$/) !== null;\r\n//},\r\nexports.isFn = function (f) { return typeof f === c.fn; };\r\n//defined\t\t\tundefined === void 0\r\nvar dfnd = function (t) { return t !== void 0 && t !== null; };\r\nexports.dfnd = dfnd;\r\nvar isStr = function (s) { return typeof s === c.s; };\r\nexports.isStr = isStr;\r\n//true for Array, pojo retruns true only for a plain old object {}\r\nexports.isObj = function (t) { return typeof t === c.o; };\r\nvar isArr = function (t) { return Array.isArray(t); }; // typeOf(t) === c.a;\r\nexports.isArr = isArr;\r\n//has to be a number (\"1\") == false\r\nexports.isNum = function (n) { return typeof n === c.n; };\r\n// (\"1\") == true\r\nexports.isNumeric = function (n) { return isNaN(n) ? !1 : (n = parseInt(n), (0 | n) === n); };\r\n//return (typeof x === dab.n) && (x % 1 === 0);\r\nexports.isInt = function (n) { return (parseFloat(n) == parseInt(n)) && !isNaN(n); };\r\n//http://speakingjs.com/es5/ch11.html#converting_to_integer\r\nexports.pInt = function (s, mag) { return parseInt(s, mag || 10); };\r\n// clamp(value, min, max) - limits value to the range min..max\r\nexports.clamp = function (v, min, max) { return (v <= min) ? min : (v >= max) ? max : v; };\r\nexports.round = function (v, decimals) {\r\n    //https://expertcodeblog.wordpress.com/2018/02/12/typescript-javascript-round-number-by-decimal-pecision/\r\n    return (decimals = decimals | 0, Number(Math.round(Number(v + \"e\" + decimals)) + \"e-\" + decimals));\r\n}; //force toArray\r\nexports.splat = function (o) { return isArr(o) ? o : (dfnd(o) ? [o] : []); };\r\nexports.nano = function (n, e) {\r\n    return n.replace(/\\{([\\w\\.]*)\\}/g, function (n, t) {\r\n        for (var r = t.split(\".\"), f = e[r.shift()], u = 0, i = r.length; i > u; u++)\r\n            f = f[r[u]];\r\n        return c.u != typeof f && null !== f ? f : \"\";\r\n    });\r\n};\r\n//copy all properties in src to obj, and returns obj\r\nexports.extend = function (obj, src) {\r\n    //!obj && (obj = {});\r\n    //const returnedTarget = Object.assign(target, source); doesn't throw error if source is undefined\r\n    //\t\tbut target has to be an object\r\n    pojo(src) && Object.keys(src).forEach(function (key) { obj[key] = src[key]; });\r\n    return obj;\r\n};\r\n//copy properties in src that exists only in obj, and returns obj\r\nexports.copy = function (obj, src) {\r\n    pojo(src) && Object.keys(obj).forEach(function (key) {\r\n        var k = src[key];\r\n        dfnd(k) && (obj[key] = k);\r\n    });\r\n    return obj;\r\n};\r\nexports.inherit = function (parent, child) {\r\n    child.prototype = Object.create(parent.prototype);\r\n    child.prototype.constructor = child;\r\n};\r\n/**\r\n * @description returns true if an element if an HTML or SVG DOM element\r\n * @param e {any} an element\r\n */\r\nexports.isElement = function (e) { return e instanceof Element || e instanceof HTMLDocument; };\r\n/* this generates a function \"inherit\" and later assigns it to the namespace \"dab\"\r\n    export function inherit(parent: any, child: any) {\r\n        child.prototype = Object.create(parent.prototype);\r\n        child.prototype.constructor = child;\r\n    }\r\n     */\r\nvar pojo = function (arg) {\r\n    if (arg == null || typeof arg !== 'object') {\r\n        return false;\r\n    }\r\n    var proto = Object.getPrototypeOf(arg);\r\n    // Prototype may be null if you used `Object.create(null)`\r\n    // Checking `proto`'s constructor is safe because `getPrototypeOf()`\r\n    // explicitly crosses the boundary from object data to object metadata\r\n    return !proto || proto.constructor.name === 'Object';\r\n    //Object.getPrototypeOf([]).constructor.name == \"Array\"\r\n    //Object.getPrototypeOf({}).constructor.name == \"Object\"\r\n    //Object.getPrototypeOf(Object.create(null)) == null\r\n};\r\nexports.pojo = pojo;\r\nvar obj = function (o) {\r\n    if (!pojo(o)) {\r\n        return o;\r\n    }\r\n    var result = Object.create(null);\r\n    for (var k in o)\r\n        if (!o.hasOwnProperty || o.hasOwnProperty(k)) {\r\n            var prop = o[k];\r\n            result[k] = pojo(prop) ? obj(prop) : prop;\r\n        }\r\n    return result;\r\n};\r\nexports.obj = obj;\r\nexports.clone = function (o) { return JSON.parse(JSON.stringify(o)); };\r\nexports.defEnum = function (e) {\r\n    for (var key in e) { //let item = e[key];\r\n        e[e[key]] = key;\r\n    }\r\n    return e;\r\n};\r\nexports.css = function (el, styles) {\r\n    if (isStr(styles))\r\n        return el.style[styles];\r\n    for (var prop in styles)\r\n        el.style[prop] = styles[prop];\r\n    return el;\r\n};\r\nexports.attr = function (el, attrs) {\r\n    if (isStr(attrs))\r\n        return el.getAttribute(attrs);\r\n    for (var attr_1 in attrs)\r\n        el.setAttribute(attr_1, attrs[attr_1]);\r\n    return el;\r\n};\r\nexports.propDescriptor = function (obj, prop) {\r\n    //Object.getOwnPropertyDescriptor(obj, prop);\r\n    var desc;\r\n    do {\r\n        desc = Object.getOwnPropertyDescriptor(obj, prop);\r\n    } while (!desc && (obj = Object.getPrototypeOf(obj)));\r\n    return desc;\r\n};\r\nexports.aEL = function (el, eventName, fn, b) { return el.addEventListener(eventName, fn, b); };\r\nexports.rEL = function (el, eventName, fn, b) { return el.removeEventListener(eventName, fn, b); };\r\nexports.dP = function (obj, propName, attrs) { return Object.defineProperty(obj, propName, attrs); };\r\nexports.aCld = function (parent, child) { return parent.appendChild(child); };\r\nexports.hasClass = function (el, className) { return el.classList.contains(className); };\r\n//className cannot contain spaces\r\nvar addClass = function (el, className) { return el.classList.add(className); };\r\nexports.addClass = addClass;\r\nvar removeClass = function (el, className) { return el.classList.remove(className); };\r\nexports.removeClass = removeClass;\r\nexports.toggleClass = function (el, className) { return el.classList.toggle(className); };\r\n//https://www.kirupa.com/html5/using_the_classlist_api.htm\r\n// d.addmany\r\n// [b] true -> addClass, [b] false -> removeClass\r\nexports.condClass = function (el, className, b) { return (b && (addClass(el, className), 1)) || removeClass(el, className); };\r\n//https://plainjs.com/javascript/traversing/match-element-selector-52/\r\n//https://plainjs.com/javascript/traversing/get-siblings-of-an-element-40/\r\nexports.getParentAttr = function (p, attr) {\r\n    while (p && !p.hasAttribute(attr))\r\n        p = p.parentElement;\r\n    return p;\r\n};\r\nexports.range = function (s, e) { return Array.from('x'.repeat(e - s), function (_, i) { return s + i; }); };\r\n//Sets\r\nvar unique = function (x) { return x.filter(function (elem, index) { return x.indexOf(elem) === index; }); };\r\nexports.unique = unique;\r\nvar union = function (x, y) { return unique(x.concat(y)); };\r\nexports.union = union;\r\nexports.addClassX = function (el, className) {\r\n    var _a;\r\n    (_a = el.classList).add.apply(_a, (className || \"\").split(' ').filter(function (v) { return !empty(v); }));\r\n    return el;\r\n};\r\n//this.win.classList.add(...(this.settings.class || \"\").split(' '));\r\nexports.createClass = function (baseClass, newClass) {\r\n    var split = function (s) { return s.split(' '); }, baseArr = split(baseClass || \"\"), newArr = split(newClass || \"\");\r\n    return union(baseArr, newArr).join(' ');\r\n};\r\n\n\n//# sourceURL=webpack:///./src/ts/dab.ts?");

/***/ }),

/***/ "./src/ts/dialog-base.ts":
/*!*******************************!*\
  !*** ./src/ts/dialog-base.ts ***!
  \*******************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\r\nvar __extends = (this && this.__extends) || (function () {\r\n    var extendStatics = function (d, b) {\r\n        extendStatics = Object.setPrototypeOf ||\r\n            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||\r\n            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };\r\n        return extendStatics(d, b);\r\n    };\r\n    return function (d, b) {\r\n        extendStatics(d, b);\r\n        function __() { this.constructor = d; }\r\n        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());\r\n    };\r\n})();\r\nObject.defineProperty(exports, \"__esModule\", { value: true });\r\nvar base_window_1 = __webpack_require__(/*! ./base-window */ \"./src/ts/base-window.ts\");\r\nvar dab_1 = __webpack_require__(/*! ./dab */ \"./src/ts/dab.ts\");\r\nvar DialogBase = /** @class */ (function (_super) {\r\n    __extends(DialogBase, _super);\r\n    function DialogBase(options) {\r\n        var _this = _super.call(this, options) || this;\r\n        _this.titleHTML = _this.win.querySelector(\"div>h4\");\r\n        _this.buttonsHTML = _this.win.querySelector(\"div>div>div\");\r\n        return _this;\r\n    }\r\n    DialogBase.prototype.promise = function (title, setContent, buttons, validator) {\r\n        var self = this;\r\n        return new Promise(function (resolve, reject) {\r\n            var cancelIndex = -1, cleanUp = function () {\r\n                document.removeEventListener(\"keydown\", keyHandler, false);\r\n                dab_1.rEL(self.buttonsHTML, \"click\", clickHandler, false);\r\n                self.setVisible(false);\r\n                dab_1.addClass(self.win, \"hide\");\r\n            }, clickHandler = function (e) {\r\n                var choice = parseInt(e.target.getAttribute(\"dialog-option\"));\r\n                if (isNaN(choice)\r\n                    || (validator && !validator.call(self, choice)))\r\n                    return;\r\n                cleanUp();\r\n                resolve(choice);\r\n            }, keyHandler = function (ev) {\r\n                if (ev.code == 'Escape') {\r\n                    cleanUp();\r\n                    resolve(cancelIndex);\r\n                }\r\n            };\r\n            self.titleHTML.innerText = title;\r\n            setContent.call(self);\r\n            self.buttonsHTML.innerHTML =\r\n                buttons.map(function (text, index) {\r\n                    if (text.toUpperCase() == \"CANCEL\")\r\n                        cancelIndex = index;\r\n                    return \"<button dialog-option=\\\"\" + index + \"\\\">\" + text + \"</button>\";\r\n                })\r\n                    .join('');\r\n            document.addEventListener(\"keydown\", keyHandler, false);\r\n            dab_1.aEL(self.buttonsHTML, \"click\", clickHandler, false);\r\n            self.setVisible(true);\r\n            dab_1.removeClass(self.win, \"hide\");\r\n        });\r\n    };\r\n    return DialogBase;\r\n}(base_window_1.default));\r\nexports.default = DialogBase;\r\n\n\n//# sourceURL=webpack:///./src/ts/dialog-base.ts?");

/***/ }),

/***/ "./src/ts/dialog-windows.ts":
/*!**********************************!*\
  !*** ./src/ts/dialog-windows.ts ***!
  \**********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\r\nvar __extends = (this && this.__extends) || (function () {\r\n    var extendStatics = function (d, b) {\r\n        extendStatics = Object.setPrototypeOf ||\r\n            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||\r\n            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };\r\n        return extendStatics(d, b);\r\n    };\r\n    return function (d, b) {\r\n        extendStatics(d, b);\r\n        function __() { this.constructor = d; }\r\n        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());\r\n    };\r\n})();\r\nObject.defineProperty(exports, \"__esModule\", { value: true });\r\nexports.FormWindow = exports.DialogWindow = void 0;\r\nvar dab_1 = __webpack_require__(/*! ./dab */ \"./src/ts/dab.ts\");\r\nvar dialog_base_1 = __webpack_require__(/*! ./dialog-base */ \"./src/ts/dialog-base.ts\");\r\nvar DialogWindow = /** @class */ (function (_super) {\r\n    __extends(DialogWindow, _super);\r\n    function DialogWindow(options) {\r\n        var _this = _super.call(this, options) || this;\r\n        _this.contentHTML = _this.win.querySelector(\"div>h5\");\r\n        return _this;\r\n    }\r\n    DialogWindow.prototype.showDialog = function (title, message, buttons) {\r\n        return this.promise(title, function () {\r\n            this.contentHTML.innerText = message;\r\n        }, buttons);\r\n    };\r\n    DialogWindow.prototype.showMessage = function (title, message) {\r\n        return this.showDialog(title, message, [\"OK\"])\r\n            .then(function (choice) {\r\n            return Promise.resolve();\r\n        })\r\n            .catch(function (reason) {\r\n            return Promise.resolve();\r\n        });\r\n    };\r\n    DialogWindow.prototype.propertyDefaults = function () {\r\n        return dab_1.extend(_super.prototype.propertyDefaults.call(this), {\r\n            class: \"win dialog box no-select hide\",\r\n            templateName: \"dialogWin01\",\r\n        });\r\n    };\r\n    return DialogWindow;\r\n}(dialog_base_1.default));\r\nexports.DialogWindow = DialogWindow;\r\nvar FormWindow = /** @class */ (function (_super) {\r\n    __extends(FormWindow, _super);\r\n    function FormWindow(options) {\r\n        var _this = _super.call(this, options) || this;\r\n        _this.contentHTML = _this.win.querySelector(\"div>form>fieldset\");\r\n        return _this;\r\n    }\r\n    FormWindow.prototype.showDialog = function (title, formItems) {\r\n        return this.promise(title, function () {\r\n            var _this = this;\r\n            this.contentHTML.innerHTML = formItems.map(function (item, index) {\r\n                var o = dab_1.clone(item);\r\n                !o.placeHolder && (o.placeHolder = o.label);\r\n                o.index = index;\r\n                o.class = item.visible ? \"\" : \"hide\";\r\n                return dab_1.nano(_this.app.templates[item.readonly ? \"formFieldWinSpan\" : \"formFieldWinInput\"], o);\r\n            })\r\n                .join('');\r\n        }, [\"Save\", \"Cancel\"], function (choice) {\r\n            var isRequired = function (s, ndx) { return (dab_1.empty(s) && formItems[ndx].required); };\r\n            if (choice == 0\r\n                && (Array.from(this.contentHTML.querySelectorAll(\"div>input\"))\r\n                    .filter(function (elem) {\r\n                    var index = parseInt(elem.getAttribute(\"index\")), item = formItems[index];\r\n                    if (item\r\n                        && !item.readonly\r\n                        && isRequired(item.value = elem.value, index)) {\r\n                        elem.nextElementSibling.innerText = \"required\";\r\n                        dab_1.removeClass(elem.nextElementSibling, \"hide\");\r\n                        return true;\r\n                    }\r\n                    elem.nextElementSibling.innerText = \"*\";\r\n                    dab_1.addClass(elem.nextElementSibling, \"hide\");\r\n                })).length)\r\n                return false;\r\n            return true;\r\n        });\r\n    };\r\n    FormWindow.prototype.propertyDefaults = function () {\r\n        return dab_1.extend(_super.prototype.propertyDefaults.call(this), {\r\n            class: \"win dialog form no-select hide\",\r\n            templateName: \"formWin01\",\r\n        });\r\n    };\r\n    return FormWindow;\r\n}(dialog_base_1.default));\r\nexports.FormWindow = FormWindow;\r\n\n\n//# sourceURL=webpack:///./src/ts/dialog-windows.ts?");

/***/ }),

/***/ "./src/ts/item.ts":
/*!************************!*\
  !*** ./src/ts/item.ts ***!
  \************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\r\nvar __extends = (this && this.__extends) || (function () {\r\n    var extendStatics = function (d, b) {\r\n        extendStatics = Object.setPrototypeOf ||\r\n            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||\r\n            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };\r\n        return extendStatics(d, b);\r\n    };\r\n    return function (d, b) {\r\n        extendStatics(d, b);\r\n        function __() { this.constructor = d; }\r\n        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());\r\n    };\r\n})();\r\nObject.defineProperty(exports, \"__esModule\", { value: true });\r\nvar point_1 = __webpack_require__(/*! ./point */ \"./src/ts/point.ts\");\r\nvar dab_1 = __webpack_require__(/*! ./dab */ \"./src/ts/dab.ts\");\r\nvar types_1 = __webpack_require__(/*! ./types */ \"./src/ts/types.ts\");\r\nvar Item = /** @class */ (function (_super) {\r\n    __extends(Item, _super);\r\n    function Item(options) {\r\n        var _this = _super.call(this) || this;\r\n        //merge defaults and deep copy\r\n        //all default properties must be refrenced from this or this.settings\r\n        // options is for custom options only\r\n        var optionsClass = options.class || \"\";\r\n        delete options.class;\r\n        _this.settings = dab_1.obj(dab_1.copy(_this.propertyDefaults(), options));\r\n        _this.settings.class = dab_1.unique((_this.class + \" \" + optionsClass).split(' ')).join(' ');\r\n        _this.settings.x = _this.settings.x || 0;\r\n        _this.settings.y = _this.settings.y || 0;\r\n        return _this;\r\n    }\r\n    Object.defineProperty(Item.prototype, \"name\", {\r\n        get: function () { return this.settings.name; },\r\n        enumerable: false,\r\n        configurable: true\r\n    });\r\n    Object.defineProperty(Item.prototype, \"id\", {\r\n        get: function () { return this.settings.id; },\r\n        enumerable: false,\r\n        configurable: true\r\n    });\r\n    Object.defineProperty(Item.prototype, \"x\", {\r\n        get: function () { return this.settings.x; },\r\n        enumerable: false,\r\n        configurable: true\r\n    });\r\n    Object.defineProperty(Item.prototype, \"y\", {\r\n        get: function () { return this.settings.y; },\r\n        enumerable: false,\r\n        configurable: true\r\n    });\r\n    Object.defineProperty(Item.prototype, \"p\", {\r\n        get: function () { return new point_1.default(this.x, this.y); },\r\n        enumerable: false,\r\n        configurable: true\r\n    });\r\n    Object.defineProperty(Item.prototype, \"class\", {\r\n        get: function () { return this.settings.class; },\r\n        enumerable: false,\r\n        configurable: true\r\n    });\r\n    Object.defineProperty(Item.prototype, \"visible\", {\r\n        get: function () { return this.settings.visible; },\r\n        enumerable: false,\r\n        configurable: true\r\n    });\r\n    Item.prototype.setVisible = function (value) {\r\n        this.settings.visible = !!value;\r\n        return this;\r\n    };\r\n    Item.prototype.move = function (x, y) {\r\n        this.settings.x = x | 0;\r\n        this.settings.y = y | 0;\r\n        return this;\r\n    };\r\n    Item.prototype.movePoint = function (p) {\r\n        return this.move(p.x, p.y);\r\n    };\r\n    Item.prototype.translate = function (dx, dy) {\r\n        return this.move(this.x + (dx | 0), this.y + (dy | 0));\r\n    };\r\n    Item.prototype.propertyDefaults = function () {\r\n        return {\r\n            id: \"\",\r\n            name: \"\",\r\n            x: 0,\r\n            y: 0,\r\n            class: \"\",\r\n            visible: true,\r\n            base: void 0,\r\n            label: \"\"\r\n        };\r\n    };\r\n    return Item;\r\n}(types_1.TypedClass));\r\nexports.default = Item;\r\n\n\n//# sourceURL=webpack:///./src/ts/item.ts?");

/***/ }),

/***/ "./src/ts/point.ts":
/*!*************************!*\
  !*** ./src/ts/point.ts ***!
  \*************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\r\n//Point class is adapted from:\r\n//https://github.com/Microsoft/TypeScriptSamples/blob/master/raytracer/raytracer.ts\r\nObject.defineProperty(exports, \"__esModule\", { value: true });\r\nvar dab_1 = __webpack_require__(/*! ./dab */ \"./src/ts/dab.ts\");\r\nvar Point = /** @class */ (function () {\r\n    function Point(x, y) {\r\n        this.x = x;\r\n        this.y = y;\r\n    }\r\n    Point.prototype.distance = function (p) {\r\n        var dx = this.x - p.x;\r\n        var dy = this.y - p.y;\r\n        return Math.sqrt(dx * dx + dy * dy);\r\n    };\r\n    Point.prototype.clone = function () { return new Point(this.x, this.y); };\r\n    Point.prototype.round = function () {\r\n        this.x = Math.round(this.x);\r\n        this.y = Math.round(this.y);\r\n        return this;\r\n    };\r\n    Point.prototype.add = function (x, y) {\r\n        this.x += Math.round(x);\r\n        this.y += Math.round(y);\r\n        return this;\r\n    };\r\n    Point.prototype.toString = function (options) {\r\n        var noVars = ((options = options | 0) & 4) != 0, noPars = (options & 2) != 0;\r\n        return \"\" + (noPars ? \"\" : \"(\") + (noVars ? \"\" : \"x: \") + dab_1.round(this.x, 1) + \", \" + (noVars ? \"\" : \"y: \") + dab_1.round(this.y, 1) + (noPars ? \"\" : \")\");\r\n    };\r\n    //get positive(): boolean { return this.x >= 0 && this.y >= 0 }\r\n    /**\r\n     * @description rotate (x,y) through center (x,y) by an angle\r\n     * @param {number} cx center x\r\n     * @param {number} cy center y\r\n     * @param {number} angle angle to rotate\r\n     */\r\n    Point.prototype.rotateBy = function (cx, cy, angle) {\r\n        var radians = (Math.PI / 180) * angle, cos = Math.cos(radians), sin = Math.sin(radians), nx = (cos * (this.x - cx)) + (sin * (this.y - cy)) + cx, ny = (cos * (this.y - cy)) - (sin * (this.x - cx)) + cy;\r\n        return new Point(nx, ny); //round(nx, 3), round(ny, 3)\r\n    };\r\n    //static\r\n    Point.validateRotation = function (val) {\r\n        return (val = (val | 0) % 360, (val < 0) && (val += 360), val);\r\n    };\r\n    Object.defineProperty(Point, \"origin\", {\r\n        get: function () { return new Point(0, 0); },\r\n        enumerable: false,\r\n        configurable: true\r\n    });\r\n    Point.create = function (p) {\r\n        return new Point(p.x, p.y);\r\n    };\r\n    /**\r\n     * @description parse an string into an (x,y) Point\r\n     * @param value string in the for \"x, y\"\r\n     */\r\n    Point.parse = function (value) {\r\n        var arr = value.split(\",\");\r\n        if (arr.length == 2 && dab_1.isNumeric(arr[0]) && dab_1.isNumeric(arr[1])) {\r\n            return new Point(parseInt(arr[0]), parseInt(arr[1]));\r\n        }\r\n        //invalid point\r\n        return void 0;\r\n    };\r\n    Point.distance = function (p1, p2) {\r\n        return p1.distance(p2);\r\n    };\r\n    Point.scale = function (v, k) { return new Point(k * v.x, k * v.y); };\r\n    Point.translateBy = function (v, dx, dy) { return new Point(v.x + dx, v.y + dy); };\r\n    //static translate(v: Point, k: number): IPoint { return new Point(v.x + k, v.y + k) }\r\n    Point.times = function (v, scaleX, scaleY) { return new Point(v.x * scaleX, v.y * scaleY); };\r\n    Point.minus = function (v1, v2) { return new Point(v1.x - v2.x, v1.y - v2.y); };\r\n    Point.plus = function (v1, v2) { return new Point(v1.x + v2.x, v1.y + v2.y); };\r\n    //\r\n    Point.inside = function (p, s) { return p.x >= 0 && p.x <= s.width && p.y >= 0 && p.y <= s.height; };\r\n    return Point;\r\n}());\r\nexports.default = Point;\r\n\n\n//# sourceURL=webpack:///./src/ts/point.ts?");

/***/ }),

/***/ "./src/ts/types.ts":
/*!*************************!*\
  !*** ./src/ts/types.ts ***!
  \*************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\r\nObject.defineProperty(exports, \"__esModule\", { value: true });\r\nexports.TypedClass = exports.Type = void 0;\r\nvar Type;\r\n(function (Type) {\r\n    Type[Type[\"UNDEFINED\"] = 0] = \"UNDEFINED\";\r\n    Type[Type[\"EC\"] = 1] = \"EC\";\r\n    Type[Type[\"WIRE\"] = 2] = \"WIRE\";\r\n    Type[Type[\"BOND\"] = 3] = \"BOND\";\r\n    Type[Type[\"LABEL\"] = 4] = \"LABEL\";\r\n    Type[Type[\"WIN\"] = 5] = \"WIN\";\r\n    Type[Type[\"TOOLTIP\"] = 6] = \"TOOLTIP\";\r\n    Type[Type[\"HIGHLIGHT\"] = 7] = \"HIGHLIGHT\";\r\n})(Type = exports.Type || (exports.Type = {}));\r\n;\r\nvar TypedClass = /** @class */ (function () {\r\n    function TypedClass() {\r\n    }\r\n    return TypedClass;\r\n}());\r\nexports.TypedClass = TypedClass;\r\n\n\n//# sourceURL=webpack:///./src/ts/types.ts?");

/***/ }),

/***/ "./src/ts/utils.ts":
/*!*************************!*\
  !*** ./src/ts/utils.ts ***!
  \*************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\r\n//... still in progress ...\r\nObject.defineProperty(exports, \"__esModule\", { value: true });\r\nexports.basePath = exports.gEId = exports.qSA = exports.qS = exports.ready = exports.prop = exports.filterArray = exports.filter = exports.map = exports.each = exports.html = exports.svg = exports.tag = exports.pad = exports.exec = exports.templatesDOM = exports.templatesUrl = void 0;\r\nvar ajaxp_1 = __webpack_require__(/*! ./ajaxp */ \"./src/ts/ajaxp.ts\");\r\nvar dab_1 = __webpack_require__(/*! ./dab */ \"./src/ts/dab.ts\");\r\nfunction scriptContent(key, text) {\r\n    var regexSingle = /<script[^\\>]*>([\\s\\S]*?)<\\/script>/gi, //regex are not reusable\r\n    match = regexSingle.exec(text);\r\n    //window[key] = text;\r\n    return match ? match[1].replace(/\\r|\\n/g, \"\").trim() : \"\";\r\n}\r\n;\r\n//ajaxp.get(`${base}api/1.0/templates/circuits/stockSymbol,gate_card`, { 'responseType': 'json' })\r\nexports.templatesUrl = function (url, obj) { return ajaxp_1.default.get(url, obj || { 'responseType': 'json' })\r\n    .then(function (data) {\r\n    var regex = /<script.*?id\\s*=\\s*['\"]([^'|^\"]*)['\"].*?>([\\s\\S]*?)<\\/script>/gmi, templates = {}, match;\r\n    if (dab_1.isObj(data)) {\r\n        exports.each(data.result, function (d, k) {\r\n            templates[k] = scriptContent(k, d.text);\r\n        });\r\n    }\r\n    else {\r\n        while ((match = regex.exec(data)))\r\n            // full match is in match[0], whereas captured groups are in ...[1], ...[2], etc.\r\n            templates[match[1]] = match[2].replace(/\\r|\\n/g, \"\").trim();\r\n    }\r\n    //return scriptContent(data.matches['stockSymbol'].text);\t\t\r\n    return templates;\r\n}); };\r\nexports.templatesDOM = function (query) {\r\n    return new Promise(function (resolve, reject) {\r\n        //query:string   id0|id1|id[n]\r\n        var templates = {\r\n            count: 0\r\n        }, idList = Array.isArray(query) ? query : query.split('|');\r\n        idList.forEach(function (id) {\r\n            var tmpl = qS(\"#\" + id), src = tmpl ? tmpl.innerHTML.replace(/\\r|\\n/g, \"\").trim() : undefined;\r\n            tmpl && (templates.count++, templates[id] = src);\r\n        });\r\n        resolve(templates);\r\n    });\r\n};\r\nexports.exec = function (fn, error) {\r\n    var o = {};\r\n    //let\t\t\to : execObj= {};\r\n    try {\r\n        o.result = fn();\r\n    }\r\n    catch (ex) {\r\n        o.error = ex;\r\n        dab_1.isFn(error) && error(o);\r\n    }\r\n    return o;\r\n};\r\nexports.pad = function (t, e, ch) { return new Array((e || 2) + 1 - String(t).length).join(ch ? ch : '0') + t; };\r\nexports.tag = function (tagName, id, nsAttrs) { return (id && (nsAttrs.id = id),\r\n    dab_1.attr(document.createElementNS(dab_1.consts.svgNs, tagName), nsAttrs)); };\r\nexports.svg = function (html) {\r\n    var template = document.createElementNS(dab_1.consts.svgNs, \"template\");\r\n    template.innerHTML = html;\r\n    return template.children[0];\r\n};\r\nexports.html = function (html) {\r\n    var template = document.createElement(\"template\");\r\n    template.innerHTML = html;\r\n    return template.content.firstChild;\r\n};\r\nexports.each = function (obj, fn) {\r\n    if (!dab_1.isFn(fn) || !obj)\r\n        return;\r\n    var ndx = 0;\r\n    for (var key in obj)\r\n        if (!obj.hasOwnProperty || obj.hasOwnProperty(key))\r\n            fn(obj[key], key, ndx++); // (value, key, index)\r\n};\r\nexports.map = function (obj, fn) {\r\n    var arr = [];\r\n    exports.each(obj, function (value, key, ndx) {\r\n        arr.push(fn(value, key, ndx));\r\n    });\r\n    return arr;\r\n};\r\nexports.filter = function (obj, fn) {\r\n    var o = {};\r\n    exports.each(obj, function (value, key, ndx) {\r\n        fn(value, key, ndx) && (o[key] = value);\r\n    });\r\n    return o;\r\n};\r\n/**\r\n * @description\r\n * @param obj an object to filter\r\n * @param fn if it returns true array[]= value (key is lost), if object array[] = object, otherwise discarded\r\n */\r\nexports.filterArray = function (obj, fn) {\r\n    var o = [];\r\n    exports.each(obj, function (value, key, ndx) {\r\n        var res = fn(value, key, ndx);\r\n        if (res === true)\r\n            o.push(value);\r\n        else if (dab_1.pojo(res))\r\n            o.push(res);\r\n    });\r\n    return o;\r\n};\r\nexports.prop = function (o, path, value) {\r\n    var r = path.split('.').map(function (s) { return s.trim(); }), last = r.pop(), result = void 0;\r\n    for (var i = 0; !!o && i < r.length; i++) {\r\n        o = o[r[i]];\r\n    }\r\n    result = o && last && o[last];\r\n    if (value == undefined) {\r\n        return result;\r\n    }\r\n    else {\r\n        return (result != undefined) && (o[last] = value, true);\r\n    }\r\n};\r\nexports.ready = function (fn) {\r\n    if (!dab_1.isFn(fn)) {\r\n        return !1;\r\n    }\r\n    if (document.readyState != \"loading\")\r\n        return (fn(), !0);\r\n    else if (document[\"addEventListener\"])\r\n        dab_1.aEL(document, \"DOMContentLoaded\", fn, false);\r\n    else\r\n        document.attachEvent(\"onreadystatechange\", function () {\r\n            if (document.readyState == \"complete\")\r\n                fn();\r\n        });\r\n    return !0;\r\n};\r\nvar qS = function (s) { return document.querySelector(s); };\r\nexports.qS = qS;\r\nexports.qSA = function (s) { return document.querySelectorAll(s); };\r\nexports.gEId = function (id) { return document.getElementById(id); };\r\nexports.basePath = function () {\r\n    var meta = qS('meta[name=\"base\"]');\r\n    return meta ? meta.getAttribute('content') : \"\";\r\n};\r\n\n\n//# sourceURL=webpack:///./src/ts/utils.ts?");

/***/ }),

/***/ 0:
/*!**********************************************************************************************!*\
  !*** multi ./src/index.print.ts ./src/css/svg.css ./src/css/windows.css ./src/css/print.css ***!
  \**********************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("__webpack_require__(/*! ./src/index.print.ts */\"./src/index.print.ts\");\n__webpack_require__(/*! ./src/css/svg.css */\"./src/css/svg.css\");\n__webpack_require__(/*! ./src/css/windows.css */\"./src/css/windows.css\");\nmodule.exports = __webpack_require__(/*! ./src/css/print.css */\"./src/css/print.css\");\n\n\n//# sourceURL=webpack:///multi_./src/index.print.ts_./src/css/svg.css_./src/css/windows.css_./src/css/print.css?");

/***/ }),

/***/ "electron":
/*!***************************!*\
  !*** external "electron" ***!
  \***************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = require(\"electron\");\n\n//# sourceURL=webpack:///external_%22electron%22?");

/***/ })

/******/ });