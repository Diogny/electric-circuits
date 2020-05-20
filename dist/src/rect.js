"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var point_1 = require("./point");
var Rect = /** @class */ (function () {
    function Rect(location, size) {
        this.location = location;
        this.size = size;
    }
    Object.defineProperty(Rect.prototype, "x", {
        get: function () { return this.location.x; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Rect.prototype, "y", {
        get: function () { return this.location.y; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Rect.prototype, "width", {
        get: function () { return this.size.width; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Rect.prototype, "height", {
        get: function () { return this.size.height; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Rect.prototype, "w", {
        get: function () { return this.location.x + this.size.width; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Rect.prototype, "h", {
        get: function () { return this.location.y + this.size.height; },
        enumerable: false,
        configurable: true
    });
    Rect.prototype.inside = function (p) { return point_1.default.inside(point_1.default.minus(p, this.location), this.size); };
    return Rect;
}());
exports.default = Rect;
//# sourceMappingURL=rect.js.map