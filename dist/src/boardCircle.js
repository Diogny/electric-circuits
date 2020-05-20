"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var point_1 = require("./point");
var utils_1 = require("./utils");
var dab_1 = require("./dab");
var BoardCircle = /** @class */ (function () {
    function BoardCircle(nodeName) {
        //set initial default values
        this.settings = {
            nodeName: nodeName || "node",
            nodeValue: -1,
            visible: false,
            radius: 10,
            p: point_1.default.origin
        };
        //create SVG DOM Element
        var tagAttrs = this.getObjectSettings();
        //set svg-type and nodeName value for 'node'
        tagAttrs["svg-type"] = this.nodeName;
        tagAttrs[this.nodeName] = this.nodeValue; //node;
        //create SVG
        this.settings.g = utils_1.tag("circle", "", tagAttrs);
    }
    Object.defineProperty(BoardCircle.prototype, "visible", {
        get: function () { return this.settings.visible; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(BoardCircle.prototype, "p", {
        get: function () { return this.settings.p; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(BoardCircle.prototype, "nodeName", {
        get: function () { return this.settings.nodeName; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(BoardCircle.prototype, "nodeValue", {
        get: function () { return this.settings.nodeValue; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(BoardCircle.prototype, "radius", {
        get: function () { return this.settings.radius; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(BoardCircle.prototype, "g", {
        get: function () { return this.settings.g; } // this.g.cx.animVal.value
        ,
        enumerable: false,
        configurable: true
    });
    BoardCircle.prototype.getDomRadius = function () {
        return parseInt(dab_1.attr(this.g, "r"));
    };
    BoardCircle.prototype.move = function (x, y) {
        this.settings.p = new point_1.default(x, y);
        return this;
    };
    BoardCircle.prototype.setRadius = function (value) {
        this.settings.radius = value <= 0 ? 10 : value;
        return this.refresh(); //for object chaining
    };
    BoardCircle.prototype.hide = function () {
        this.settings.visible = false;
        this.settings.p = point_1.default.origin; //clean attributes
        this.settings.nodeValue = -1;
        return this.refresh(); //for object chaining
    };
    BoardCircle.prototype.show = function (nodeValue) {
        this.settings.visible = true;
        // this.p  moved first
        this.settings.nodeValue = nodeValue;
        return this.refresh(); //for object chaining
    };
    BoardCircle.prototype.getObjectSettings = function () {
        var o = {
            cx: this.p.x,
            cy: this.p.y,
            r: this.radius,
            class: this.visible ? "" : "hide"
        };
        o[this.nodeName] = this.nodeValue;
        return o;
    };
    BoardCircle.prototype.refresh = function () {
        return (dab_1.attr(this.g, this.getObjectSettings()), this);
    };
    return BoardCircle;
}());
exports.default = BoardCircle;
//# sourceMappingURL=boardCircle.js.map