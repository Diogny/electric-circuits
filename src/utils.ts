//still in progress...

import ajaxp from './ajaxp';
import { isObj, isFn, attr, aEL, consts as _, pojo } from './dab';
import { IExec } from './interfaces';

function scriptContent(key: string, text: string) {
	let
		regexSingle = /<script[^\>]*>([\s\S]*?)<\/script>/gi, //regex are not reusable
		match = regexSingle.exec(text);
	//window[key] = text;
	return match ? match[1].replace(/\r|\n/g, "").trim() : "";
};

//ajaxp.get(`${base}api/1.0/templates/circuits/stockSymbol,gate_card`, { 'responseType': 'json' })
export const templatesUrl = (url: string, obj?: object) => ajaxp.get(url, obj || { 'responseType': 'json' })
	.then((data: any) => {
		let
			regex = /<script.*?id\s*=\s*['"]([^'|^"]*)['"].*?>([\s\S]*?)<\/script>/gmi,
			templates: any = {},
			match;
		if (isObj(data)) {
			each(data.result, (d: any, k: string) => {
				templates[k] = scriptContent(k, d.text);
			});
		} else {
			while ((match = regex.exec(data)))
				// full match is in match[0], whereas captured groups are in ...[1], ...[2], etc.
				templates[match[1]] = match[2].replace(/\r|\n/g, "").trim();
		}
		//return scriptContent(data.matches['stockSymbol'].text);		
		return templates;
	});

export const templatesDOM = (query: string | string[]): Promise<Object> => {
	return new Promise(function (resolve, reject) {
		//query:string   id0|id1|id[n]
		let
			templates = {
				count: 0
			},
			idList = Array.isArray(query) ? query : query.split('|');
		idList.forEach((id: string) => {
			let
				tmpl = qS(`#${id}`),
				src = tmpl ? tmpl.innerHTML.replace(/\r|\n/g, "").trim() : undefined;
			tmpl && (templates.count++, templates[id] = src);
		});
		resolve(templates)
	})
}

export const exec = (fn: Function, error: Function) => {
	const o = {} as IExec;
	//let			o : execObj= {};
	try {
		o.result = fn();
	} catch (ex) {
		o.error = ex;
		isFn(error) && error(o);
	}
	return o;
};

export const pad = (t: string, e: number, ch?: any) => new Array((e || 2) + 1 - String(t).length).join(ch ? ch : '0') + t;

export const tag = (tagName: string, id: string, nsAttrs: any): SVGElement => (id && (nsAttrs.id = id),
	attr(document.createElementNS(_.svgNs, tagName), nsAttrs));

export const svg = (html: string): Element => {
	let template = document.createElementNS(_.svgNs, "template");
	template.innerHTML = html;
	return template.children[0];
};

export const html = (html: string): ChildNode => {
	let template = document.createElement("template");
	template.innerHTML = html;
	return <any>template.content.firstChild;
};

export const each = (obj: any, fn: (value: any, key: string, ndx: number) => void) => {		//for objects
	if (!isFn(fn) || !obj)
		return;
	let ndx = 0;
	for (let key in obj)
		if (!obj.hasOwnProperty || obj.hasOwnProperty(key))
			fn(obj[key], key, ndx++);	// (value, key, index)
};

export const map = (obj: any, fn: (value: any, key: string, ndx: number) => any) => {		//for objects
	let arr: any[] = [];
	each(obj, (value: any, key: string, ndx: number) => {
		arr.push(fn(value, key, ndx));
	});
	return arr;
};

export const filter = (obj: any, fn: (value: any, key: string, ndx: number) => any) => {		//for objects, returns an object with key=>value
	let o: any = {};
	each(obj, (value: any, key: string, ndx: number) => {
		fn(value, key, ndx) && (o[key] = value);
	});
	return o;
};

/**
 * @description
 * @param obj an object to filter
 * @param fn if it returns true array[]= value (key is lost), if object array[] = object, otherwise discarded
 */
export const filterArray = (obj: any, fn: (value: any, key: string, ndx: number) => any) => {
	let o: any[] = [];
	each(obj, (value: any, key: string, ndx: number) => {
		let
			res = fn(value, key, ndx);
		if (res === true)
			o.push(value)
		else if (pojo(res))
			o.push(res);
	});
	return o;
};

export const prop = function () {
	let
		a = Array.from(arguments),
		o,
		r;
	if (a.length) {
		//get object
		o = a.shift();
		//get properties
		r = a.shift().split('.');
		if (!a.length) {
			//it's a get property value
			for (var f = o[r.shift()], u = 0, i = r.length; i > u; u++)
				f = f[r[u]];
			return f
		} else {
			//it's a set property value
			let
				f = o,
				prop;
			if (!(prop = r.pop()))
				return o;
			r.forEach((k: any) => f = f[k]);
			//set
			f[prop] = a.shift();
		}
	}
};

export const ready = (fn: Function) => { //https://plainjs.com/javascript/events/running-code-when-the-document-is-ready-15/
	if (!isFn(fn)) {
		return !1;
	}
	if (document.readyState != "loading")
		return (fn(), !0);
	else if (document["addEventListener"])
		aEL(<any>document, "DOMContentLoaded", fn, false);
	else
		(<any>document).attachEvent("onreadystatechange", () => {
			if (document.readyState == "complete")
				fn();
		});
	return !0;
};

const qS = (s: string): HTMLElement => <HTMLElement>document.querySelector(s);
export { qS }

export const qSA = (s: string) => document.querySelectorAll(s);
export const gEId = (id: string) => document.getElementById(id);

export const basePath = () => {
	let
		meta = qS('meta[name="base"]');
	return meta ? meta.getAttribute('content') : "";
}