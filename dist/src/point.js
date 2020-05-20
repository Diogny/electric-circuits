"use strict";
//Point class is adapted from:
//https://github.com/Microsoft/TypeScriptSamples/blob/master/raytracer/raytracer.ts
Object.defineProperty(exports, "__esModule", { value: true });
var dab_1 = require("./dab");
var Point = /** @class */ (function () {
    function Point(x, y) {
        this.x = parseFloat(x); //ensure it's a number
        this.y = parseFloat(y);
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
    Point.prototype.toString = function (options) {
        var noVars = ((options = options | 0) & 4) != 0, noPars = (options & 2) != 0;
        return "" + (noPars ? "" : "(") + (noVars ? "" : "x: ") + dab_1.round(this.x, 1) + ", " + (noVars ? "" : "y: ") + dab_1.round(this.y, 1) + (noPars ? "" : ")");
    };
    Point.create = function (p) {
        return new Point(p.x, p.y);
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
    //get positive(): boolean { return this.x >= 0 && this.y >= 0 }
    Point.origin = new Point(0, 0);
    return Point;
}());
exports.default = Point;
//# sourceMappingURL=point.js.map