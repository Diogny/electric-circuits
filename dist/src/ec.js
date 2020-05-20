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
//ec.ts
var dab_1 = require("./dab");
var utils_1 = require("./utils");
var types_1 = require("./types");
var components_1 = require("./components");
var point_1 = require("./point");
var itemSolid_1 = require("./itemSolid");
var rect_1 = require("./rect");
var size_1 = require("./size");
var EC = /** @class */ (function (_super) {
    __extends(EC, _super);
    function EC(options) {
        var _this = this;
        //set defaults
        options.class = "ec";
        options.highlightNodeName = "node";
        _this = _super.call(this, options) || this;
        //this ensures all path, rect, circles are inserted before the highlight circle node
        //_.svg is used because _.html dowsn't work for SVG
        [].slice.call(utils_1.svg("<g>" + _this.base.data + "</g>").children).forEach(function (n) {
            _this.g.insertBefore(n, _this.highlight.g);
        });
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
            return this.base.nodes.length;
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
            dragx: this.x,
            dragy: this.y,
            transform: "translate(" + this.x + " " + this.y + ")" // "translate(" + this.x + " " + this.y + ")"
        };
        if (this.rotation) {
            var center = this.origin;
            attrs.transform += " rotate(" + this.rotation + " " + center.x + " " + center.y + ")"; // " rotate(" + this.rotation + " " + center.x + " " + center.y + ")"
        }
        //update SVG DOM attributes
        dab_1.attr(this.g, attrs);
        //refreshBonds
        utils_1.each(this.bonds, function (b, key) {
            _this.nodeRefresh(key);
        });
        return this;
    };
    EC.prototype.nodeRefresh = function (node) {
        var _this = this;
        var bond = this.nodeBonds(node), pos = this.getNode(node);
        bond && bond.to.forEach(function (d) {
            var ic = components_1.default.item(d.id), p = point_1.default.plus(_this.p, _this.rotation ? pos.rot : pos).round();
            ic && ic.setNode(d.ndx, p); //no transform
        });
        return this;
    };
    //this returns (x, y) relative to the EC location
    EC.prototype.getNode = function (pinNode) {
        var _this = this;
        var pin = this.base.nodes.list[pinNode], rotate = function (obj, rotation, center) {
            if (!rotation)
                return obj;
            var rot = _this.rotateBy(center.x, center.y, obj.x, obj.y, -rotation);
            return new point_1.default(rot.x, rot.y);
        };
        if (!pin)
            return null;
        pin.rot = rotate(new point_1.default(pin.x, pin.y), this.rotation, this.origin);
        //
        return dab_1.obj(pin);
    };
    EC.prototype.overNode = function (p, ln) {
        var px = (p.x - this.x) - 5, py = (p.y - this.y) - 5, rect = new rect_1.default(new point_1.default(px, py), new size_1.default(10, 10));
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
        throw 'somebody called me, not good!';
    };
    EC.prototype.valid = function (node) {
        return !!this.getNode(node);
    };
    EC.prototype.nodeHighlightable = function (name) {
        return this.valid(name); //for now all valid nodes are highlightables
    };
    return EC;
}(itemSolid_1.default));
exports.default = EC;
//# sourceMappingURL=ec.js.map