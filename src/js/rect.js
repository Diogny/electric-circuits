"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Rect = /** @class */ (function () {
    function Rect(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }
    Object.defineProperty(Rect.prototype, "empty", {
        get: function () { return this.width < 0 || this.height < 0; },
        enumerable: false,
        configurable: true
    });
    Rect.prototype.inside = function (p) {
        return p.x >= this.x && p.y >= this.y && p.x <= (this.x + this.width) && p.y <= (this.y + this.height);
        // Point.inside(Point.minus(p, this.location), this.size)
    };
    //later reverse this, so this is modified, not r
    Rect.prototype.intersect = function (r) {
        var nx = Math.max(this.x, r.x), ny = Math.max(this.y, r.y);
        r.width = Math.min((this.x + this.width), (r.x + r.width)) - nx;
        r.height = Math.min((this.y + this.height), (r.y + r.height)) - ny;
        r.x = nx;
        r.y = ny;
        return !r.empty;
    };
    Rect.prototype.clone = function () { return Rect.create(this); };
    Rect.prototype.contains = function (r) {
        return r.x >= this.x
            && r.y >= this.y
            && (r.x + r.width <= this.x + this.width)
            && (r.y + r.height <= this.y + this.height);
    };
    Rect.prototype.add = function (r) {
        var nx = Math.min(this.x, r.x), ny = Math.min(this.y, r.y);
        this.x = nx;
        this.y = ny;
        this.width = Math.max(this.x + this.width, r.x + r.width) - nx;
        this.height = Math.max(this.y + this.height, r.y + r.height) - ny;
    };
    Rect.prototype.move = function (x, y) {
        this.x = x | 0;
        this.y = y | 0;
    };
    Rect.prototype.grow = function (dx, dy) {
        this.x -= (dx = dx | 0);
        this.y -= (dy = dy | 0);
        this.width += dx * 2;
        this.height += dy * 2;
    };
    Rect.create = function (r) { return new Rect(r.x, r.y, r.width, r.height); };
    Rect.empty = function () { return new Rect(0, 0, 0, 0); };
    return Rect;
}());
exports.default = Rect;
//# sourceMappingURL=rect.js.map