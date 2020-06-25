"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.XML = exports.Templates = void 0;
var Templates = /** @class */ (function () {
    function Templates() {
    }
    Templates.get = function (key) { return Templates.map.get(key); };
    Templates.set = function (key, value) { Templates.map.set(key, value); };
    Object.defineProperty(Templates, "size", {
        get: function () { return Templates.map.size; },
        enumerable: false,
        configurable: true
    });
    Templates.register = function (obj) {
        for (var key in obj) {
            Templates.set(key, obj[key]);
        }
    };
    /**
     * @description simple template parser
     * @param key template's key name
     * @param obj object to get values from
     */
    Templates.nano = function (key, obj) {
        var str = Templates.get(key);
        return str.replace(/\{\{\s*([\w\.]*)\s*\}\}/g, function (n, t) {
            for (var arr = t.split("."), f = obj[arr.shift()], i = 0, len = arr.length; f && len > i; i++)
                f = f[arr[i]];
            return "undefined" != typeof f && null !== f ? f : "null";
        });
    };
    /**
     * @description full template parser
     * @param key template's key name
     * @param obj object to get values from
     */
    Templates.parse = function (key, obj, beautify) {
        var str = Templates.get(key), parser = new DOMParser(), 
        //serializer = new XMLSerializer(),
        xml = parser.parseFromString(str, "text/html"), // XML.parse(str), // 
        nsMap = new Map(), getValue = function (ns, o) {
            for (var arr = ns.split("."), f = o[arr.shift()], i = 0, len = arr.length; f && len > i; i++)
                f = f[arr[i]];
            return f;
        }, getMappedValue = function (ns) {
            var value = nsMap.get(ns);
            !value && nsMap.set(ns, value = getValue(ns, obj));
            return value;
        }, processNode = function (node, rootName, arr, ndx) {
            var i = 0, isMatch = false, attributes = Array.from(node.attributes), parseContent = function (str) {
                var regex = /\{\{\s*([\w\.]*)\s*\}\}/g, match, parsed = "", index = 0;
                while (match = regex.exec(str)) {
                    parsed += str.substr(index, match.index - index);
                    isMatch = true;
                    if (rootName == match[1])
                        parsed += arr[ndx];
                    else if (rootName && match[1].startsWith(rootName + '.')) {
                        parsed += getValue(match[1].substr(rootName.length + 1), arr[ndx]);
                    }
                    else {
                        parsed += getMappedValue(match[1]);
                    }
                    index = match.index + match[0].length;
                }
                parsed += str.substr(index, str.length - index);
                return parsed;
            };
            for (var i_1 = 0; i_1 < attributes.length; i_1++) {
                var attr = attributes[i_1], attrName = attr.name, isIndex = attrName == 'd-for-ndx', removeUndefined = attrName.endsWith('?'), value = void 0;
                isMatch = false;
                isIndex
                    ? (attrName = attr.value, value = ndx)
                    : (value = parseContent(attr.value), removeUndefined && (attrName = attrName.substr(0, attrName.length - 1)));
                if (removeUndefined || isIndex) {
                    node.removeAttribute(attr.name);
                    if (value != "undefined")
                        node.setAttribute(attrName, value);
                }
                else
                    isMatch && (attr.value = value);
            }
            if (!node.children.length) {
                node.firstChild && (node.firstChild.nodeValue = parseContent(node.firstChild.nodeValue));
            }
            else
                processChildren(node, rootName, arr, ndx);
        }, processChild = function (child, rootName, arr, ndx) {
            var _a;
            var _for = child.getAttribute('d-for');
            if (_for) {
                if (rootName)
                    throw 'nested @for not supported';
                child.removeAttribute('d-for');
                var match_1 = _for.match(/(\w*)\s+in\s+(\w*)/), array_1 = match_1 ? obj[match_1[2]] : void 0;
                if (!array_1)
                    throw 'invalid %for template';
                array_1.forEach(function (item, ndx) {
                    var _a;
                    var node = child.cloneNode(true);
                    (_a = child.parentElement) === null || _a === void 0 ? void 0 : _a.insertBefore(node, child);
                    processNode(node, match_1[1], array_1, ndx);
                });
                (_a = child.parentElement) === null || _a === void 0 ? void 0 : _a.removeChild(child);
                return array_1.length;
            }
            else {
                processNode(child, rootName, arr, ndx);
                return 1;
            }
        }, processChildren = function (parent, rootName, arr, ndx) {
            for (var i = 0, child = parent.children[i]; i < parent.children.length; child = parent.children[i]) {
                i += processChild(child, rootName, arr, ndx);
            }
        };
        processChildren(xml.body, void 0, void 0, void 0);
        return beautify ?
            XML.prettify(xml.body.firstChild)
            : xml.body.innerHTML;
    };
    Templates.map = new Map();
    return Templates;
}());
exports.Templates = Templates;
//https://gist.github.com/max-pub/a5c15b7831bbfaba7ad13acefc3d0781
var XML = {
    parse: function (str, type) {
        if (type === void 0) { type = 'text/xml'; }
        return new DOMParser().parseFromString(str, type);
    },
    stringify: function (DOM) { return new XMLSerializer().serializeToString(DOM); },
    transform: function (xml, xsl) {
        var proc = new XSLTProcessor();
        proc.importStylesheet(typeof xsl == 'string' ? XML.parse(xsl) : xsl);
        var output = proc.transformToFragment(typeof xml == 'string' ? XML.parse(xml) : xml, document);
        return typeof xml == 'string' ? XML.stringify(output) : output; // if source was string then stringify response, else return object
    },
    minify: function (node) { return XML.toString(node, false); },
    prettify: function (node) { return XML.toString(node, true); },
    toString: function (node, pretty, level, singleton) {
        if (level === void 0) { level = 0; }
        if (singleton === void 0) { singleton = false; }
        if (typeof node == 'string')
            node = XML.parse(node);
        var tabs = pretty ? Array(level + 1).fill('').join('\t') : '', newLine = pretty ? '\n' : '';
        if (node.nodeType == 3) {
            var nodeContent = (singleton ? '' : tabs) + node.textContent.trim();
            return nodeContent.trim() ? nodeContent + (singleton ? '' : newLine) : "";
        }
        if (!node.tagName)
            return XML.toString(node.firstChild, pretty);
        var output = tabs + ("<" + node.tagName); // >\n
        for (var i = 0; i < node.attributes.length; i++)
            output += " " + node.attributes[i].name + "=\"" + node.attributes[i].value + "\"";
        if (node.childNodes.length == 0)
            return output + ' />' + newLine;
        else
            output += '>';
        var onlyOneTextChild = ((node.childNodes.length == 1) && (node.childNodes[0].nodeType == 3));
        if (!onlyOneTextChild)
            output += newLine;
        for (var i = 0; i < node.childNodes.length; i++)
            output += XML.toString(node.childNodes[i], pretty, level + 1, onlyOneTextChild);
        return output + (onlyOneTextChild ? '' : tabs) + ("</" + node.tagName + ">") + newLine;
    }
};
exports.XML = XML;
//# sourceMappingURL=templates.js.map