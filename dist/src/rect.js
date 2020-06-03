"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Rect = /** @class */ (function () {
    function Rect(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }
    Rect.prototype.inside = function (p) {
        return p.x >= this.x && p.y >= this.y && p.x <= (this.x + this.width) && p.y <= (this.y + this.height);
        // Point.inside(Point.minus(p, this.location), this.size)
    };
    Rect.create = function (r) { return new Rect(r.x, r.y, r.width, r.height); };
    Rect.empty = function () { return new Rect(0, 0, 0, 0); };
    return Rect;
}());
exports.default = Rect;
//# sourceMappingURL=rect.js.map