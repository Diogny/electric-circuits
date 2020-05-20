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
var itemsBoard_1 = require("./itemsBoard");
var dab_1 = require("./dab");
var rect_1 = require("./rect");
var size_1 = require("./size");
var point_1 = require("./point");
//ItemBoard->ItemSolid->EC
var ItemSolid = /** @class */ (function (_super) {
    __extends(ItemSolid, _super);
    function ItemSolid(options) {
        var _this = _super.call(this, options) || this;
        //I've to set new properties always, because super just copy defaults()
        _this.settings.rotation = _this.validateRotation(options.rotation);
        return _this;
    }
    Object.defineProperty(ItemSolid.prototype, "rotation", {
        get: function () { return this.settings.rotation; },
        enumerable: false,
        configurable: true
    });
    //this one returns NULL if select property could not be done
    //  otherwise returns "this" for object chaining
    ItemSolid.prototype.rotate = function (value) {
        if (this.settings.rotation != (value = this.validateRotation(value))) {
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
        return this; //for object chaining
    };
    ItemSolid.prototype.validateRotation = function (val) {
        return (val = (val | 0) % 360, (val < 0) && (val += 360), val);
    };
    /**
     * @description rotate (x,y) through center (x,y) by an angle
     * @param {number} cx center x
     * @param {number} cy center y
     * @param {number} x coordinate x to rotate
     * @param {number} y coordinate y to rotate
     * @param {number} angle angle to rotate
     */
    ItemSolid.prototype.rotateBy = function (cx, cy, x, y, angle) {
        var radians = (Math.PI / 180) * angle, cos = Math.cos(radians), sin = Math.sin(radians), nx = (cos * (x - cx)) + (sin * (y - cy)) + cx, ny = (cos * (y - cy)) - (sin * (x - cx)) + cy;
        return { x: dab_1.round(nx, 3), y: dab_1.round(ny, 3) };
    };
    ItemSolid.prototype.rect = function () {
        var _this = this;
        var size = size_1.default.create(this.box), p = this.p;
        if (this.rotation) {
            //rotate (0,0) (width,0) (width,height) (0,height) and get the boundaries respectivelly to the location (x,y)
            var origin_1 = this.origin, angle_1 = -this.rotation, points = [[0, 0], [size.width, 0], [0, size.height], [size.width, size.height]]
                .map(function (p) { return _this.rotateBy(origin_1.x, origin_1.y, p[0], p[1], angle_1); }), x = Math.min.apply(Math, points.map(function (a) { return a.x; })), y = Math.min.apply(Math, points.map(function (a) { return a.y; })), w = Math.max.apply(Math, points.map(function (a) { return a.x; })), h = Math.max.apply(Math, points.map(function (a) { return a.y; }));
            return new rect_1.default(new point_1.default(Math.round(p.x + x), Math.round(p.y + y)), new size_1.default(Math.round(w - x), Math.round(h - y)));
        }
        return new rect_1.default(p, size);
    };
    return ItemSolid;
}(itemsBoard_1.default));
exports.default = ItemSolid;
//# sourceMappingURL=itemSolid.js.map