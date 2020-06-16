"use strict";
//still in progress...
Object.defineProperty(exports, "__esModule", { value: true });
exports.createClass = exports.addClassX = exports.union = exports.unique = exports.range = exports.getParentAttr = exports.condClass = exports.toggleClass = exports.removeClass = exports.addClass = exports.hasClass = exports.aCld = exports.dP = exports.rEL = exports.aEL = exports.propDescriptor = exports.attr = exports.css = exports.defEnum = exports.obj = exports.pojo = exports.isElement = exports.inherit = exports.copy = exports.extend = exports.nano = exports.splat = exports.round = exports.clamp = exports.pInt = exports.isInt = exports.isNumeric = exports.isNum = exports.isArr = exports.isObj = exports.isStr = exports.dfnd = exports.isFn = exports.typeOf = exports.empty = exports.ts = exports.consts = void 0;
var c = {
    s: "string",
    o: "object",
    b: "boolean",
    i: "integer",
    n: "number",
    a: "array",
    fn: "function",
    sp: "super",
    c: "color",
    t: "type",
    d: "defaut",
    u: "undefined",
    v: "value",
    svgNs: "http://www.w3.org/2000/svg"
};
exports.consts = c;
var ts = function (t) { return ({}).toString.call(t); };
exports.ts = ts;
//it can be extended later to array [] and object {}
var empty = function (s) { return typeof s == void 0 || !s || (isStr(s) && s.match(/^ *$/) !== null); };
exports.empty = empty;
//returned values: array, date,	function, number, object, regexp, string, undefined  	global,	JSON, null
exports.typeOf = function (o) { return ts(o).slice(8, -1).toLowerCase(); };
//nullOrWhiteSpace(s) {
//	return !s || s.match(/^ *$/) !== null;
//},
exports.isFn = function (f) { return typeof f === c.fn; };
//defined			undefined === void 0
var dfnd = function (t) { return t !== void 0 && t !== null; };
exports.dfnd = dfnd;
var isStr = function (s) { return typeof s === c.s; };
exports.isStr = isStr;
//true for Array, pojo retruns true only for a plain old object {}
exports.isObj = function (t) { return typeof t === c.o; };
var isArr = function (t) { return Array.isArray(t); }; // typeOf(t) === c.a;
exports.isArr = isArr;
//has to be a number ("1") == false
exports.isNum = function (n) { return typeof n === c.n; };
// ("1") == true
exports.isNumeric = function (n) { return isNaN(n) ? !1 : (n = parseInt(n), (0 | n) === n); };
//return (typeof x === dab.n) && (x % 1 === 0);
exports.isInt = function (n) { return (parseFloat(n) == parseInt(n)) && !isNaN(n); };
//http://speakingjs.com/es5/ch11.html#converting_to_integer
exports.pInt = function (s, mag) { return parseInt(s, mag || 10); };
// clamp(value, min, max) - limits value to the range min..max
exports.clamp = function (v, min, max) { return (v <= min) ? min : (v >= max) ? max : v; };
exports.round = function (v, decimals) {
    //https://expertcodeblog.wordpress.com/2018/02/12/typescript-javascript-round-number-by-decimal-pecision/
    return (decimals = decimals | 0, Number(Math.round(Number(v + "e" + decimals)) + "e-" + decimals));
}; //force toArray
exports.splat = function (o) { return isArr(o) ? o : (dfnd(o) ? [o] : []); };
exports.nano = function (n, e) {
    return n.replace(/\{([\w\.]*)\}/g, function (n, t) {
        for (var r = t.split("."), f = e[r.shift()], u = 0, i = r.length; i > u; u++)
            f = f[r[u]];
        return c.u != typeof f && null !== f ? f : "";
    });
};
//copy all properties in src to obj, and returns obj
exports.extend = function (obj, src) {
    //!obj && (obj = {});
    //const returnedTarget = Object.assign(target, source); doesn't throw error if source is undefined
    //		but target has to be an object
    pojo(src) && Object.keys(src).forEach(function (key) { obj[key] = src[key]; });
    return obj;
};
//copy properties in src that exists only in obj, and returns obj
exports.copy = function (obj, src) {
    pojo(src) && Object.keys(obj).forEach(function (key) {
        var k = src[key];
        dfnd(k) && (obj[key] = k);
    });
    return obj;
};
exports.inherit = function (parent, child) {
    child.prototype = Object.create(parent.prototype);
    child.prototype.constructor = child;
};
/**
 * @description returns true if an element if an HTML or SVG DOM element
 * @param e {any} an element
 */
