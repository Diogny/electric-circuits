"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ItemSolid = exports.RotationInjector = void 0;
var tslib_1 = require("tslib");
var itemsBoard_1 = require("./itemsBoard");
var rect_1 = require("./rect");
var size_1 = require("./size");
var point_1 = require("./point");
var RotationInjector = /** @class */ (function (_super) {
    tslib_1.__extends(RotationInjector, _super);
    function RotationInjector(ec, name) {
        return _super.call(this, ec, name, true) || this;
    }
    Object.defineProperty(RotationInjector.prototype, "type", {
        get: function () { return "rotation"; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(RotationInjector.prototype, "value", {
        get: function () { return this.ec[this.name] + "\u00B0"; },
        enumerable: false,
        configurable: true
    });
    RotationInjector.prototype.setValue = function (val) {
        return false;
    };
    return RotationInjector;
}(itemsBoard_1.PropertyInjector));
exports.RotationInjector = RotationInjector;
//ItemBoard->ItemSolid->EC
var ItemSolid = /** @class */ (function (_super) {
    tslib_1.__extends(ItemSolid, _super);
    function ItemSolid(circuit, options) {
        var _this = _super.call(this, circuit, options) || this;
        //I've to set new properties always, because super just copy defaults()
        //later override method propertyDefaults()
        _this.settings.rotation = point_1.default.validateRotation(options.rotation);
        return _this;
    }
    ItemSolid.prototype.windowProperties = function () { return _super.prototype.windowProperties.call(this).concat(["rotation"]); };
    ItemSolid.prototype.prop = function (propName) {
        //inject available properties if called
        switch (propName) {
            case "rotation":
                return new RotationInjector(this, propName);
        }
        return _super.prototype.prop.call(this, propName);
    };
    Object.defineProperty(ItemSolid.prototype, "rotation", {
        get: function () { return this.settings.rotation; },
        enumerable: false,
        configurable: true
    });
    ItemSolid.prototype.rotate = function (value) {
        if (this.settings.rotation != (value = point_1.default.validateRotation(value))) {
            //set new value
            this.settings.rotation = value;
            //trigger property changed if applicable
            this.onProp && this.onProp({
                id: "#" + this.id,
                value: this.rotation,
                prop: "rotate",
                where: 1 //signals it was a change inside the object
            });
        }
        return this;
    };
    ItemSolid.prototype.rect = function () {
        var size = size_1.default.create(this.box), p = this.p;
        if (this.rotation) {
            //rotate (0,0) (width,0) (width,height) (0,height) and get the boundaries respectivelly to the location (x,y)
            var origin_1 = this.origin, angle_1 = -this.rotation, points = [[0, 0], [size.width, 0], [0, size.height], [size.width, size.height]]
                .map(function (p) { return new point_1.default(p[0], p[1]).rotateBy(origin_1.x, origin_1.y, angle_1); }), x = Math.min.apply(Math, points.map(function (a) { return a.x; })), y = Math.min.apply(Math, points.map(function (a) { return a.y; })), w = Math.max.apply(Math, points.map(function (a) { return a.x; })), h = Math.max.apply(Math, points.map(function (a) { return a.y; }));
            return new rect_1.default(Math.round(p.x + x), Math.round(p.y + y), Math.round(w - x), Math.round(h - y));
        }
        return new rect_1.default(p.x, p.y, size.width, size.height);
    };
    return ItemSolid;
}(itemsBoard_1.ItemBoard));
exports.ItemSolid = ItemSolid;
//# sourceMappingURL=itemSolid.js.map