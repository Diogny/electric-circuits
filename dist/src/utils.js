"use strict";
//... still in progress ...
Object.defineProperty(exports, "__esModule", { value: true });
exports.basePath = exports.gEId = exports.qSA = exports.qS = exports.ready = exports.prop = exports.filterArray = exports.filter = exports.map = exports.each = exports.html = exports.svg = exports.tag = exports.pad = exports.exec = exports.templatesDOM = exports.templatesUrl = void 0;
var ajaxp_1 = require("./ajaxp");
var dab_1 = require("./dab");
function scriptContent(key, text) {
    var regexSingle = /<script[^\>]*>([\s\S]*?)<\/script>/gi, //regex are not reusable
    match = regexSingle.exec(text);
    //window[key] = text;
    return match ? match[1].replace(/\r|\n/g, "").trim() : "";
}
;
//ajaxp.get(`${base}api/1.0/templates/circuits/stockSymbol,gate_card`, { 'responseType': 'json' })
exports.templatesUrl = function (url, obj) { return ajaxp_1.default.get(url, obj || { 'responseType': 'json' })
    .then(function (data) {
    var regex = /<script.*?id\s*=\s*['"]([^'|^"]*)['"].*?>([\s\S]*?)<\/script>/gmi, templates = {}, match;
    if (dab_1.isObj(data)) {
        exports.each(data.result, function (d, k) {
            templates[k] = scriptContent(k, d.text);
        });
    }
    else {
        while ((match = regex.exec(data)))
            // full match is in match[0], whereas captured groups are in ...[1], ...[2], etc.
            templates[match[1]] = match[2].replace(/\r|\n/g, "").trim();
    }
    //return scriptContent(data.matches['stockSymbol'].text);		
    return templates;
}); };
exports.templatesDOM = function (query) {
    return new Promise(function (resolve, reject) {
        //query:string   id0|id1|id[n]
        var templates = {
            count: 0
        }, idList = Array.isArray(query) ? query : query.split('|');
        idList.forEach(function (id) {
            var tmpl = qS("#" + id), src = tmpl ? tmpl.innerHTML.replace(/\r|\n/g, "").trim() : undefined;
            tmpl && (templates.count++, templates[id] = src);
        });
        resolve(templates);
    });
};
exports.exec = function (fn, error) {
    var o = {};
    //let			o : execObj= {};
    try {
        o.result = fn();
    }
    catch (ex) {
        o.error = ex;
        dab_1.isFn(error) && error(o);
    }
    return o;
};
exports.pad = function (t, e, ch) { return new Array((e || 2) + 1 - String(t).length).join(ch ? ch : '0') + t; };
exports.tag = function (tagName, id, nsAttrs) { return (id && (nsAttrs.id = id),
    dab_1.attr(document.createElementNS(dab_1.consts.svgNs, tagName), nsAttrs)); };
exports.svg = function (html) {
    var template = document.createElementNS(dab_1.consts.svgNs, "template");
    template.innerHTML = html;
    return template.children[0];
};
exports.html = function (html) {
    var template = document.createElement("template");
    template.innerHTML = html;
    return template.content.firstChild;
};
exports.each = function (obj, fn) {
    if (!dab_1.isFn(fn) || !obj)
        return;
    var ndx = 0;
    for (var key in obj)
        if (!obj.hasOwnProperty || obj.hasOwnProperty(key))
            fn(obj[key], key, ndx++); // (value, key, index)
};
exports.map = function (obj, fn) {
    var arr = [];
    exports.each(obj, function (value, key, ndx) {
        arr.push(fn(value, key, ndx));
    });
    return arr;
};
exports.filter = function (obj, fn) {
    var o = {};
    exports.each(obj, function (value, key, ndx) {
        fn(value, key, ndx) && (o[key] = value);
    });
    return o;
};
/**
 * @description
 * @param obj an object to filter
 * @param fn if it returns true array[]= value (key is lost), if object array[] = object, otherwise discarded
 */
exports.filterArray = function (obj, fn) {
    var o = [];
    exports.each(obj, function (value, key, ndx) {
        var res = fn(value, key, ndx);
        if (res === true)
            o.push(value);
        else if (dab_1.pojo(res))
            o.push(res);
    });
    return o;
};
exports.prop = function (o, path, value) {
    var r = path.split('.').map(function (s) { return s.trim(); }), last = r.pop(), result = void 0;
    for (var i = 0; !!o && i < r.length; i++) {
        o = o[r[i]];
    }
    result = o && last && o[last];
    if (value == undefined) {
        return result;
    }
    else {
        return (result != undefined) && (o[last] = value, true);
    }
};
exports.ready = function (fn) {
    if (!dab_1.isFn(fn)) {
        return !1;
    }
    if (document.readyState != "loading")
        return (fn(), !0);
    else if (document["addEventListener"])
        dab_1.aEL(document, "DOMContentLoaded", fn, false);
    else
        document.attachEvent("onreadystatechange", function () {
            if (document.readyState == "complete")
                fn();
        });
    return !0;
};
var qS = function (s) { return document.querySelector(s); };
exports.qS = qS;
exports.qSA = function (s) { return document.querySelectorAll(s); };
exports.gEId = function (id) { return document.getElementById(id); };
exports.basePath = function () {
    var meta = qS('meta[name="base"]');
    return meta ? meta.getAttribute('content') : "";
};
//# sourceMappingURL=utils.js.map