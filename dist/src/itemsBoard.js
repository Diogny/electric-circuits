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
var dab_1 = require("./dab");
var bonds_1 = require("./bonds");
var itemsBase_1 = require("./itemsBase");
var components_1 = require("./components");
var boardCircle_1 = require("./boardCircle");
var utils_1 = require("./utils");
//ItemBoard->Wire
var ItemBoard = /** @class */ (function (_super) {
    __extends(ItemBoard, _super);
    function ItemBoard(options) {
        var _this = _super.call(this, options) || this;
        //I can use a MAC address for a board item in components.ts to access all base info of component
        var base = components_1.default.find(options.name, true);
        if (!base)
            throw "unknown component: " + options.name;
        //save base data
        _this.settings.base = base.obj;
        //this overrides the id
        _this.settings.id = _this.base.name + "-" + base.count++;
        //deep copy component properties
        _this.settings.props = dab_1.obj(base.obj.props);
        //create main component container
        dab_1.attr(_this.g, {
            id: _this.id,
            "svg-comp": _this.base.type,
        });
        //create the highligh object
        _this.highlight = new boardCircle_1.default(options.highlightNodeName);
        //add it to component, this's the insertion point (insertBefore) for all inherited objects
        dab_1.aCld(_this.g, _this.highlight.g);
        //initialize Bonds array
        _this.settings.bonds = [];
        return _this;
        //this still doesn't work to get all overridable properties
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
    ItemBoard.prototype.prop = function (propName) { return this.settings.props[propName]; };
    ItemBoard.prototype.properties = function () {
        return utils_1.map(this.settings.props, function (value, key) { return key; });
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
            onProp: void 0
        });
    };
    return ItemBoard;
}(itemsBase_1.default));
exports.default = ItemBoard;
//# sourceMappingURL=itemsBoard.js.map