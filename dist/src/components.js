"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var dab_1 = require("./dab");
var defaultIdTemplate = "{base.comp.name}-{base.count}";
var defaultComponent = function (name) { return ({
    name: name,
    comp: {
        name: name,
        type: name,
        meta: {
            nameTmpl: defaultIdTemplate,
            nodes: []
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
            var base = Comp.find(template.name);
            //copy SVG data
            this.settings.data = base.data;
            //deep copy meta, it has simple object and values
            this.settings.meta = JSON.parse(JSON.stringify(base.meta));
            //copy label if any
            template.label && (this.settings.meta.label = dab_1.obj(template.label));
            //update node labels
            template.nodeLabels.forEach(function (lbl, ndx) {
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
        get: function () { return this.settings.meta; },
        enumerable: false,
        configurable: true
    });
    Comp.initializeComponents = function (list) {
        var set = Comp.baseComps;
        if (set == null) {
            set = new Map();
        }
        list.forEach(function (c) {
            set.set(c.name, c.comp);
        });
        return set;
    };
    Comp.baseComps = Comp.initializeComponents([defaultComponent("tooltip"), defaultComponent("wire")]);
    Comp.register = function (options) { return new Comp(options); };
    Comp.store = function (name, comp) {
        return Comp.baseComps.has(name) ?
            false :
            (Comp.baseComps.set(name, comp), true);
    };
    Comp.has = function (name) { return Comp.baseComps.has(name); };
    Comp.find = function (name) {
        return Comp.baseComps.get(name);
    };
    return Comp;
}());
exports.default = Comp;
//# sourceMappingURL=components.js.map