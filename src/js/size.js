"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var dab_1 = require("./dab");
var Size = /** @class */ (function () {
    function Size(width, height) {
        this.width = parseFloat(width); //ensure it's a number
        this.height = parseFloat(height);
    }
    Size.prototype.clone = function () { return new Size(this.width, this.height); };
    Size.prototype.round = function () {
        this.width = Math.round(this.width);
        this.height = Math.round(this.height);
        return this;
    };
    Size.create = function (size) {
        return new Size(size.width, size.height);
    };
    Size.prototype.toString = function (options) {
        var noVars = ((options = options | 0) & 4) != 0, noPars = (options & 2) != 0;
        return "" + (noPars ? "" : "(") + (noVars ? "" : "w: ") + dab_1.round(this.width, 1) + ", " + (noVars ? "" : "h: ") + dab_1.round(this.height, 1) + (noPars ? "" : ")");
    };
    Size.empty = new Size(0, 0);
    return Size;
}());
exports.default = Size;
//# sourceMappingURL=size.js.map