"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BondsInjector = exports.IdInjector = exports.StringInjector = exports.PositionInjector = exports.PointInjector = exports.PropertyInjector = exports.ItemBoard = void 0;
var tslib_1 = require("tslib");
var dab_1 = require("./dab");
var bonds_1 = require("./bonds");
var itemsBase_1 = require("./itemsBase");
var components_1 = require("./components");
var utils_1 = require("./utils");
var point_1 = require("./point");
var types_1 = require("./types");
//ItemBoard->Wire
var ItemBoard = /** @class */ (function (_super) {
    tslib_1.__extends(ItemBoard, _super);
    function ItemBoard(circuit, options) {
        var _this = _super.call(this, options) || this;
        _this.circuit = circuit;
        var base = components_1.default.find(_this.name);
        if (!base || !circuit)
            throw "cannot create component";
        _this.settings.props = dab_1.obj(base.props);
        dab_1.attr(_this.g, {
            id: _this.id,
            "svg-comp": _this.base.type,
        });
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
    Object.defineProperty(ItemBoard.prototype, "label", {
        get: function () { return this.settings.label; },
        enumerable: false,
        configurable: true
    });
    ItemBoard.prototype.select = function (value) {
        if (this.selected != value) {
            //set new value
            this.settings.selected = value;
            //add class if selected
            dab_1.condClass(this.g, "selected", this.selected);
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
        return this;
    };
    ItemBoard.prototype.setOnProp = function (value) {
        dab_1.isFn(value) && (this.settings.onProp = value);
        return this;
    };
    ItemBoard.prototype.windowProperties = function () { return ["id", "p", "bonds"]; };
    ItemBoard.prototype.properties = function () {
        return this.windowProperties().concat(utils_1.map(this.settings.props, function (value, key) { return key; }));
    };
    ItemBoard.prototype.prop = function (propName) {
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
    ItemBoard.prototype.bond = function (thisNode, ic, icNode) {
        var entry = this.nodeBonds(thisNode);
        if (!ic
            || (entry && entry.has(ic.id))
            || !ic.valid(icNode))
            return false;
        if (!entry) {
            this.settings.bonds[thisNode] = entry = new bonds_1.Bond(this, ic, icNode, thisNode);
        }
        else if (!entry.add(ic, icNode)) {
            console.log('Oooopsie!');
        }
        this.settings.bondsCount++;
        this.nodeRefresh(thisNode);
        entry = ic.nodeBonds(icNode);
        return (entry && entry.has(this.id)) ? true : ic.bond(icNode, this, thisNode);
    };
    ItemBoard.prototype.nodeBonds = function (nodeName) {
        return this.bonds[nodeName];
    };
    ItemBoard.prototype.unbond = function (node, id) {
        var bond = this.nodeBonds(node), b = (bond == null) ? null : bond.remove(id);
        if (b != null) {
            if (bond.count == 0) {
                delete this.settings.bonds[node];
                (--this.settings.bondsCount == 0) && (this.settings.bonds = []);
            }
            this.nodeRefresh(node);
            var ic = this.circuit.get(id);
            ic && ic.unbond(b.ndx, this.id);
        }
    };
    ItemBoard.prototype.unbondNode = function (node) {
        var _a;
        var bond = this.nodeBonds(node), link = void 0;
        if (!bond)
            return;
        //try later to use bond.to.forEach, it was giving an error with wire node selection, think it's fixed
        for (var i = 0, len = bond.to.length; i < len; i++) {
            link = bond.to[i];
            (_a = this.circuit.get(link.id)) === null || _a === void 0 ? void 0 : _a.unbond(link.ndx, bond.from.id);
        }
        delete this.settings.bonds[node];
        (--this.settings.bondsCount == 0) && (this.settings.bonds = []);
    };
    ItemBoard.prototype.disconnect = function () {
        for (var node = 0; node < this.count; node++)
            this.unbondNode(node);
    };
    ItemBoard.prototype.propertyDefaults = function () {
        return dab_1.extend(_super.prototype.propertyDefaults.call(this), {
            selected: false,
            onProp: void 0,
            bonds: [],
            bondsCount: 0
        });
    };
    ItemBoard.connectedWiresTo = function (ecList) {
        var _a;
        var wireList = [], ecIdList = ecList.map(function (ec) { return ec.id; }), circuit = (_a = ecList[0]) === null || _a === void 0 ? void 0 : _a.circuit, secondTest = [], oppositeEdge = function (node, last) { return node == 0 ? last : (node == last ? 0 : node); };
        if (circuit) {
            ecList.forEach(function (ec) {
                ec.bonds.forEach(function (bond) {
                    bond.to
                        .filter(function (b) { return !wireList.find(function (w) { return w.id == b.id; }); })
                        .forEach(function (b) {
                        var wire = circuit.get(b.id), toWireBond = wire.nodeBonds(oppositeEdge(b.ndx, wire.last));
                        if (toWireBond.to[0].type == types_1.Type.EC) {
                            ecIdList.includes(toWireBond.to[0].id)
                                && wireList.push(wire);
                        }
                        else {
                            if (wireList.find(function (w) { return w.id == toWireBond.to[0].id; })) {
                                wireList.push(wire);
                            }
                            else {
                                secondTest.push({
                                    wire: wire,
                                    toId: toWireBond.to[0].id
                                });
                            }
                        }
                    });
                });
            });
            secondTest
                .forEach(function (b) { return wireList.find(function (w) { return w.id == b.toId; }) && wireList.push(b.wire); });
        }
        return wireList;
    };
    ItemBoard.wireConnections = function (wire) {
        var wireCollection = [wire], wiresFound = [], points = [], circuit = wire.circuit, findComponents = function (bond) {
            bond.to.forEach(function (b) {
                var w = circuit.get(b.id);
                if (!w)
                    throw "Invalid bond connections"; //shouldn't happen, but to catch wrong code
                switch (b.type) {
                    case types_1.Type.WIRE:
                        if (!wiresFound.some(function (id) { return id == b.id; })) {
                            wiresFound.push(w.id);
                            wireCollection.push(w);
                            points.push({
                                it: w,
                                p: point_1.default.create(w.getNode(b.ndx)),
                                n: b.ndx
                            });
                        }
                        break;
                    case types_1.Type.EC:
                        points.push({
                            it: w,
                            p: w.getNodeRealXY(b.ndx),
                            n: b.ndx
                        });
                        break;
                }
            });
        };
        while (wireCollection.length) {
            var w = wireCollection.shift();
            wiresFound.push(w.id);
            w.bonds.forEach(findComponents);
        }
        return points;
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
    tslib_1.__extends(PointInjector, _super);
    function PointInjector() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Object.defineProperty(PointInjector.prototype, "type", {
        get: function () { return "point"; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(PointInjector.prototype, "value", {
        get: function () { return this.ec[this.name].toString(0x06); } //no props and no parenthesis
        ,
        enumerable: false,
        configurable: true
    });
    return PointInjector;
}(PropertyInjector));
exports.PointInjector = PointInjector;
var PositionInjector = /** @class */ (function (_super) {
    tslib_1.__extends(PositionInjector, _super);
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
    tslib_1.__extends(StringInjector, _super);
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
    tslib_1.__extends(IdInjector, _super);
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
    tslib_1.__extends(BondsInjector, _super);
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