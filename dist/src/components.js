"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var dab_1 = require("./dab");
var defaultIdTemplate = "{name}-{count}";
var defaultComponent = function (name) { return ({
    name: name,
    obj: {
        name: name,
        type: name,
        meta: {
            nameTmpl: defaultIdTemplate
        }
    }
}); };
var Comp = /** @class */ (function () {
    function Comp(options) {
        var that = this, template = options.tmpl;
        //delete
        delete options.tmpl;
        //copy making a dupplicate
        this.settings = dab_1.obj(options);
        //check to see if this component derivates from a template
        if (template) {
            var comp = Comp.find(template.name, true);
            //copy SVG data
            this.settings.data = comp.obj.data;
            //deep copy meta, it has simple object and values
            this.settings.meta = JSON.parse(JSON.stringify(comp.obj.meta));
            //copy label if any
            template.label && (this.settings.meta.label = dab_1.obj(template.label));
            //update node labels
            template.labels.forEach(function (lbl, ndx) {
                that.settings.meta.nodes.list[ndx].label = lbl;
            });
        }
        //set default id template if not defined
        !this.settings.meta.nameTmpl && (this.settings.meta.nameTmpl = defaultIdTemplate);
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
    Object.defineProperty(Comp.prototype, "meta", {
        get: function () {
            return this.settings.meta;
        },
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
            count: o.meta.countStart | 0,
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
    // all base components with metadata
    Comp.baseComps = Comp.initializeComponents([defaultComponent("tooltip"), defaultComponent("wire")]);
    //all ecs, wires in the board
    Comp.boardItems = new Map();
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