exports.isElement = function (e) { return e instanceof Element || e instanceof HTMLDocument; };
/* this generates a function "inherit" and later assigns it to the namespace "dab"
    export function inherit(parent: any, child: any) {
        child.prototype = Object.create(parent.prototype);
        child.prototype.constructor = child;
    }
     */
var pojo = function (arg) {
    if (arg == null || typeof arg !== 'object') {
        return false;
    }
    var proto = Object.getPrototypeOf(arg);
    // Prototype may be null if you used `Object.create(null)`
    // Checking `proto`'s constructor is safe because `getPrototypeOf()`
    // explicitly crosses the boundary from object data to object metadata
    return !proto || proto.constructor.name === 'Object';
    //Object.getPrototypeOf([]).constructor.name == "Array"
    //Object.getPrototypeOf({}).constructor.name == "Object"
    //Object.getPrototypeOf(Object.create(null)) == null
};
exports.pojo = pojo;
var obj = function (o) {
    if (!pojo(o)) {
        return o;
    }
    var result = Object.create(null);
    for (var k in o)
        if (!o.hasOwnProperty || o.hasOwnProperty(k)) {
            var prop = o[k];
            result[k] = pojo(prop) ? obj(prop) : prop;
        }
    return result;
};
exports.obj = obj;
exports.defEnum = function (e) {
    for (var key in e) { //let item = e[key];
        e[e[key]] = key;
    }
    return e;
};
exports.css = function (el, styles) {
    if (isStr(styles))
        return el.style[styles];
    for (var prop in styles)
        el.style[prop] = styles[prop];
    return el;
};
exports.attr = function (el, attrs) {
    if (isStr(attrs))
        return el.getAttribute(attrs);
    for (var attr_1 in attrs)
        el.setAttribute(attr_1, attrs[attr_1]);
    return el;
};
exports.propDescriptor = function (obj, prop) {
    //Object.getOwnPropertyDescriptor(obj, prop);
    var desc;
    do {
        desc = Object.getOwnPropertyDescriptor(obj, prop);
    } while (!desc && (obj = Object.getPrototypeOf(obj)));
    return desc;
};
exports.aEL = function (el, eventName, fn, b) { return el.addEventListener(eventName, fn, b); };
exports.rEL = function (el, eventName, fn, b) { return el.removeEventListener(eventName, fn, b); };
exports.dP = function (obj, propName, attrs) { return Object.defineProperty(obj, propName, attrs); };
exports.aCld = function (parent, child) { return parent.appendChild(child); };
exports.hasClass = function (el, className) { return el.classList.contains(className); };
//className cannot contain spaces
var addClass = function (el, className) { return el.classList.add(className); };
exports.addClass = addClass;
var removeClass = function (el, className) { return el.classList.remove(className); };
exports.removeClass = removeClass;
exports.toggleClass = function (el, className) { return el.classList.toggle(className); };
//https://www.kirupa.com/html5/using_the_classlist_api.htm
// d.addmany
// [b] true -> addClass, [b] false -> removeClass
exports.condClass = function (el, className, b) { return (b && (addClass(el, className), 1)) || removeClass(el, className); };
//https://plainjs.com/javascript/traversing/match-element-selector-52/
//https://plainjs.com/javascript/traversing/get-siblings-of-an-element-40/
exports.getParentAttr = function (p, attr) {
    while (p && !p.hasAttribute(attr))
        p = p.parentElement;
    return p;
};
exports.range = function (s, e) { return Array.from('x'.repeat(e - s), function (_, i) { return s + i; }); };
//Sets
var unique = function (x) { return x.filter(function (elem, index) { return x.indexOf(elem) === index; }); };
exports.unique = unique;
var union = function (x, y) { return unique(x.concat(y)); };
exports.union = union;
exports.addClassX = function (el, className) {
    var _a;
    (_a = el.classList).add.apply(_a, (className || "").split(' ').filter(function (v) { return !empty(v); }));
    return el;
};
//this.win.classList.add(...(this.settings.class || "").split(' '));
exports.createClass = function (baseClass, newClass) {
    var split = function (s) { return s.split(' '); }, baseArr = split(baseClass || ""), newArr = split(newClass || "");
    return union(baseArr, newArr).join(' ');
};
//# sourceMappingURL=dab.js.map