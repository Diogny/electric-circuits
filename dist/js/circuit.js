"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Circuit = void 0;
var ec_1 = require("./ec");
var wire_1 = require("./wire");
var types_1 = require("./types");
var dab_1 = require("./dab");
var electron_1 = require("electron");
var xml2js = require("xml2js");
var fs = require("fs");
var point_1 = require("./point");
var components_1 = require("./components");
var Circuit = /** @class */ (function () {
    function Circuit(options) {
        this.compMap = new Map();
        this.ecMap = new Map();
        this.wireMap = new Map();
        this.selectedComponents = [];
        this.uniqueCounters = {};
        //empty Circuit
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
    Circuit.validZoom = function (zoom) {
        return !(isNaN(zoom)
            || !["0.125", "0.166", "0.25", "0.33", "0.5", "0.75", "1", "2", "4", "8"].some(function (s) { return parseFloat(s) == zoom; }));
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
        //returns all components: ECs, Wires
        get: function () { return this.ecList.concat(this.wireList); },
        enumerable: false,
        configurable: true
    });
    Circuit.prototype.get = function (id) {
        return this.ecMap.get(id) || this.wireMap.get(id);
    };
    Object.defineProperty(Circuit.prototype, "ec", {
        //has value if only one comp selected, none or multiple has undefined
        get: function () {
            return !this.selectedComponents.length ? void 0 : this.selectedComponents[0];
        },
        enumerable: false,
        configurable: true
    });
    //selection
    Circuit.prototype.hasComponent = function (id) { return this.ecMap.has(id); };
    Circuit.prototype.selectAll = function () {
        this.selectedComponents = selectAll.call(this, true);
    };
    Circuit.prototype.deselectAll = function () {
        selectAll.call(this, false);
        this.selectedComponents = [];
    };
    Circuit.prototype.toggleSelect = function (comp) {
        comp.select(!comp.selected);
        this.selectedComponents = this.ecList.filter(function (c) { return c.selected; });
    };
    Circuit.prototype.selectThis = function (comp) {
        selectAll.call(this, false);
        this.selectedComponents = [comp.select(true)];
    };
    Circuit.prototype.selectRect = function (rect) {
        (this.selectedComponents = this.ecList.filter(function (item) {
            return rect.intersect(item.rect());
        }))
            .forEach(function (item) { return item.select(true); });
    };
    Circuit.prototype.deleteSelected = function () {
        var _this = this;
        var deletedCount = 0;
        this.selectedComponents = this.selectedComponents.filter(function (c) {
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
        ((name == "wire") && (options.points = options.points, true))
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
                    console.log(answer); //later popup with error
                    choice = 5; // Error: 5
                }
                else { //OK
                    self.filePath = answer.filePath;
                    self.modified = false;
                }
            }
            resolve(choice); // Save: 0, Cancel: 1, Error: 5
        });
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
    Circuit.defaultZoom = 0.5; // 2X
    return Circuit;
}());
exports.Circuit = Circuit;
function createBoardItem(options) {
    var self = this, regex = /(?:{([^}]+?)})+/g, name = (options === null || options === void 0 ? void 0 : options.name) || "", base = self.rootComponent(name), newComp = !base, item = void 0;
    //register new component in the circuit
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
        //if not ID
        options.id = name + "-" + base.count;
        //use template to create label according to defined strategy
        options.label = base.comp.meta.nameTmpl.replace(regex, function (match, group) {
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
            //increment counter only for static properties
            isUniqueCounter() && dab_1.isNum(result) && (rootRef[prop] = result + 1);
            return result;
        });
        base.count++;
    }
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
    //answer.filePath
    xml2js.parseString(data, { trim: true, explicitArray: false }, function (err, json) {
        if (err)
            console.log(err);
        else {
            var atttrs = json.circuit.$, getData = function (value) {
                if (!value || (typeof value == "string"))
                    return [];
                if (value.$)
                    return [value];
                else
                    return value;
            }, ecs = getData(json.circuit.ecs.ec), wires = getData(json.circuit.wires.wire), bonds = getData(json.circuit.bonds.bond), view = (atttrs.view || "").split(',');
            //attributes
            self.version = atttrs.version;
            !Circuit.validZoom(self.zoom = parseFloat(atttrs.zoom))
                && (self.zoom = Circuit.defaultZoom);
            self.name = atttrs.name;
            self.description = atttrs.description;
            self.view = new point_1.default(parseInt(view[0]) | 0, parseInt(view[1]) | 0);
            //create ECs
            ecs.forEach(function (xml) {
                createBoardItem.call(self, {
                    id: xml.$.id,
                    name: xml.$.name,
                    x: parseInt(xml.$.x),
                    y: parseInt(xml.$.y),
                    rotation: parseInt(xml.$.rot),
                    label: xml.$.label,
                }, false);
            });
            wires.forEach(function (xml) {
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
            bonds.forEach(function (s) {
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
    var self = this, circuitMetadata = function () {
        var description = self.description
            ? " description=\"" + self.description + "\"" : "";
        return "<circuit version=\"1.1.5\" zoom=\"" + self.zoom + "\" name=\"" + self.name + "\"" + description + " view=\"" + self.view.x + "," + self.view.y + "\">\n";
    }, ecTmpl = '\t\t<ec id="{id}" name="{name}" x="{x}" y="{y}" rot="{rotation}" label="{label}" />\n', ecs = '\t<ecs>\n'
        + self.ecList
            .map(function (comp) { return dab_1.nano(ecTmpl, comp); })
            .join('')
        + '\t</ecs>\n', wireTnpl = '\t\t<wire id="{id}" points="{points}" label="{label}" />\n', wires = '\t<wires>\n'
        + self.wireList
            .map(function (wire) { return dab_1.nano(wireTnpl, {
            id: wire.id,
            points: wire.points.map(function (p) { return dab_1.nano('{x},{y}', p); })
                .join('|'),
            label: wire.label
        }); })
            .join('')
        + '\t</wires>\n', bonds = getAllCircuitBonds.call(self)
        .map(function (b) { return "\t\t<bond>" + b + "</bond>\n"; })
        .join('');
    return '<?xml version="1.0" encoding="utf-8"?>\n'
        + circuitMetadata()
        + ecs
        + wires
        + '\t<bonds>\n' + bonds + '\t</bonds>\n'
        + '</circuit>\n';
}
function selectAll(value) {
    var arr = Array.from(this.ecMap.values());
    arr.forEach(function (comp) { return comp.select(value); });
    return arr;
}
//# sourceMappingURL=circuit.js.map