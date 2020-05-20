"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var dab_1 = require("./dab");
var Comp = /** @class */ (function () {
    function Comp(options) {
        var _this = this;
        //copy making a dupplicate
        this.settings = dab_1.obj(options);
        //check to see if this component derivates from a template
        if (this.settings.tmpl) {
            var tmp = Comp.find(this.settings.tmpl.name, true);
            //copy SVG data
            this.settings.data = tmp.obj.data;
            //deep copy meta
            this.settings.meta = dab_1.obj({
                "nodes": tmp.obj.nodes,
                "logic": tmp.obj.logic
            });
            //update svg text tag if provided
            var lbl = this.settings.tmpl.label;
            lbl && (this.settings.data = this.settings.data
                .replace(/\<text[^\>]*\>(.*)\<\/text\>/gm, "<text x='" + lbl.x + "' y='" + lbl.y + "' font-size='" + lbl.font + "'>" + lbl.text + "</text>"));
            //update node labels
            this.settings.tmpl.labels.forEach(function (lbl, ndx) {
                _this.settings.meta.nodes.list[ndx].label = lbl;
            });
        }
        if (!Comp.store(this.settings.name, this))
            throw "duplicated: " + this.settings.name;
    }
    Object.defineProperty(Comp.prototype, "name", {
        get: function () { return this.settings.name; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Comp.prototype, "type", {
        get: function () { return this.settings.type; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Comp.prototype, "data", {
        get: function () { return this.settings.data; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Comp.prototype, "props", {
        get: function () { return this.settings.properties; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Comp.prototype, "nodes", {
        get: function () { return this.settings.meta.nodes; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Comp.prototype, "logic", {
        get: function () { return this.settings.meta.logic; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Comp, "count", {
        get: function () { return Comp.boardItems.size; },
        enumerable: false,
        configurable: true
    });
    Comp.storeComponent = function (map, name, o) {
        return map.set(name, dab_1.obj({
            //interface IBaseComponent
            count: 0,
            obj: o
        }));
    };
    Comp.initializeComponents = function (list) {
        var set = Comp.baseComps;
        if (set == null) {
            set = new Map();
        }
        list.forEach(function (c) {
            Comp.storeComponent(set, c.name, c.obj);
        });
        return set;
    };
    Comp.baseComps = Comp.initializeComponents([{
            name: "label",
            obj: {
                name: "label", type: "label"
            }
        },
        {
            name: "wire",
            obj: {
                name: "wire", type: "wire"
            }
        }
    ]); // all base components with metadata
    Comp.boardItems = new Map(); //all ecs, wires in the board
    ////////////////////////////// STATIC ////////////////////////////////
    Comp.each = function (callbackfn) { return Comp.boardItems.forEach(callbackfn); };
    //it can be sent #id
    Comp.item = function (id) { return Comp.boardItems.get((id).startsWith('#') ? id.slice(1) : id); };
    Comp.save = function (obj) {
        if (!obj)
            return false;
        return (Comp.boardItems.set(obj.id, obj), true);
    };
    //BASE COMPONENT METADATA
    //register a new base component template
    Comp.register = function (options) { return new Comp(options); };
    Comp.store = function (name, obj) {
        return Comp.baseComps.has(name) ?
            false :
            (Comp.storeComponent(Comp.baseComps, name, obj), true);
    };
    Comp.has = function (name) { return Comp.baseComps.has(name); };
    Comp.find = function (name, original) {
        var entry = Comp.baseComps.get(name);
        return (!entry || original) ? entry : dab_1.obj({
            obj: entry.obj,
            count: entry.count
        });
    };
    return Comp;
}());
exports.default = Comp;
//# sourceMappingURL=components.js.map