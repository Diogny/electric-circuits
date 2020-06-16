"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ajaxp = /** @class */ (function () {
    function ajaxp() {
    }
    ajaxp.x = function () { return window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject('Microsoft.XMLHTTP'); };
    ajaxp.query = function (data, ask) {
        var query = [];
        for (var key in data) {
            query.push(encodeURIComponent(key) + "=" + encodeURIComponent(data[key]));
        }
        return ((ask && query.length) ? "?" : "") + query.join("&");
    };
    ajaxp.update = function (io, obj) {
        for (var p in io) {
            obj[p] = obj[p] || io[p];
        }
        return obj;
    };
    ajaxp.send = function (url, ox) {
        return new Promise(function (resolve, reject) {
            var x = ajaxp.x();
            ox = ajaxp.update(ajaxp.xobj, ox);
            x.open(ox.method, url, true);
            x[ajaxp.rt] = ox.responseType;
            x.onreadystatechange = function () {
                var DONE = 4, // readyState 4 means the request is done.
                OK = 200, // status 200 is a successful return.
                NOT_MODIFIED = 304;
                if (x.readyState == DONE) {
                    var isJson = x[ajaxp.rt] && (x[ajaxp.rt] == "json");
                    if (x.status === OK || x.status === NOT_MODIFIED) {
                        resolve(isJson ? x.response : x.responseText);
                    }
                    else {
                        reject({ status: x.status, d: x.response, xhr: x });
                    }
                }
            };
            if (ox.method == ajaxp.sPost) {
                x.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
            }
            x.onerror = function (e) {
                reject(e);
            };
            try {
                x.send(ox.data);
            }
            catch (e) {
                reject({ status: x.status, statusText: x.statusText, xhr: x });
            }
        });
    };
    ajaxp.get = function (url, ox) {
        return (ox = ox || {}, ox.method = ajaxp.sGet, url += ajaxp.query(ox.data, true), ox.data = void 0, ajaxp.send(url, ox));
    };
    ajaxp.post = function (url, ox) {
        return (ox = ox || {}, ox.method = ajaxp.sPost, ox.data = ajaxp.query(ox.data, false), ajaxp.send(url, ox));
    };
    ajaxp.sGet = "GET";
    ajaxp.sPost = "POST";
    ajaxp.xobj = {
        method: ajaxp.sGet,
        data: void 0,
        responseType: "text"
    };
    ajaxp.rt = "responseType";
    return ajaxp;
}());
exports.default = ajaxp;
//# sourceMappingURL=ajaxp.js.map