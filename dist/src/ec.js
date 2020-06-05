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
var utils_1 = require("./utils");
var types_1 = require("./types");
var components_1 = require("./components");
var point_1 = require("./point");
var itemSolid_1 = require("./itemSolid");
var rect_1 = require("./rect");
var label_1 = require("./label");
var EC = /** @class */ (function (_super) {
    __extends(EC, _super);
    function EC(options) {
        var _this = _super.call(this, options) || this;
        //this ensures all path, rect, circles are inserted before the highlight circle node
        //_.svg is used because _.html doesn't work for SVG
        [].slice.call(utils_1.svg("<g>" + _this.base.data + "</g>").children).forEach(function (n) {
            _this.g.insertBefore(n, _this.highlight.g);
        });
        //create label if defined
        if (_this.base.meta.labelId) {
            _this.labelSVG = new label_1.Label({
                fontSize: 15,
                x: _this.base.meta.labelId.x,
                y: _this.base.meta.labelId.y
            });
            _this.labelSVG.setText(_this.label);
        }
        //this shows dragx, dragy, and rotate
        _this.refresh();
        //signal component creation
        _this.onProp && _this.onProp({
            id: "#" + _this.id,
            args: {
                id: _this.id,
                name: _this.name,
                x: _this.x,
                y: _this.y,
                color: _this.color,
                rotation: _this.rotation
            },
            method: 'create',
            where: 1 //signals it was a change inside the object
        });
        //
        components_1.default.save(_this);
        return _this;
    }
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
        //refresh properties and object chaining
        return this.refresh();
    };
    EC.prototype.move = function (x, y) {
        _super.prototype.move.call(this, x, y);
        //refresh properties and object chaining
        return this.refresh();
    };
    EC.prototype.refresh = function () {
        var _this = this;
        var attrs = {
            //dragx: this.x,
            //dragy: this.y,
            transform: "translate(" + this.x + " " + this.y + ")"
        }, center = this.origin;
        if (this.rotation) {
            attrs.transform += " rotate(" + this.rotation + " " + center.x + " " + center.y + ")";
        }
        //update SVG DOM attributes
        dab_1.attr(this.g, attrs);
        //refreshBonds
        utils_1.each(this.bonds, function (b, key) {
            _this.nodeRefresh(key);
        });
        //update label if any
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
            var ic = components_1.default.item(d.id), p = point_1.default.plus(_this.p, _this.rotation ? pos.rot : pos).round();
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
        var px = (p.x - this.x) - 5, py = (p.y - this.y) - 5, rect = new rect_1.default(px, py, 10, 10);
        for (var i = 0, len = this.count; i < len; i++) {
            var pin = this.getNode(i);
            if (this.rotation) {
                pin.x = Math.round(pin.rot.x);
                pin.y = Math.round(pin.rot.y);
            }
            if (rect.inside(new point_1.default(pin.x, pin.y))) {
                return i;
            }
        }
        return -1;
    };
    EC.prototype.setNode = function (node, p) {
        //State.WIRE_EDIT_NODE_DRAG tries to call this, investigate later...
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
            highlightNodeName: "node"
        });
    };
    return EC;
}(itemSolid_1.ItemSolid));
exports.default = EC;
//# sourceMappingURL=ec.js.map