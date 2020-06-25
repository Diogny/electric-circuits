"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Circuit = void 0;
var ec_1 = require("./ec");
var wire_1 = require("./wire");
var types_1 = require("./types");
var rect_1 = require("./rect");
var dab_1 = require("./dab");
var electron_1 = require("electron");
var xml2js = require("xml2js");
var fs = require("fs");
var path = require("path");
var point_1 = require("./point");
var components_1 = require("./components");
var templates_1 = require("./templates");
var Circuit = /** @class */ (function () {
    function Circuit(options) {
        this.compMap = new Map();
        this.ecMap = new Map();
        this.wireMap = new Map();
        this.selectedComponents = [];
        this.uniqueCounters = {};
        this.version = options.version || "1.1.5";
        this.__zoom = Circuit.validZoom(options.zoom) ? options.zoom : Circuit.defaultZoom;
        this.name = options.name;
        this.description = options.description;
        this.filePath = options.filePath;
        this.__modified = false;
        this.view = new point_1.default(0, 0);
    }
    Circuit.prototype.rootComponent = function (name) {
        return this.compMap.get(name);
    };
    Object.defineProperty(Circuit.prototype, "zoom", {
        get: function () { return this.__zoom; },
        set: function (value) {
            Circuit.validZoom(value)
                && (this.__zoom != value)
                && (this.__zoom = value);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Circuit, "zoomMultipliers", {
        get: function () {
            return Array.from([8, 4, 2, 1, 0.75, 0.5, 0.33, 0.25, 0.166, 0.125]);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Circuit, "zoomFactors", {
        get: function () {
            return Array.from(["1/8X", "1/4X", "1/2X", "1X", "1 1/2X", "2X", "3X", "4X", "6X", "8X"]);
        },
        enumerable: false,
        configurable: true
    });
    Circuit.validZoom = function (zoom) {
        return !(isNaN(zoom)
            || !Circuit.zoomMultipliers.some(function (z) { return z == zoom; }) //["0.125", "0.166", "0.25", "0.33", "0.5", "0.75", "1", "2", "4", "8"]
        );
    };
    Object.defineProperty(Circuit.prototype, "modified", {
        get: function () { return this.__modified; },
        set: function (value) {
            if (value == this.__modified)
                return;
            this.__modified = value;
            //proof of concept
            /*ipcRenderer.invoke('shared-data', ['app.circuit.modified', value])
                .then(value => {
                    console.log('setting modified: ', value)
                });*/
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Circuit.prototype, "ecList", {
        get: function () { return Array.from(this.ecMap.values()); },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Circuit.prototype, "wireList", {
        get: function () { return Array.from(this.wireMap.values()); },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Circuit.prototype, "empty", {
        get: function () { return !(this.wireMap.size || this.ecMap.size); },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Circuit.prototype, "components", {
        get: function () { return this.ecList.concat(this.wireList); },
        enumerable: false,
        configurable: true
    });
    Circuit.prototype.get = function (id) {
        return this.ecMap.get(id) || this.wireMap.get(id);
    };
    Object.defineProperty(Circuit.prototype, "ec", {
        get: function () {
            return !this.selectedComponents.length ? void 0 : this.selectedComponents[0];
        },
        enumerable: false,
        configurable: true
    });
    //selection
    Circuit.prototype.hasComponent = function (id) { return this.ecMap.has(id); };
    Circuit.prototype.selectAll = function (value) {
        return (this.selectedComponents = Array.from(this.ecMap.values())
            .filter(function (comp) { return (comp.select(value), value); }));
    };
    Circuit.prototype.toggleSelect = function (comp) {
        comp.select(!comp.selected);
        this.selectedComponents =
            this.ecList.filter(function (c) { return c.selected; });
    };
    Circuit.prototype.selectThis = function (comp) {
        return comp
            && (this.selectAll(false).push(comp.select(true)), true);
    };
    Circuit.prototype.selectRect = function (rect) {
        (this.selectedComponents =
            this.ecList.filter(function (item) {
                return rect.intersect(item.rect());
            }))
            .forEach(function (item) { return item.select(true); });
    };
    Circuit.prototype.deleteSelected = function () {
        var _this = this;
        var deletedCount = 0;
        this.selectedComponents =
            this.selectedComponents.filter(function (c) {
                if (_this.delete(c)) {
                    deletedCount++;
                    return false;
                }
                return true;
            });
        return deletedCount;
    };
    Circuit.prototype.delete = function (comp) {
        if (comp.type == types_1.Type.WIRE ?
            this.wireMap.delete(comp.id) :
            this.ecMap.delete(comp.id)) {
            comp.disconnect();
            comp.remove();
            this.modified = true;
            return true;
        }
        return false;
    };
    Circuit.prototype.add = function (options) {
        var comp;
        ((name == "wire")
            && (options.points = options.points, true))
            || (options.x = options.x, options.y = options.y);
        comp = createBoardItem.call(this, options);
        this.modified = true;
        return comp;
    };
    Circuit.load = function (args) {
        //check filePath & data
        var circuit = new Circuit({
            filePath: args.filePath,
            name: "",
            zoom: 0,
            version: "",
        });
        parseCircuitXML.call(circuit, args.data);
        return circuit;
    };
    Circuit.prototype.save = function () {
        var self = this;
        return new Promise(function (resolve, reject) {
            var choice = 0;
            if (self.filePath) {
                fs.writeFileSync(self.filePath, getCircuitXML.call(self), 'utf-8');
                self.modified = false;
            }
            else {
                var answer = electron_1.ipcRenderer.sendSync('saveFile', {
                    data: getCircuitXML.call(self)
                });
                //error treatment
                if (answer.canceled)
                    choice = 1; // Cancel: 1
                else if (answer.error) {
                    //later popup with error
                    console.log(answer);
                    choice = 5; // Error: 5
                }
                else { //OK
                    self.filePath = answer.filePath;
                    self.modified = false;
                }
            }
            // Save: 0, Cancel: 1, Error: 5
            resolve(choice);
        });
    };
    Circuit.circuitProperties = function (circuit) {
        return [
            { label: "name", value: (circuit === null || circuit === void 0 ? void 0 : circuit.name) || "", required: true, placeHolder: "Name", visible: true },
            { label: "version", value: (circuit === null || circuit === void 0 ? void 0 : circuit.version) || "1.1.5", readonly: true, visible: true },
            { label: "description", value: (circuit === null || circuit === void 0 ? void 0 : circuit.description) || "", placeHolder: "Description", visible: true },
            { label: "filename", value: path.basename((circuit === null || circuit === void 0 ? void 0 : circuit.filePath) || ""), readonly: true, visible: true },
            { label: "path", value: (circuit === null || circuit === void 0 ? void 0 : circuit.filePath) || "", readonly: true, visible: true },
        ];
    };
    Circuit.prototype.destroy = function () {
        var _this = this;
        this.ecList.forEach(function (ec) { return _this.delete(ec); });
        this.wireList.forEach(function (wire) { return _this.delete(wire); });
        //maps should be empty here
        this.compMap = void 0;
        this.ecMap = void 0;
        this.wireMap = void 0;
        this.selectedComponents = void 0;
        this.__modified = false;
        this.filePath = void 0;
    };
    Circuit.prototype.boundariesRect = function () {
        var components = this.components, first = components.shift(), r = first ? first.rect() : rect_1.default.empty();
        components.forEach(function (ec) { return r.add(ec.rect()); });
        r.grow(20, 20);
        return r;
    };
    Circuit.defaultZoom = 0.5; // 2X
    return Circuit;
}());
exports.Circuit = Circuit;
function createBoardItem(options) {
    var self = this, regex = /(?:{([^}]+?)})+/g, name = (options === null || options === void 0 ? void 0 : options.name) || "", base = self.rootComponent(name), newComp = !base, item = void 0;
    !base && (base = {
        comp: components_1.default.find(name),
        count: 0
    });
    if (!base.comp)
        throw "unregistered component: " + name;
    newComp
        && (base.count = base.comp.meta.countStart | 0, self.compMap.set(name, base));
    options.base = base.comp;
    if (!options.id) {
        options.id = name + "-" + base.count;
    }
    //use template to create label according to defined strategy
    var label = base.comp.meta.nameTmpl.replace(regex, function (match, group) {
        var arr = group.split('.'), getRoot = function (name) {
            //valid entry points
            switch (name) {
                case "base": return base;
                case "Circuit": return self.uniqueCounters;
            }
        }, rootName = arr.shift() || "", rootRef = getRoot(rootName), prop = arr.pop(), isUniqueCounter = function () { return rootName == "Circuit"; }, result;
        while (rootRef && arr.length)
            rootRef = rootRef[arr.shift()];
        if (rootRef == undefined
            || ((result = rootRef[prop]) == undefined
                && (!isUniqueCounter()
                    || (result = rootRef[prop] = base.comp.meta.countStart | 0, false))))
            throw "invalid label template";
        isUniqueCounter()
            && dab_1.isNum(result)
            && (rootRef[prop] = result + 1);
        return result;
    });
    if (options.label && label != options.label)
        throw "invalid label";
    else
        options.label = label;
    base.count++;
    switch (name) {
        case "wire":
            item = new wire_1.default(self, options);
            if (self.wireMap.has(item.id))
                throw "duplicated id: " + item.id;
            self.wireMap.set(item.id, item);
            break;
        default:
            !options.onProp && (options.onProp = function () {
                //this happens when this component is created...
            });
            item = new ec_1.default(self, options);
            if (self.ecMap.has(item.id))
                throw "duplicated id: " + item.id;
            self.ecMap.set(item.id, item);
            break;
    }
    return item;
}
function parseCircuitXML(data) {
    var self = this;
    xml2js.parseString(data, {
        trim: true,
        explicitArray: false
    }, function (err, json) {
        if (err)
            console.log(err);
        else {
            var circuit_1 = json.circuit || json.CIRCUIT, atttrs = circuit_1.$, getData_1 = function (value) {
                if (!value || (typeof value == "string"))
                    return [];
                if (value.$)
                    return [value];
                else
                    return value;
            }, getDataCompatibility = function (group) {
                switch (group) {
                    case "ecs":
                        return getData_1(circuit_1.ecs ? circuit_1.ecs.ec : circuit_1.ECS.EC);
                    case "wires":
                        return getData_1(circuit_1.wires ? circuit_1.wires.wire : circuit_1.WIRES.WIRE);
                    case "bonds":
                        return getData_1(circuit_1.bonds ? circuit_1.bonds.bond : circuit_1.BONDS.BOND);
                }
                return [];
            }, ECS = getDataCompatibility("ecs"), WIRES = getDataCompatibility("wires"), BONDS = getDataCompatibility("bonds"), view = (atttrs.view || "").split(',');
            //attributes
            self.version = atttrs.version;
            !Circuit.validZoom(self.zoom = parseFloat(atttrs.zoom))
                && (self.zoom = Circuit.defaultZoom);
            self.name = atttrs.name;
            self.description = atttrs.description;
            self.view = new point_1.default(parseInt(view[0]) | 0, parseInt(view[1]) | 0);
            //create ECs
            ECS.forEach(function (xml) {
                createBoardItem.call(self, {
                    id: xml.$.id,
                    name: xml.$.name,
                    x: parseInt(xml.$.x),
                    y: parseInt(xml.$.y),
                    rotation: parseInt(xml.$.rot),
                    label: xml.$.label,
                }, false);
            });
            WIRES.forEach(function (xml) {
                var options = {
                    id: xml.$.id,
                    name: "wire",
                    label: xml.$.label,
                    points: xml.$.points.split('|').map(function (s) { return point_1.default.parse(s); }),
                };
                if (options.points.some(function (p) { return !p; }))
                    throw "invalid wire points";
                createBoardItem.call(self, options, false);
            });
            BONDS.forEach(function (s) {
                var arr = s.split(','), fromIt = self.get(arr.shift()), fromNdx = parseInt(arr.shift()), toIt = self.get(arr.shift()), toNdx = parseInt(arr.shift());
                if (arr.length || !fromIt || !toIt || !fromIt.getNode(fromNdx) || !toIt.getNode(toNdx))
                    throw "invalid bond";
                fromIt.bond(fromNdx, toIt, toNdx);
            });
        }
    });
}
function getAllCircuitBonds() {
    var bonds = [], keyDict = new Set(), findBonds = function (bond) {
        var fromId = bond.from.id, fromNdx = bond.from.ndx, keyRoot = fromId + "," + fromNdx;
        bond.to.forEach(function (b) {
            var otherRoot = b.id + "," + b.ndx, key0 = keyRoot + "," + otherRoot;
            if (!keyDict.has(key0)) {
                keyDict.add(key0).add(otherRoot + "," + keyRoot);
                bonds.push(key0);
            }
        });
    };
    this.components
        .forEach(function (comp) { return comp.bonds.forEach(findBonds); });
    return bonds;
}
function getCircuitXML() {
    var self = this;
    return '<?xml version="1.0" encoding="utf-8"?>\n'
        + templates_1.Templates.parse('circuitXml', {
            version: self.version,
            name: self.name,
            zoom: self.zoom,
            description: self.description,
            view: self.view,
            ecList: self.ecList,
            wireList: self.wireList.map(function (w) { return ({
                id: w.id,
                label: w.label,
                points: w.points.map(function (p) { return templates_1.Templates.nano('simplePoint', p); })
                    .join('|')
            }); }),
            bonds: getAllCircuitBonds.call(self)
        }, true);
}
//# sourceMappingURL=circuit.js.map