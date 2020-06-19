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
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/index.print.ts");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/ajaxp.ts":
/*!**********************!*\
  !*** ./src/ajaxp.ts ***!
  \**********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\r\nObject.defineProperty(exports, \"__esModule\", { value: true });\r\nvar ajaxp = /** @class */ (function () {\r\n    function ajaxp() {\r\n    }\r\n    ajaxp.x = function () { return window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject('Microsoft.XMLHTTP'); };\r\n    ajaxp.query = function (data, ask) {\r\n        var query = [];\r\n        for (var key in data) {\r\n            query.push(encodeURIComponent(key) + \"=\" + encodeURIComponent(data[key]));\r\n        }\r\n        return ((ask && query.length) ? \"?\" : \"\") + query.join(\"&\");\r\n    };\r\n    ajaxp.update = function (io, obj) {\r\n        for (var p in io) {\r\n            obj[p] = obj[p] || io[p];\r\n        }\r\n        return obj;\r\n    };\r\n    ajaxp.send = function (url, ox) {\r\n        return new Promise(function (resolve, reject) {\r\n            var x = ajaxp.x();\r\n            ox = ajaxp.update(ajaxp.xobj, ox);\r\n            x.open(ox.method, url, true);\r\n            x[ajaxp.rt] = ox.responseType;\r\n            x.onreadystatechange = function () {\r\n                var DONE = 4, // readyState 4 means the request is done.\r\n                OK = 200, // status 200 is a successful return.\r\n                NOT_MODIFIED = 304;\r\n                if (x.readyState == DONE) {\r\n                    var isJson = x[ajaxp.rt] && (x[ajaxp.rt] == \"json\");\r\n                    if (x.status === OK || x.status === NOT_MODIFIED) {\r\n                        resolve(isJson ? x.response : x.responseText);\r\n                    }\r\n                    else {\r\n                        reject({ status: x.status, d: x.response, xhr: x });\r\n                    }\r\n                }\r\n            };\r\n            if (ox.method == ajaxp.sPost) {\r\n                x.setRequestHeader(\"Content-type\", \"application/x-www-form-urlencoded\");\r\n            }\r\n            x.onerror = function (e) {\r\n                reject(e);\r\n            };\r\n            try {\r\n                x.send(ox.data);\r\n            }\r\n            catch (e) {\r\n                reject({ status: x.status, statusText: x.statusText, xhr: x });\r\n            }\r\n        });\r\n    };\r\n    ajaxp.get = function (url, ox) {\r\n        return (ox = ox || {}, ox.method = ajaxp.sGet, url += ajaxp.query(ox.data, true), ox.data = void 0, ajaxp.send(url, ox));\r\n    };\r\n    ajaxp.post = function (url, ox) {\r\n        return (ox = ox || {}, ox.method = ajaxp.sPost, ox.data = ajaxp.query(ox.data, false), ajaxp.send(url, ox));\r\n    };\r\n    ajaxp.sGet = \"GET\";\r\n    ajaxp.sPost = \"POST\";\r\n    ajaxp.xobj = {\r\n        method: ajaxp.sGet,\r\n        data: void 0,\r\n        responseType: \"text\"\r\n    };\r\n    ajaxp.rt = \"responseType\";\r\n    return ajaxp;\r\n}());\r\nexports.default = ajaxp;\r\n\n\n//# sourceURL=webpack:///./src/ajaxp.ts?");

/***/ }),

/***/ "./src/dab.ts":
/*!********************!*\
  !*** ./src/dab.ts ***!
  \********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\r\n//still in progress...\r\nObject.defineProperty(exports, \"__esModule\", { value: true });\r\nexports.createClass = exports.addClassX = exports.union = exports.unique = exports.range = exports.getParentAttr = exports.condClass = exports.toggleClass = exports.removeClass = exports.addClass = exports.hasClass = exports.aCld = exports.dP = exports.rEL = exports.aEL = exports.propDescriptor = exports.attr = exports.css = exports.defEnum = exports.obj = exports.pojo = exports.isElement = exports.inherit = exports.copy = exports.extend = exports.nano = exports.splat = exports.round = exports.clamp = exports.pInt = exports.isInt = exports.isNumeric = exports.isNum = exports.isArr = exports.isObj = exports.isStr = exports.dfnd = exports.isFn = exports.typeOf = exports.empty = exports.ts = exports.consts = void 0;\r\nvar c = {\r\n    s: \"string\",\r\n    o: \"object\",\r\n    b: \"boolean\",\r\n    i: \"integer\",\r\n    n: \"number\",\r\n    a: \"array\",\r\n    fn: \"function\",\r\n    sp: \"super\",\r\n    c: \"color\",\r\n    t: \"type\",\r\n    d: \"defaut\",\r\n    u: \"undefined\",\r\n    v: \"value\",\r\n    svgNs: \"http://www.w3.org/2000/svg\"\r\n};\r\nexports.consts = c;\r\nvar ts = function (t) { return ({}).toString.call(t); };\r\nexports.ts = ts;\r\n//it can be extended later to array [] and object {}\r\nvar empty = function (s) { return typeof s == void 0 || !s || (isStr(s) && s.match(/^ *$/) !== null); };\r\nexports.empty = empty;\r\n//returned values: array, date,\tfunction, number, object, regexp, string, undefined  \tglobal,\tJSON, null\r\nexports.typeOf = function (o) { return ts(o).slice(8, -1).toLowerCase(); };\r\n//nullOrWhiteSpace(s) {\r\n//\treturn !s || s.match(/^ *$/) !== null;\r\n//},\r\nexports.isFn = function (f) { return typeof f === c.fn; };\r\n//defined\t\t\tundefined === void 0\r\nvar dfnd = function (t) { return t !== void 0 && t !== null; };\r\nexports.dfnd = dfnd;\r\nvar isStr = function (s) { return typeof s === c.s; };\r\nexports.isStr = isStr;\r\n//true for Array, pojo retruns true only for a plain old object {}\r\nexports.isObj = function (t) { return typeof t === c.o; };\r\nvar isArr = function (t) { return Array.isArray(t); }; // typeOf(t) === c.a;\r\nexports.isArr = isArr;\r\n//has to be a number (\"1\") == false\r\nexports.isNum = function (n) { return typeof n === c.n; };\r\n// (\"1\") == true\r\nexports.isNumeric = function (n) { return isNaN(n) ? !1 : (n = parseInt(n), (0 | n) === n); };\r\n//return (typeof x === dab.n) && (x % 1 === 0);\r\nexports.isInt = function (n) { return (parseFloat(n) == parseInt(n)) && !isNaN(n); };\r\n//http://speakingjs.com/es5/ch11.html#converting_to_integer\r\nexports.pInt = function (s, mag) { return parseInt(s, mag || 10); };\r\n// clamp(value, min, max) - limits value to the range min..max\r\nexports.clamp = function (v, min, max) { return (v <= min) ? min : (v >= max) ? max : v; };\r\nexports.round = function (v, decimals) {\r\n    //https://expertcodeblog.wordpress.com/2018/02/12/typescript-javascript-round-number-by-decimal-pecision/\r\n    return (decimals = decimals | 0, Number(Math.round(Number(v + \"e\" + decimals)) + \"e-\" + decimals));\r\n}; //force toArray\r\nexports.splat = function (o) { return isArr(o) ? o : (dfnd(o) ? [o] : []); };\r\nexports.nano = function (n, e) {\r\n    return n.replace(/\\{([\\w\\.]*)\\}/g, function (n, t) {\r\n        for (var r = t.split(\".\"), f = e[r.shift()], u = 0, i = r.length; i > u; u++)\r\n            f = f[r[u]];\r\n        return c.u != typeof f && null !== f ? f : \"\";\r\n    });\r\n};\r\n//copy all properties in src to obj, and returns obj\r\nexports.extend = function (obj, src) {\r\n    //!obj && (obj = {});\r\n    //const returnedTarget = Object.assign(target, source); doesn't throw error if source is undefined\r\n    //\t\tbut target has to be an object\r\n    pojo(src) && Object.keys(src).forEach(function (key) { obj[key] = src[key]; });\r\n    return obj;\r\n};\r\n//copy properties in src that exists only in obj, and returns obj\r\nexports.copy = function (obj, src) {\r\n    pojo(src) && Object.keys(obj).forEach(function (key) {\r\n        var k = src[key];\r\n        dfnd(k) && (obj[key] = k);\r\n    });\r\n    return obj;\r\n};\r\nexports.inherit = function (parent, child) {\r\n    child.prototype = Object.create(parent.prototype);\r\n    child.prototype.constructor = child;\r\n};\r\n/**\r\n * @description returns true if an element if an HTML or SVG DOM element\r\n * @param e {any} an element\r\n */\r\nexports.isElement = function (e) { return e instanceof Element || e instanceof HTMLDocument; };\r\n/* this generates a function \"inherit\" and later assigns it to the namespace \"dab\"\r\n    export function inherit(parent: any, child: any) {\r\n        child.prototype = Object.create(parent.prototype);\r\n        child.prototype.constructor = child;\r\n    }\r\n     */\r\nvar pojo = function (arg) {\r\n    if (arg == null || typeof arg !== 'object') {\r\n        return false;\r\n    }\r\n    var proto = Object.getPrototypeOf(arg);\r\n    // Prototype may be null if you used `Object.create(null)`\r\n    // Checking `proto`'s constructor is safe because `getPrototypeOf()`\r\n    // explicitly crosses the boundary from object data to object metadata\r\n    return !proto || proto.constructor.name === 'Object';\r\n    //Object.getPrototypeOf([]).constructor.name == \"Array\"\r\n    //Object.getPrototypeOf({}).constructor.name == \"Object\"\r\n    //Object.getPrototypeOf(Object.create(null)) == null\r\n};\r\nexports.pojo = pojo;\r\nvar obj = function (o) {\r\n    if (!pojo(o)) {\r\n        return o;\r\n    }\r\n    var result = Object.create(null);\r\n    for (var k in o)\r\n        if (!o.hasOwnProperty || o.hasOwnProperty(k)) {\r\n            var prop = o[k];\r\n            result[k] = pojo(prop) ? obj(prop) : prop;\r\n        }\r\n    return result;\r\n};\r\nexports.obj = obj;\r\nexports.defEnum = function (e) {\r\n    for (var key in e) { //let item = e[key];\r\n        e[e[key]] = key;\r\n    }\r\n    return e;\r\n};\r\nexports.css = function (el, styles) {\r\n    if (isStr(styles))\r\n        return el.style[styles];\r\n    for (var prop in styles)\r\n        el.style[prop] = styles[prop];\r\n    return el;\r\n};\r\nexports.attr = function (el, attrs) {\r\n    if (isStr(attrs))\r\n        return el.getAttribute(attrs);\r\n    for (var attr_1 in attrs)\r\n        el.setAttribute(attr_1, attrs[attr_1]);\r\n    return el;\r\n};\r\nexports.propDescriptor = function (obj, prop) {\r\n    //Object.getOwnPropertyDescriptor(obj, prop);\r\n    var desc;\r\n    do {\r\n        desc = Object.getOwnPropertyDescriptor(obj, prop);\r\n    } while (!desc && (obj = Object.getPrototypeOf(obj)));\r\n    return desc;\r\n};\r\nexports.aEL = function (el, eventName, fn, b) { return el.addEventListener(eventName, fn, b); };\r\nexports.rEL = function (el, eventName, fn, b) { return el.removeEventListener(eventName, fn, b); };\r\nexports.dP = function (obj, propName, attrs) { return Object.defineProperty(obj, propName, attrs); };\r\nexports.aCld = function (parent, child) { return parent.appendChild(child); };\r\nexports.hasClass = function (el, className) { return el.classList.contains(className); };\r\n//className cannot contain spaces\r\nvar addClass = function (el, className) { return el.classList.add(className); };\r\nexports.addClass = addClass;\r\nvar removeClass = function (el, className) { return el.classList.remove(className); };\r\nexports.removeClass = removeClass;\r\nexports.toggleClass = function (el, className) { return el.classList.toggle(className); };\r\n//https://www.kirupa.com/html5/using_the_classlist_api.htm\r\n// d.addmany\r\n// [b] true -> addClass, [b] false -> removeClass\r\nexports.condClass = function (el, className, b) { return (b && (addClass(el, className), 1)) || removeClass(el, className); };\r\n//https://plainjs.com/javascript/traversing/match-element-selector-52/\r\n//https://plainjs.com/javascript/traversing/get-siblings-of-an-element-40/\r\nexports.getParentAttr = function (p, attr) {\r\n    while (p && !p.hasAttribute(attr))\r\n        p = p.parentElement;\r\n    return p;\r\n};\r\nexports.range = function (s, e) { return Array.from('x'.repeat(e - s), function (_, i) { return s + i; }); };\r\n//Sets\r\nvar unique = function (x) { return x.filter(function (elem, index) { return x.indexOf(elem) === index; }); };\r\nexports.unique = unique;\r\nvar union = function (x, y) { return unique(x.concat(y)); };\r\nexports.union = union;\r\nexports.addClassX = function (el, className) {\r\n    var _a;\r\n    (_a = el.classList).add.apply(_a, (className || \"\").split(' ').filter(function (v) { return !empty(v); }));\r\n    return el;\r\n};\r\n//this.win.classList.add(...(this.settings.class || \"\").split(' '));\r\nexports.createClass = function (baseClass, newClass) {\r\n    var split = function (s) { return s.split(' '); }, baseArr = split(baseClass || \"\"), newArr = split(newClass || \"\");\r\n    return union(baseArr, newArr).join(' ');\r\n};\r\n\n\n//# sourceURL=webpack:///./src/dab.ts?");

/***/ }),

/***/ "./src/index.print.ts":
/*!****************************!*\
  !*** ./src/index.print.ts ***!
  \****************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\r\nObject.defineProperty(exports, \"__esModule\", { value: true });\r\nvar electron_1 = __webpack_require__(/*! electron */ \"electron\");\r\nvar utils_1 = __webpack_require__(/*! ./utils */ \"./src/utils.ts\");\r\ndocument.addEventListener(\"keydown\", function (ev) {\r\n    if (ev.ctrlKey && ev.code == \"KeyP\") {\r\n        electron_1.ipcRenderer.sendSync(\"print-svg\");\r\n    }\r\n    else if (ev.code == 'Escape') {\r\n        electron_1.ipcRenderer.sendSync(\"close-print-win\");\r\n    }\r\n}, false);\r\nvar div = utils_1.qS('#board'), answer = electron_1.ipcRenderer.sendSync(\"get-svg\");\r\nif (answer.svg) {\r\n    div.innerHTML = answer.svg;\r\n}\r\n\n\n//# sourceURL=webpack:///./src/index.print.ts?");

