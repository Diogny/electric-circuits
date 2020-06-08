"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var itemsBase_1 = require("./itemsBase");
var types_1 = require("./types");
var dab_1 = require("./dab");
var utils_1 = require("./utils");
var HighlightNode = /** @class */ (function (_super) {
    __extends(HighlightNode, _super);
    function HighlightNode(options) {
        var _this = this;
        //override
        options.node = -1;
        options.id = "highlighNode";
        _this = _super.call(this, options) || this;
        _this.g.setAttribute("svg-comp", "h-node");
        //remove color class, not needed yet
        _this.g.classList.remove(_this.color);
        _this.circle = utils_1.tag("circle", "", {
            "svg-type": "node-x",
            r: _this.radius
        });
        _this.g.append(_this.circle);
        return _this;
    }
    Object.defineProperty(HighlightNode.prototype, "type", {
        get: function () { return types_1.Type.HIGHLIGHT; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(HighlightNode.prototype, "radius", {
        get: function () { return this.settings.radius; },
        enumerable: false,
        configurable: true
    });
    HighlightNode.prototype.setRadius = function (value) {
        this.circle.setAttribute("r", (this.settings.radius = value <= 0 ? 5 : value));
        return this;
    };
    HighlightNode.prototype.hide = function () {
        this.g.classList.add("hide");
        return this;
    };
    HighlightNode.prototype.show = function (x, y, node) {
        this.move(x, y);
        dab_1.attr(this.circle, {
            cx: this.x,
            cy: this.y,
            "node-x": node
        });
        this.g.classList.remove("hide");
        return this;
    };
    HighlightNode.prototype.propertyDefaults = function () {
        return dab_1.extend(_super.prototype.propertyDefaults.call(this), {
            name: "h-node",
            class: "h-node",
            visible: false,
            radius: 5
        });
    };
    return HighlightNode;
}(itemsBase_1.default));
exports.default = HighlightNode;
//# sourceMappingURL=highlightNode.js.map