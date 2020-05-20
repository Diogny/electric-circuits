"use strict";
//numbers.ts
Object.defineProperty(exports, "__esModule", { value: true });
var dab_1 = require("./dab");
//... in progress ...
//npm https://www.npmjs.com/package/@dabberio/electric-units
var Unit = /** @class */ (function () {
    function Unit(n) {
        var _this = this;
        this.toString = function () {
            return "" + _this.value + _this.prefix + _this.unit;
        };
        if (!dab_1.isStr(n) || !(n = n.trim()))
            throw "number " + n + " must be a not empty string";
        var ndx = n.length - 1, error = function () { return "invalid number: " + n; }, indexOf = function (s, x, u) { return s.indexOf(u ? x.toUpperCase() : x); };
        //defaults
        this.settings = {
            unit: -1,
            prefix: -1,
            value: NaN
        };
        //extract unit
        //start with full name first
        if ((this.settings.unit = Unit.unitNames.findIndex(function (u) { return n.toUpperCase().endsWith(u.toUpperCase()); })) >= 0) {
            ndx -= Unit.unitNames[this.settings.unit].length;
            //now try with unit symbols as is, and then uppercased
        }
        else if ((this.settings.unit = indexOf(Unit.unitSymbols, n[ndx], 0)) >= 0 ||
            (this.settings.unit = indexOf(Unit.unitSymbols, n[ndx], 1)) >= 0) {
            ndx--;
        }
        else
            throw error();
        //extract unit prefix
        if ((this.settings.prefix = Unit.prefixSymbols.indexOf(n[ndx])) == -1) {
            this.settings.prefix = 10; // position of symbol and name: '', exponent: 0
            ndx++;
        }
        //last char has to be a number
        if (isNaN(parseInt(n[ndx - 1])))
            throw error();
        //extract number
        this.settings.value = parseFloat(n.substr(0, ndx));
    }
    Object.defineProperty(Unit.prototype, "name", {
        //get unit name and symbol
        get: function () { return Unit.unitNames[this.settings.unit]; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Unit.prototype, "unit", {
        get: function () { return Unit.unitSymbols[this.settings.unit]; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Unit.prototype, "prefix", {
        get: function () { return Unit.prefixSymbols[this.settings.prefix]; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Unit.prototype, "exponent", {
        get: function () { return Math.pow(10, Unit.prefixExponents[this.settings.prefix]); },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Unit.prototype, "value", {
        get: function () { return this.settings.value; },
        enumerable: false,
        configurable: true
    });
    //self sufficient dummy
    Unit.split = function (text) { return text.split('|'); };
    //prefixNames = ['yocto', 'zepto', 'atto', 'femto', 'pico', 'nano', 'micro', 'mili', 'centi', 'deci', '',
    //	'deca', 'hecto', 'kilo', 'mega', 'giga', 'tera', 'peta', 'exa', 'zetta', 'yotta'],
    Unit.prefixSymbols = Unit.split('y|z|a|f|p|n|μ|m|c|d||da|h|k|M|G|T|P|E|Z|Y');
    //['y', 'z', 'a', 'f', 'p', 'n', 'μ', 'm', 'c', 'd', '',
    //'da', 'h', 'k', 'M', 'G', 'T', 'P', 'E', 'Z', 'Y'],
    Unit.prefixExponents = [-24, -21, -18, -15, -12, -9, -6, -3, -2, -1, 0, 1, 2, 3, 6, 9, 12, 15, 18, 21, 24];
    Unit.unitNames = Unit.split('Ampere|Volt|Ohm|Farad|Watt|Henry|Meter');
    //['Ampere', 'Volt', 'Ohm', 'Farad', 'Watt', 'Henry', 'Meter'],
    Unit.unitSymbols = Unit.split('A|V|Ω|F|W|H|m');
    return Unit;
}());
exports.default = Unit;
//# sourceMappingURL=units.js.map