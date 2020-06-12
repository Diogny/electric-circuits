"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Circuit = void 0;
var types_1 = require("./types");
var dab_1 = require("./dab");
var electron_1 = require("electron");
var Circuit = /** @class */ (function () {
    function Circuit(app, name, description) {
        this.app = app;
        this.name = name;
        this.description = description;
        this.ecMap = new Map();
        this.wireMap = new Map();
        this.selectedComponents = [];
        this.__modified = false;
    }
    Object.defineProperty(Circuit.prototype, "modified", {
        get: function () { return this.__modified; },
        set: function (value) {
            if (value == this.__modified)
                return;
            electron_1.ipcRenderer.invoke('shared-data', ['app.circuit.modified', value])
                .then(function (value) {
                console.log('setting modified: ', value);
            });
            this.__modified = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Circuit.prototype, "components", {
        //returns all components: ECs, Wires
        get: function () {
            return Array.from(this.ecMap.values())
                .concat(Array.from(this.wireMap.values()));
        },
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
    //components
    Circuit.prototype.hasComponent = function (id) { return this.ecMap.has(id); };
    Circuit.prototype.selectAll = function () {
        this.selectedComponents = selectAll.call(this, false);
    };
    Circuit.prototype.deselectAll = function () {
        selectAll.call(this, false);
        this.selectedComponents = [];
    };
    Circuit.prototype.toggleSelect = function (comp) {
        comp.select(!comp.selected);
        this.selectedComponents = Array.from(this.ecMap.values()).filter(function (c) { return c.selected; });
    };
    Circuit.prototype.selectThis = function (comp) {
        selectAll.call(this, false);
        this.selectedComponents = [comp.select(true)];
    };
    Circuit.prototype.selectRect = function (rect) {
        (this.selectedComponents =
            Array.from(this.ecMap.values())
                .filter(function (item) {
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
        this.modified = deletedCount != 0;
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
    Circuit.prototype.add = function (comp, fn) {
        switch (comp.type) {
            case types_1.Type.EC:
                return !this.ecMap.has(comp.id)
                    && (this.ecMap.set(comp.id, comp), fn && fn(comp), this.modified = true, true);
            case types_1.Type.WIRE:
                return !this.wireMap.has(comp.id)
                    && (this.wireMap.set(comp.id, comp), fn && fn(comp), this.modified = true, true);
        }
        return false;
    };
    Circuit.prototype.XML = function () {
        var ecs = '\t<ecs>\n'
            + Array.from(this.ecMap.values())
                .map(function (comp) { return dab_1.nano('\t\t<ec id="{id}" name="{name}" x="{x}" y="{y}" rot="{rotation}" />\n', comp); })
                .join('')
            + '\t</ecs>\n', wires = '\t<wires>\n'
            + Array.from(this.wireMap.values())
                .map(function (wire) { return dab_1.nano('\t\t<wire id="{id}" points="{points}" />\n', {
                id: wire.id,
                points: wire.points.map(function (p) { return dab_1.nano('{x},{y}', p); })
                    .join('|')
            }); })
                .join('')
            + '\t</wires>\n', bonds = this.components.map(function (comp) { return !comp.bonds.length ? "" : dab_1.nano("\t\t<bond id=\"{id}\" d=\"" + comp.bonds.map(function (o) { return o.link; }).filter(function (s) { return !!s; }).join(',') + "\" />\n", comp); })
            .filter(function (s) { return !!s; })
            .join('');
        return '<?xml version="1.0" encoding="utf-8"?>\n<circuit version="1.1.5">\n'
            + ecs + wires
            + '\t<bonds>\n' + bonds + '\t</bonds>\n'
            + '</circuit>\n';
    };
    Circuit.prototype.load = function (content) {
        return true;
    };
    return Circuit;
}());
exports.Circuit = Circuit;
function selectAll(value) {
    var arr = Array.from(this.ecMap.values());
    arr.forEach(function (comp) { return comp.select(value); });
    return arr;
}
//# sourceMappingURL=circuit.js.map