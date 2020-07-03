"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Bond = void 0;
var types_1 = require("./types");
var dab_1 = require("./dab");
var Bond = /** @class */ (function () {
    /**
     * @description implements a component bond, it must be created by default as a One-to-One bond
     * @param {object} _from from
     * @param {object} _to to
     * @param {number} node node
     * @param {any} pin pin
     */
    function Bond(from, to, node, pin) {
        var _this = this;
        this.toString = function () {
            var fn = function (o) { return "#" + o.id + " [" + o.ndx + "]"; }, toStr = _this.to.map(function (b) { return fn(b); }).join(', ');
            return "from " + fn(_this.from) + " to " + toStr;
        };
        if (!from || !to)
            throw 'empty bond';
        this.from = this.create(from, pin);
        this.to = [];
        this.add(to, node);
    }
    Object.defineProperty(Bond.prototype, "type", {
        get: function () { return types_1.Type.BOND; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Bond.prototype, "count", {
        get: function () { return this.to.length; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Bond.prototype, "link", {
        // 0>id-0(1)&id-1(12)
        get: function () { return this.from.ndx + ">" + this.to.map(function (b) { return b.id + "(" + b.ndx + ")"; }).join('&'); },
        enumerable: false,
        configurable: true
    });
    Bond.prototype.has = function (id) { return this.to.some(function (b) { return id == b.id; }); };
    Bond.prototype.get = function (id) {
        return this.to.find(function (b) { return id == b.id; });
    };
    Bond.prototype.add = function (t, ndx) {
        if (t && !this.has(t.id)) {
            var b = this.create(t, ndx);
            if (b.type == types_1.Type.EC || b.type == types_1.Type.WIRE) {
                this.to.push(b);
                return true;
            }
        }
        return false;
    };
    Bond.prototype.create = function (ec, ndx) {
        return dab_1.obj({
            id: ec.id,
            type: ec.type,
            ndx: ndx
        });
    };
    /**
     * @description removes a bond connection from this component item
     * @param {String} id id name of the destination bond
     * @returns {IBondItem} removed bond item or null if none
     */
    Bond.prototype.remove = function (id) {
        var ndx = this.to.findIndex(function (b) { return b.id == id; }), b = (ndx == -1) ? null : this.to[ndx];
        (b != null) && this.to.splice(ndx, 1);
        return b;
    };
    Bond.display = function (arr) { return arr.map(function (o) { return o.toString(); }); };
    return Bond;
}());
exports.Bond = Bond;
//# sourceMappingURL=bonds.js.map