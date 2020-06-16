"use strict";
//Point class is adapted from:
//https://github.com/Microsoft/TypeScriptSamples/blob/master/raytracer/raytracer.ts
Object.defineProperty(exports, "__esModule", { value: true });
var dab_1 = require("./dab");
var Point = /** @class */ (function () {
    function Point(x, y) {
        this.x = x;
        this.y = y;
    }
    Point.prototype.distance = function (p) {
        var dx = this.x - p.x;
        var dy = this.y - p.y;
        return Math.sqrt(dx * dx + dy * dy);
    };
    Point.prototype.clone = function () { return new Point(this.x, this.y); };
    Point.prototype.round = function () {
        this.x = Math.round(this.x);
        this.y = Math.round(this.y);
        return this;
    };
    Point.prototype.add = function (x, y) {
        this.x += Math.round(x);
        this.y += Math.round(y);
        return this;
    };
    Point.prototype.toString = function (options) {
        var noVars = ((options = options | 0) & 4) != 0, noPars = (options & 2) != 0;
        return "" + (noPars ? "" : "(") + (noVars ? "" : "x: ") + dab_1.round(this.x, 1) + ", " + (noVars ? "" : "y: ") + dab_1.round(this.y, 1) + (noPars ? "" : ")");
    };
    //get positive(): boolean { return this.x >= 0 && this.y >= 0 }
    /**
     * @description rotate (x,y) through center (x,y) by an angle
     * @param {number} cx center x
     * @param {number} cy center y
     * @param {number} angle angle to rotate
     */
    Point.prototype.rotateBy = function (cx, cy, angle) {
        var radians = (Math.PI / 180) * angle, cos = Math.cos(radians), sin = Math.sin(radians), nx = (cos * (this.x - cx)) + (sin * (this.y - cy)) + cx, ny = (cos * (this.y - cy)) - (sin * (this.x - cx)) + cy;
        return new Point(nx, ny); //round(nx, 3), round(ny, 3)
    };
    //static
    Point.validateRotation = function (val) {
        return (val = (val | 0) % 360, (val < 0) && (val += 360), val);
    };
    Object.defineProperty(Point, "origin", {
        get: function () { return new Point(0, 0); },
        enumerable: false,
        configurable: true
    });
    Point.create = function (p) {
        return new Point(p.x, p.y);
    };
    /**
     * @description parse an string into an (x,y) Point
     * @param value string in the for "x, y"
     */
    Point.parse = function (value) {
        var arr = value.split(",");
        if (arr.length == 2 && dab_1.isNumeric(arr[0]) && dab_1.isNumeric(arr[1])) {
            return new Point(parseInt(arr[0]), parseInt(arr[1]));
        }
        //invalid point
        return void 0;
    };
    Point.distance = function (p1, p2) {
        return p1.distance(p2);
    };
    Point.scale = function (v, k) { return new Point(k * v.x, k * v.y); };
    Point.translateBy = function (v, k) { return new Point(v.x + k, v.y + k); };
    //static translate(v: Point, k: number): IPoint { return new Point(v.x + k, v.y + k) }
    Point.times = function (v, scaleX, scaleY) { return new Point(v.x * scaleX, v.y * scaleY); };
    Point.minus = function (v1, v2) { return new Point(v1.x - v2.x, v1.y - v2.y); };
    Point.plus = function (v1, v2) { return new Point(v1.x + v2.x, v1.y + v2.y); };
    //
    Point.inside = function (p, s) { return p.x >= 0 && p.x <= s.width && p.y >= 0 && p.y <= s.height; };
    return Point;
}());
exports.default = Point;
//# sourceMappingURL=point.js.map