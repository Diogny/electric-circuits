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
        options.selectedNode = -1;
        options.selectedId = "";
        options.id = "highlighNode";
        _this = _super.call(this, options) || this;
        _this.g.setAttribute("svg-comp", "h-node");
        _this.mainNode = utils_1.tag("circle", "", {
            "svg-type": "node",
            r: _this.radius
        });
        _this.g.append(_this.mainNode);
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
    Object.defineProperty(HighlightNode.prototype, "selectedId", {
        get: function () { return this.settings.selectedId; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(HighlightNode.prototype, "selectedNode", {
        get: function () { return this.settings.selectedNode; },
        enumerable: false,
        configurable: true
    });
    HighlightNode.prototype.setRadius = function (value) {
        this.mainNode.setAttribute("r", (this.settings.radius = value <= 0 ? 5 : value));
        return this;
    };
    HighlightNode.prototype.hide = function () {
        this.g.classList.add("hide");
        this.mainNode.classList.remove("hide");
        this.g.innerHTML = "";
        this.g.append(this.mainNode);
        return this;
    };
    HighlightNode.prototype.show = function (x, y, id, node) {
        this.move(x, y);
        dab_1.attr(this.mainNode, {
            cx: this.x,
            cy: this.y,
            //"node-x": <any>node,
            "node": (this.settings.selectedNode = node)
        });
        this.settings.selectedId = id;
        this.g.classList.remove("hide");
        return this;
    };
    HighlightNode.prototype.showConnections = function (nodes) {
        var _this = this;
        this.mainNode.classList.add("hide");
        this.g.classList.remove("hide");
        nodes.forEach(function (p) {
            var circle = utils_1.tag("circle", "", {
                cx: p.x,
                cy: p.y,
                r: _this.radius,
                class: "node",
            });
            _this.g.append(circle);
        });
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