"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
        //for Debugging purposes
        this.toString = function () {
            var fn = function (o) { return "#" + o.id + " [" + o.ndx + "]"; }, toStr = _this.to.map(function (b) { return fn(b); }).join(', ');
            return "from " + fn(_this.from) + " to " + toStr;
        };
        if (!from || !to)
            throw 'empty bond';
        this.from = this.create(from, pin);
        //by default a destination bond has at least one item
        this.to = [];
        //adds the first to bond
        this.add(to, node);
    }
    Object.defineProperty(Bond.prototype, "type", {
        get: function () { return types_1.Type.BOND; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Bond.prototype, "count", {
        //amount of connections to this pin/node
        get: function () { return this.to.length; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Bond.prototype, "link", {
        // [0>#id-0(Y), -1>#id-1(12)]
        get: function () { return this.from.ndx + ">#" + this.to[0].id + "(" + this.to[0].ndx + ")"; },
        enumerable: false,
        configurable: true
    });
    //returns true if this bond is connected to an specific EC
    Bond.prototype.has = function (id) { return this.to.some(function (b) { return id == b.id; }); };
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
        //remove from array
        (b != null) && this.to.splice(ndx, 1);
        //return the removed bond or null
        return b;
    };
    //for Debugging purposes
    Bond.display = function (arr) { return arr.map(function (o) { return o.toString(); }); };
    return Bond;
}());
exports.default = Bond;
/*
gets the start bond for the wire:
    Comp.item('wire-0').bond().filter((b)=> b.from.ndx == 0)
gets the end bond for the wire:
    Comp.item('wire-0').bond().filter((b)=> b.from.ndx == -1)	//scrapped
*/ 
//# sourceMappingURL=bonds.js.map