/***/ }),

/***/ "./src/utils.ts":
/*!**********************!*\
  !*** ./src/utils.ts ***!
  \**********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\r\n//... still in progress ...\r\nObject.defineProperty(exports, \"__esModule\", { value: true });\r\nexports.basePath = exports.gEId = exports.qSA = exports.qS = exports.ready = exports.prop = exports.filterArray = exports.filter = exports.map = exports.each = exports.html = exports.svg = exports.tag = exports.pad = exports.exec = exports.templatesDOM = exports.templatesUrl = void 0;\r\nvar ajaxp_1 = __webpack_require__(/*! ./ajaxp */ \"./src/ajaxp.ts\");\r\nvar dab_1 = __webpack_require__(/*! ./dab */ \"./src/dab.ts\");\r\nfunction scriptContent(key, text) {\r\n    var regexSingle = /<script[^\\>]*>([\\s\\S]*?)<\\/script>/gi, //regex are not reusable\r\n    match = regexSingle.exec(text);\r\n    //window[key] = text;\r\n    return match ? match[1].replace(/\\r|\\n/g, \"\").trim() : \"\";\r\n}\r\n;\r\n//ajaxp.get(`${base}api/1.0/templates/circuits/stockSymbol,gate_card`, { 'responseType': 'json' })\r\nexports.templatesUrl = function (url, obj) { return ajaxp_1.default.get(url, obj || { 'responseType': 'json' })\r\n    .then(function (data) {\r\n    var regex = /<script.*?id\\s*=\\s*['\"]([^'|^\"]*)['\"].*?>([\\s\\S]*?)<\\/script>/gmi, templates = {}, match;\r\n    if (dab_1.isObj(data)) {\r\n        exports.each(data.result, function (d, k) {\r\n            templates[k] = scriptContent(k, d.text);\r\n        });\r\n    }\r\n    else {\r\n        while ((match = regex.exec(data)))\r\n            // full match is in match[0], whereas captured groups are in ...[1], ...[2], etc.\r\n            templates[match[1]] = match[2].replace(/\\r|\\n/g, \"\").trim();\r\n    }\r\n    //return scriptContent(data.matches['stockSymbol'].text);\t\t\r\n    return templates;\r\n}); };\r\nexports.templatesDOM = function (query) {\r\n    return new Promise(function (resolve, reject) {\r\n        //query:string   id0|id1|id[n]\r\n        var templates = {\r\n            count: 0\r\n        }, idList = Array.isArray(query) ? query : query.split('|');\r\n        idList.forEach(function (id) {\r\n            var tmpl = qS(\"#\" + id), src = tmpl ? tmpl.innerHTML.replace(/\\r|\\n/g, \"\").trim() : undefined;\r\n            tmpl && (templates.count++, templates[id] = src);\r\n        });\r\n        resolve(templates);\r\n    });\r\n};\r\nexports.exec = function (fn, error) {\r\n    var o = {};\r\n    //let\t\t\to : execObj= {};\r\n    try {\r\n        o.result = fn();\r\n    }\r\n    catch (ex) {\r\n        o.error = ex;\r\n        dab_1.isFn(error) && error(o);\r\n    }\r\n    return o;\r\n};\r\nexports.pad = function (t, e, ch) { return new Array((e || 2) + 1 - String(t).length).join(ch ? ch : '0') + t; };\r\nexports.tag = function (tagName, id, nsAttrs) { return (id && (nsAttrs.id = id),\r\n    dab_1.attr(document.createElementNS(dab_1.consts.svgNs, tagName), nsAttrs)); };\r\nexports.svg = function (html) {\r\n    var template = document.createElementNS(dab_1.consts.svgNs, \"template\");\r\n    template.innerHTML = html;\r\n    return template.children[0];\r\n};\r\nexports.html = function (html) {\r\n    var template = document.createElement(\"template\");\r\n    template.innerHTML = html;\r\n    return template.content.firstChild;\r\n};\r\nexports.each = function (obj, fn) {\r\n    if (!dab_1.isFn(fn) || !obj)\r\n        return;\r\n    var ndx = 0;\r\n    for (var key in obj)\r\n        if (!obj.hasOwnProperty || obj.hasOwnProperty(key))\r\n            fn(obj[key], key, ndx++); // (value, key, index)\r\n};\r\nexports.map = function (obj, fn) {\r\n    var arr = [];\r\n    exports.each(obj, function (value, key, ndx) {\r\n        arr.push(fn(value, key, ndx));\r\n    });\r\n    return arr;\r\n};\r\nexports.filter = function (obj, fn) {\r\n    var o = {};\r\n    exports.each(obj, function (value, key, ndx) {\r\n        fn(value, key, ndx) && (o[key] = value);\r\n    });\r\n    return o;\r\n};\r\n/**\r\n * @description\r\n * @param obj an object to filter\r\n * @param fn if it returns true array[]= value (key is lost), if object array[] = object, otherwise discarded\r\n */\r\nexports.filterArray = function (obj, fn) {\r\n    var o = [];\r\n    exports.each(obj, function (value, key, ndx) {\r\n        var res = fn(value, key, ndx);\r\n        if (res === true)\r\n            o.push(value);\r\n        else if (dab_1.pojo(res))\r\n            o.push(res);\r\n    });\r\n    return o;\r\n};\r\nexports.prop = function (o, path, value) {\r\n    var r = path.split('.').map(function (s) { return s.trim(); }), last = r.pop(), result = void 0;\r\n    for (var i = 0; !!o && i < r.length; i++) {\r\n        o = o[r[i]];\r\n    }\r\n    result = o && last && o[last];\r\n    if (value == undefined) {\r\n        return result;\r\n    }\r\n    else {\r\n        return (result != undefined) && (o[last] = value, true);\r\n    }\r\n};\r\nexports.ready = function (fn) {\r\n    if (!dab_1.isFn(fn)) {\r\n        return !1;\r\n    }\r\n    if (document.readyState != \"loading\")\r\n        return (fn(), !0);\r\n    else if (document[\"addEventListener\"])\r\n        dab_1.aEL(document, \"DOMContentLoaded\", fn, false);\r\n    else\r\n        document.attachEvent(\"onreadystatechange\", function () {\r\n            if (document.readyState == \"complete\")\r\n                fn();\r\n        });\r\n    return !0;\r\n};\r\nvar qS = function (s) { return document.querySelector(s); };\r\nexports.qS = qS;\r\nexports.qSA = function (s) { return document.querySelectorAll(s); };\r\nexports.gEId = function (id) { return document.getElementById(id); };\r\nexports.basePath = function () {\r\n    var meta = qS('meta[name=\"base\"]');\r\n    return meta ? meta.getAttribute('content') : \"\";\r\n};\r\n\n\n//# sourceURL=webpack:///./src/utils.ts?");

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