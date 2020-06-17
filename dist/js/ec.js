"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var dab_1 = require("./dab");
var utils_1 = require("./utils");
var types_1 = require("./types");
var point_1 = require("./point");
var itemSolid_1 = require("./itemSolid");
var label_1 = require("./label");
var EC = /** @class */ (function (_super) {
    tslib_1.__extends(EC, _super);
    function EC(circuit, options) {
        var _this = _super.call(this, circuit, options) || this;
        _this.g.innerHTML = _this.base.data;
        var createText = function (attr, text) {
            var svgText = utils_1.tag("text", "", attr);
            return svgText.innerHTML = text, svgText;
        };
        //for labels in N555, 7408, Atmega168
        if (_this.base.meta.label) {
            dab_1.aCld(_this.g, createText({
                x: _this.base.meta.label.x,
                y: _this.base.meta.label.y,
                "class": _this.base.meta.label.class
            }, _this.base.meta.label.text));
        }
        //add node labels for DIP packages
        if (_this.base.meta.nodes.createLabels) {
            var pins = _this.count / 2;
            for (var y = 55, x = 7, i = 0, factor = 20; y > 0; y -= 44, x += (factor = -factor))
                for (var col = 0; col < pins; col++, i++, x += factor)
                    dab_1.aCld(_this.g, createText({ x: x, y: y }, i + ""));
        }
        //create label if defined
        if (_this.base.meta.labelId) {
            _this.labelSVG = new label_1.Label({
                fontSize: 15,
                x: _this.base.meta.labelId.x,
                y: _this.base.meta.labelId.y
            });
            _this.labelSVG.setText(_this.label);
        }
        _this.refresh();
        //signal component creation
        _this.onProp && _this.onProp({
            id: "#" + _this.id,
            args: {
                id: _this.id,
                name: _this.name,
                x: _this.x,
                y: _this.y,
                rotation: _this.rotation
            },
            method: 'create',
            where: 1 //signals it was a change inside the object
        });
        return _this;
    }
    Object.defineProperty(EC.prototype, "last", {
        get: function () { return this.base.meta.nodes.list.length - 1; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(EC.prototype, "type", {
        get: function () { return types_1.Type.EC; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(EC.prototype, "count", {
        get: function () {
            return this.base.meta.nodes.list.length;
        },
        enumerable: false,
        configurable: true
    });
    EC.prototype.rotate = function (value) {
        _super.prototype.rotate.call(this, value);
        return this.refresh();
    };
    EC.prototype.move = function (x, y) {
        _super.prototype.move.call(this, x, y);
        return this.refresh();
    };
    EC.prototype.refresh = function () {
        var _this = this;
        var attrs = {
            transform: "translate(" + this.x + " " + this.y + ")"
        }, center = this.origin;
        if (this.rotation) {
            attrs.transform += " rotate(" + this.rotation + " " + center.x + " " + center.y + ")";
        }
        dab_1.attr(this.g, attrs);
        utils_1.each(this.bonds, function (b, key) {
            _this.nodeRefresh(key);
        });
        if (this.labelSVG) {
            var pos = point_1.default.plus(this.p, this.labelSVG.p);
            attrs = {
                transform: "translate(" + pos.x + " " + pos.y + ")"
            };
            this.rotation && (center = point_1.default.minus(point_1.default.plus(this.p, center), pos),
                attrs.transform += " rotate(" + this.rotation + " " + center.x + " " + center.y + ")");
            dab_1.attr(this.labelSVG.g, attrs);
        }
        return this;
    };
    EC.prototype.nodeRefresh = function (node) {
        var _this = this;
        var bond = this.nodeBonds(node), pos = this.getNode(node);
        pos && bond && bond.to.forEach(function (d) {
            var ic = _this.circuit.get(d.id), p = point_1.default.plus(_this.p, _this.rotation ? pos.rot : pos).round();
            ic && ic.setNode(d.ndx, p); //no transform
        });
        return this;
    };
    //this returns (x, y) relative to the EC location
    EC.prototype.getNode = function (pinNode) {
        var pin = this.base.meta.nodes.list[pinNode], rotate = function (obj, rotation, center) {
            if (!rotation)
                return obj;
            var rot = obj.rotateBy(center.x, center.y, -rotation);
            return new point_1.default(rot.x, rot.y);
        };
        if (!pin)
            return null;
        pin.rot = rotate(new point_1.default(pin.x, pin.y), this.rotation, this.origin);
        //
        return dab_1.obj(pin);
    };
    EC.prototype.getNodeRealXY = function (node) {
        var pos = this.getNode(node);
        return pos ? point_1.default.plus(this.p, this.rotation ? pos.rot : pos).round() : null;
    };
    EC.prototype.overNode = function (p, ln) {
        for (var i = 0, len = this.count; i < len; i++) {
            var pin = this.getNode(i);
            if (this.rotation) {
                pin.x = Math.round(pin.rot.x);
                pin.y = Math.round(pin.rot.y);
            }
            //radius 5 =>  5^2 = 25
            if ((Math.pow((p.x - this.x) - pin.x, 2) + Math.pow((p.y - this.y) - pin.y, 2)) <= 81)
                return i;
        }
        return -1;
    };
    EC.prototype.findNode = function (p) {
        var dx = p.x - this.x, dy = p.y - this.y, rotation = -this.rotation, origin = this.origin;
        for (var i = 0, list = this.base.meta.nodes.list, meta = list[i], len = list.length; i < len; meta = list[++i]) {
            var nodePoint = this.rotation
                ? point_1.default.prototype.rotateBy.call(meta, origin.x, origin.y, rotation)
                : meta;
            //radius 5 =>  5^2 = 25
            if ((Math.pow(dx - nodePoint.x, 2) + Math.pow(dy - nodePoint.y, 2)) <= 81)
                return i;
        }
        return -1;
    };
    EC.prototype.setNode = function (node, p) {
        //Some code tries to call this, investigate later...
        throw 'somebody called me, not good!';
    };
    EC.prototype.valid = function (node) {
        return !!this.getNode(node);
    };
    EC.prototype.nodeHighlightable = function (name) {
        return this.valid(name); //for now all valid nodes are highlightables
    };
    EC.prototype.setVisible = function (value) {
        _super.prototype.setVisible.call(this, value);
        this.labelSVG && this.labelSVG.setVisible(value);
        return this;
    };
    EC.prototype.remove = function () {
        var _a;
        //delete label if any first
        this.labelSVG && ((_a = this.g.parentNode) === null || _a === void 0 ? void 0 : _a.removeChild(this.labelSVG.g));
        _super.prototype.remove.call(this);
    };
    EC.prototype.afterDOMinserted = function () {
        this.labelSVG && (this.g.insertAdjacentElement("afterend", this.labelSVG.g), this.labelSVG.setVisible(true));
    };
    EC.prototype.propertyDefaults = function () {
        return dab_1.extend(_super.prototype.propertyDefaults.call(this), {
            class: "ec",
        });
    };
    return EC;
}(itemSolid_1.ItemSolid));
exports.default = EC;
//# sourceMappingURL=ec.js.map