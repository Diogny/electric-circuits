//still in progress...

const c: any = {
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

export { c as consts };

const ts = (t: any) => ({}).toString.call(t);
export { ts }

//it can be extended later to array [] and object {}
const empty = (s: any): boolean => typeof s == void 0 || !s || (isStr(s) && s.match(/^ *$/) !== null);
export { empty }

//returned values: array, date,	function, number, object, regexp, string, undefined  	global,	JSON, null
export const typeOf = (o: any) => ts(o).slice(8, -1).toLowerCase();
//nullOrWhiteSpace(s) {
//	return !s || s.match(/^ *$/) !== null;
//},

export const isFn = (f: any) => typeof f === c.fn;

//defined			undefined === void 0
const dfnd = (t: any) => t !== void 0 && t !== null;
export { dfnd }

const isStr = (s: any) => typeof s === c.s;
export { isStr }

//true for Array, pojo retruns true only for a plain old object {}
export const isObj = (t: any) => typeof t === c.o;

const isArr = (t: any) => Array.isArray(t); // typeOf(t) === c.a;
export { isArr }

//has to be a number ("1") == false
export const isNum = (n: any) => typeof n === c.n;

// ("1") == true
export const isNumeric = (n: any) => isNaN(n) ? !1 : (n = parseInt(n), (0 | n) === n);

//return (typeof x === dab.n) && (x % 1 === 0);
export const isInt = (n: any) => (parseFloat(n) == parseInt(n)) && !isNaN(n);
//http://speakingjs.com/es5/ch11.html#converting_to_integer

export const pInt = (s: string, mag?: number) => parseInt(s, mag || 10);

// clamp(value, min, max) - limits value to the range min..max
export const clamp = (v: number, min: number, max: number) => (v <= min) ? min : (v >= max) ? max : v;

export const round = (v: number, decimals: number) => {
	//https://expertcodeblog.wordpress.com/2018/02/12/typescript-javascript-round-number-by-decimal-pecision/
	return (decimals = decimals | 0, Number(Math.round(Number(v + "e" + decimals)) + "e-" + decimals));
} //force toArray

export const splat = (o: any) => isArr(o) ? o : (dfnd(o) ? [o] : []);

//copy all properties in src to obj, and returns obj
export const extend = (obj: any, src: any) => { //no support for IE 8 https://plainjs.com/javascript/utilities/merge-two-javascript-objects-19/
	//!obj && (obj = {});
	//const returnedTarget = Object.assign(target, source); doesn't throw error if source is undefined
	//		but target has to be an object
	pojo(src) && Object.keys(src).forEach((key) => { obj[key] = src[key]; });
	return obj;
}

//copy properties in src that exists only in obj, and returns obj
export const copy = (obj: any, src: any) => {
	pojo(src) && Object.keys(obj).forEach((key) => {
		let
			k = src[key];
		dfnd(k) && (obj[key] = k)
	});
	return obj
}

export const inherit = (parent: any, child: any) => {
	child.prototype = Object.create(parent.prototype);
	child.prototype.constructor = child;
}

/**
 * @description returns true if an element if an HTML or SVG DOM element
 * @param e {any} an element
 */
export const isElement = (e: any) => e instanceof Element || e instanceof HTMLDocument;

/* this generates a function "inherit" and later assigns it to the namespace "dab"
	export function inherit(parent: any, child: any) {
		child.prototype = Object.create(parent.prototype);
		child.prototype.constructor = child;
	}
	 */
const pojo = (arg: any) => {	// plainObj   Plain Old JavaScript Object (POJO)		{}
	if (arg == null || typeof arg !== 'object') {
		return false;
	}
	const proto = Object.getPrototypeOf(arg);
	// Prototype may be null if you used `Object.create(null)`
	// Checking `proto`'s constructor is safe because `getPrototypeOf()`
	// explicitly crosses the boundary from object data to object metadata
	return !proto || proto.constructor.name === 'Object';
	//Object.getPrototypeOf([]).constructor.name == "Array"
	//Object.getPrototypeOf({}).constructor.name == "Object"
	//Object.getPrototypeOf(Object.create(null)) == null
}
export { pojo };

const obj = (o: any) => {			//deep copy
	if (!pojo(o)) {
		return o;
	}
	let
		result = Object.create(null);
	for (let k in o)
		if (!o.hasOwnProperty || o.hasOwnProperty(k)) {
			let
				prop = o[k];
			result[k] = pojo(prop) ? obj(prop) : prop;
		}
	return result;
}
export { obj }

export const clone = <T>(o: T): T => <T>JSON.parse(JSON.stringify(o));

export const defEnum = (e: any) => {
	for (let key in e) {			//let item = e[key];
		e[e[key]] = key;
	}
	return e;
}

export const css = (el: any, styles: any) => {//css(el, { background: 'green', display: 'none', 'border-radius': '5px' });
	if (isStr(styles))
		return el.style[styles];
	for (let prop in styles)
		el.style[prop] = styles[prop];
	return el;
}

export const attr = function (el: any, attrs: any) {
	if (isStr(attrs))
		return el.getAttribute(attrs);
	for (let attr in attrs)
		el.setAttribute(attr, attrs[attr]);
	return el;
}

export const propDescriptor = function (obj: any, prop: string): PropertyDescriptor {
	//Object.getOwnPropertyDescriptor(obj, prop);
	let desc: PropertyDescriptor;
	do {
		desc = <PropertyDescriptor>Object.getOwnPropertyDescriptor(obj, prop);
	} while (!desc && (obj = Object.getPrototypeOf(obj)));
	return desc;
}

export const aEL = (el: HTMLElement, eventName: string, fn: Function, b?: boolean | AddEventListenerOptions | undefined): void => el.addEventListener(<any>eventName, <any>fn, b);
export const rEL = (el: HTMLElement, eventName: string, fn: Function, b?: boolean | AddEventListenerOptions | undefined): void => el.removeEventListener(<any>eventName, <any>fn, b);
export const dP = (obj: any, propName: string, attrs: object) => Object.defineProperty(obj, propName, attrs);
export const aCld = (parent: any, child: any) => parent.appendChild(child);

export const hasClass = (el: Element, className: string) => el.classList.contains(className);

//className cannot contain spaces
const addClass = (el: Element, className: string) => el.classList.add(className);
export { addClass }

const removeClass = (el: Element, className: string) => el.classList.remove(className);
export { removeClass }

export const toggleClass = (el: Element, className: string) => el.classList.toggle(className);

//https://www.kirupa.com/html5/using_the_classlist_api.htm
// d.addmany
// [b] true -> addClass, [b] false -> removeClass
export const condClass = (el: any, className: string, b: boolean) => (b && (addClass(el, className), 1)) || removeClass(el, className);

//https://plainjs.com/javascript/traversing/match-element-selector-52/
//https://plainjs.com/javascript/traversing/get-siblings-of-an-element-40/


export const getParentAttr = function (p: HTMLElement, attr: string) {
	while (p && !p.hasAttribute(attr))
		p = <HTMLElement>p.parentElement;
	return p;
}

export const range = (s: number, e: number) => Array.from('x'.repeat(e - s), (_, i) => s + i);

//Sets
const unique = (x: any[]): any[] => x.filter((elem, index) => x.indexOf(elem) === index);
export { unique }

const union = (x: any[], y: any[]): any[] => unique(x.concat(y));
export { union }

export const addClassX = (el: Element, className: string): Element => {
	el.classList.add(...(className || "").split(' ').filter((v: string) => !empty(v)))
	return el
}

//this.win.classList.add(...(this.settings.class || "").split(' '));

export const createClass = (baseClass: string, newClass: string): string => {
	let
		split = (s: string) => s.split(' '),
		baseArr = split(baseClass || ""),
		newArr = split(newClass || "");
	return union(baseArr, newArr).join(' ')
}