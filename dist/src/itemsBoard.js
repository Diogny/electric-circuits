"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.BondsInjector = exports.IdInjector = exports.StringInjector = exports.PositionInjector = exports.PointInjector = exports.PropertyInjector = exports.ItemBoard = void 0;
var dab_1 = require("./dab");
var bonds_1 = require("./bonds");
var itemsBase_1 = require("./itemsBase");
var components_1 = require("./components");
var boardCircle_1 = require("./boardCircle");
var utils_1 = require("./utils");
var point_1 = require("./point");
//ItemBoard->Wire
var ItemBoard = /** @class */ (function (_super) {
    __extends(ItemBoard, _super);
    function ItemBoard(options) {
        var _this = _super.call(this, options) || this;
        var base = components_1.default.find(_this.name, true), regex = /(?:{([^}]+?)})+/g, that = _this;
        if (!base)
            throw "unknown component: " + _this.name;
        //save base data
        _this.settings.base = base.comp;
        //global component count incremented
        _this.settings.id = _this.base.name + "-" + base.count++;
        //use template to create label according to defined strategy
        _this.label = base.comp.meta.nameTmpl.replace(regex, function (match, group) {
            var arr = group.split('.'), getRoot = function (name) {
                //valid entry points
                switch (name) {
                    case "this": return that;
                    case "base": return base;
                    case "Comp": return components_1.default;
                }
            }, rootName = arr.shift() || "", rootRef = getRoot(rootName), prop = arr.pop(), result;
            while (rootRef && arr.length)
                rootRef = rootRef[arr.shift()];
            if (rootRef == undefined || (result = rootRef[prop]) == undefined)
                throw "invalid label template";
            //increment counter only for static properties
            (rootName == "Comp") && dab_1.isNum(result) && (rootRef[prop] = result + 1);
            return result;
        });
        //deep copy component properties
        _this.settings.props = dab_1.obj(base.comp.props);
        //add properties to DOM
        dab_1.attr(_this.g, {
            id: _this.id,
            "svg-comp": _this.base.type,
        });
        //create the highligh object
        _this.highlight = new boardCircle_1.default(_this.settings.highlightNodeName);
        //add it to component, this's the insertion point (insertBefore) for all inherited objects
        dab_1.aCld(_this.g, _this.highlight.g);
        //add component label if available
        var createText = function (attr, text) {
            var svgText = utils_1.tag("text", "", attr);
            return svgText.innerHTML = text, svgText;
        };
        //for labels in N555, 7408, Atmega168
        if (base.comp.meta.label) {
            dab_1.aCld(_this.g, createText({
                x: base.comp.meta.label.x,
                y: base.comp.meta.label.y,
                "class": base.comp.meta.label.class
            }, base.comp.meta.label.text));
        }
        //add node labels for DIP packages
        if (base.comp.meta.nodes.createLabels) {
            var pins = _this.count / 2;
            for (var y = 60, x = 7, i = 0, factor = 20; y > 0; y -= 44, x += (factor = -factor))
                for (var col = 0; col < pins; col++, i++, x += factor)
                    dab_1.aCld(_this.g, createText({ x: x, y: y }, i + ""));
        }
        return _this;
        //this still doesn't work to get all overridable properties ¿?
        //properties still cannot access super value
        //(<any>this.settings).__selected = dab.propDescriptor(this, "selected");
    }
    Object.defineProperty(ItemBoard.prototype, "base", {
        get: function () { return this.settings.base; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ItemBoard.prototype, "onProp", {
        get: function () { return this.settings.onProp; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ItemBoard.prototype, "selected", {
        get: function () { return this.settings.selected; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ItemBoard.prototype, "bonds", {
        get: function () { return this.settings.bonds; },
        enumerable: false,
        configurable: true
    });
    ItemBoard.prototype.select = function (value) {
        if (this.selected != value) {
            //set new value
            this.settings.selected = value;
            //add class if selected
            dab_1.condClass(this.g, "selected", this.selected);
            //unselect any node if any
            this.highlight.hide();
            //trigger property changed if applicable
            this.onProp && this.onProp({
                id: "#" + this.id,
                value: this.selected,
                prop: "selected",
                where: 1 //signals it was a change inside the object
            });
        }
        return this;
    };
    ItemBoard.prototype.setColor = function (value) {
        _super.prototype.setColor.call(this, value);
        //trigger property changed if applicable
        this.onProp && this.onProp({
            id: "#" + this.id,
            value: this.color,
            prop: "color",
            where: 1 //signals it was a change inside the object
        });
        return this;
    };
    ItemBoard.prototype.move = function (x, y) {
        _super.prototype.move.call(this, x, y);
        //trigger property changed if applicable
        this.onProp && this.onProp({
            id: "#" + this.id,
            args: {
                x: this.x,
                y: this.y
            },
            method: 'move',
            where: 1 //signals it was a change inside the object
        });
        return this; //for object chaining
    };
    ItemBoard.prototype.setOnProp = function (value) {
        dab_1.isFn(value) && (this.settings.onProp = value);
        //for object chaining
        return this;
    };
    //properties available to show up in property window
    ItemBoard.prototype.windowProperties = function () { return ["id", "p", "bonds"]; };
    ItemBoard.prototype.properties = function () {
        return this.windowProperties().concat(utils_1.map(this.settings.props, function (value, key) { return key; }));
    };
    ItemBoard.prototype.prop = function (propName) {
        //inject available properties if called
        switch (propName) {
            case "id":
                return new IdInjector(this);
            case "p":
                return new PositionInjector(this);
            case "bonds":
                return new BondsInjector(this);
        }
        return this.settings.props[propName];
    };
    //poly.bond(0, ec, 1)
    //poly.bond(poly.last, ec, 1)
    //ec.bond(1, poly, 0)
    //ec.bond(1, poly, poly.last)
    ItemBoard.prototype.bond = function (thisNode, ic, icNode) {
        var entry = this.nodeBonds(thisNode);
        // ic: wire,  node: wire node number, thisNode: node of IC connected
        if (!ic
            || (entry && entry.has(ic.id)) //there's a bond with a connection to this ic.id
            //!(ic.valid(node) || node == -1)) 	//(!ic.valid(node) && node != -1)
            || !ic.valid(icNode))
            return false;
        //make bond if first, or append new one
        if (!entry) {
            this.settings.bonds[thisNode] = entry = new bonds_1.default(this, ic, icNode, thisNode);
        }
        else {
            entry.add(ic, icNode);
        }
        //refresh this node
        this.nodeRefresh(thisNode);
        //make bond the other way, to this component, if not already done
        entry = ic.nodeBonds(icNode);
        //returning true when already a bond is to ensure the first bond call returns "true"
        return (entry && entry.has(this.id)) ? true : ic.bond(icNode, this, thisNode);
    };
    ItemBoard.prototype.nodeBonds = function (nodeName) {
        return this.bonds[nodeName];
    };
    ItemBoard.prototype.unbond = function (node, id) {
        //find nodeName bonds
        var bond = this.nodeBonds(node), b = (bond == null) ? null : bond.remove(id);
        if (b != null) {
            //
            if (bond.count == 0) {
                //ensures there's no bond object if no destination
                delete this.settings.bonds[node];
            }
            //refresh this item node
            this.nodeRefresh(node);
            var ic = components_1.default.item(id);
            ic && ic.unbond(b.ndx, this.id);
        }
    };
    ItemBoard.prototype.disconnect = function () {
        this.bonds.forEach(function (b) {
            b.to.forEach(function (link) {
                var toIc = components_1.default.item(link.id);
                toIc === null || toIc === void 0 ? void 0 : toIc.unbond(link.ndx, b.from.id);
            });
        });
    };
    //highligh short-cuts
    ItemBoard.prototype.setNodeRadius = function (value) {
        this.highlight.setRadius(value);
        return this;
    };
    ItemBoard.prototype.showNode = function (node) {
        var nodeData = this.getNode(node);
        if (nodeData) {
            this.highlight.move(nodeData.x, nodeData.y);
            this.highlight.show(node);
        }
        //for object chaining
        return this;
    };
    ItemBoard.prototype.hideNode = function () {
        this.highlight.hide();
        return this;
    };
    Object.defineProperty(ItemBoard.prototype, "highlighted", {
        get: function () { return this.highlight.visible; },
        enumerable: false,
        configurable: true
    });
    ItemBoard.prototype.propertyDefaults = function () {
        return dab_1.extend(_super.prototype.propertyDefaults.call(this), {
            selected: false,
            onProp: void 0,
            bonds: []
        });
    };
    return ItemBoard;
}(itemsBase_1.default));
exports.ItemBoard = ItemBoard;
var PropertyInjector = /** @class */ (function () {
    function PropertyInjector(ec, name, readonly) {
        this.ec = ec;
        this.name = name;
        this.readonly = readonly;
        if (!this.ec || !(this.name in this.ec))
            throw "invalid property " + this.name;
        this.class = "";
    }
    Object.defineProperty(PropertyInjector.prototype, "valueType", {
        get: function () { return "string"; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(PropertyInjector.prototype, "isProperty", {
        get: function () { return true; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(PropertyInjector.prototype, "label", {
        get: function () { return this.name; },
        enumerable: false,
        configurable: true
    });
    return PropertyInjector;
}());
exports.PropertyInjector = PropertyInjector;
var PointInjector = /** @class */ (function (_super) {
    __extends(PointInjector, _super);
    function PointInjector() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Object.defineProperty(PointInjector.prototype, "type", {
        get: function () { return "point"; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(PointInjector.prototype, "value", {
        get: function () { return this.ec[this.name].toString(0x06); } //no vars and no parenthesis
        ,
        enumerable: false,
        configurable: true
    });
    return PointInjector;
}(PropertyInjector));
exports.PointInjector = PointInjector;
var PositionInjector = /** @class */ (function (_super) {
    __extends(PositionInjector, _super);
    function PositionInjector(ec) {
        var _this = _super.call(this, ec, "p", false) || this;
        _this.ec = ec;
        return _this;
    }
    Object.defineProperty(PositionInjector.prototype, "label", {
        get: function () { return "position"; },
        enumerable: false,
        configurable: true
    });
    PositionInjector.prototype.setValue = function (val) {
        var p = point_1.default.parse(val);
        return p && (this.ec.move(p.x, p.y), true);
    };
    return PositionInjector;
}(PointInjector));
exports.PositionInjector = PositionInjector;
var StringInjector = /** @class */ (function (_super) {
    __extends(StringInjector, _super);
    function StringInjector(ec, name, readonly) {
        return _super.call(this, ec, name, readonly) || this;
    }
    Object.defineProperty(StringInjector.prototype, "type", {
        get: function () { return "string"; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(StringInjector.prototype, "value", {
        get: function () { return this.ec[this.name]; },
        enumerable: false,
        configurable: true
    });
    StringInjector.prototype.setValue = function (val) {
        return !this.readonly && (this.ec[this.name] = val, true);
    };
    return StringInjector;
}(PropertyInjector));
exports.StringInjector = StringInjector;
var IdInjector = /** @class */ (function (_super) {
    __extends(IdInjector, _super);
    function IdInjector(ec) {
        return _super.call(this, ec, "id", true) || this;
    }
    Object.defineProperty(IdInjector.prototype, "value", {
        get: function () { return this.ec[this.name]; },
        enumerable: false,
        configurable: true
    });
    IdInjector.prototype.setValue = function (val) { return false; };
    return IdInjector;
}(StringInjector));
exports.IdInjector = IdInjector;
var BondsInjector = /** @class */ (function (_super) {
    __extends(BondsInjector, _super);
    function BondsInjector(ec) {
        var _this = _super.call(this, ec, "bonds", true) || this;
        _this.class = "simple";
        return _this;
    }
    Object.defineProperty(BondsInjector.prototype, "value", {
        get: function () {
            return this.ec.bonds.map(function (o) { return o.link; }).filter(function (s) { return !!s; }).join(', ');
        },
        enumerable: false,
        configurable: true
    });
    BondsInjector.prototype.setValue = function (val) { return false; };
    return BondsInjector;
}(StringInjector));
exports.BondsInjector = BondsInjector;
//# sourceMappingURL=itemsBoard.js.map