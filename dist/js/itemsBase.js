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
var dab_1 = require("./dab");
var utils_1 = require("./utils");
var item_1 = require("./item");
var rect_1 = require("./rect");
var point_1 = require("./point");
var ItemBase = /** @class */ (function (_super) {
    __extends(ItemBase, _super);
    function ItemBase(options) {
        var _this = _super.call(this, options) || this;
        var classArr = dab_1.isStr(_this.class) ? _this.class.split(' ') : [];
        //prepare class names
        !_this.settings.visible && (classArr.push("hide"));
        //create main container
        _this.settings.g = utils_1.tag("g", _this.settings.id, {
            class: (_this.settings.class = classArr.join(' '))
        });
        return _this;
    }
    Object.defineProperty(ItemBase.prototype, "g", {
        get: function () { return this.settings.g; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ItemBase.prototype, "ClientRect", {
        get: function () {
            var b = this.g.getBoundingClientRect(); //gives the DOM screen info
            return dab_1.obj({
                width: b.width | 0,
                height: b.height | 0
            });
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ItemBase.prototype, "box", {
        get: function () { return this.g.getBBox(); },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ItemBase.prototype, "origin", {
        get: function () {
            var b = this.box;
            return new point_1.default((b.x + b.width / 2) | 0, (b.y + b.height / 2) | 0);
        },
        enumerable: false,
        configurable: true
    });
    ItemBase.prototype.rect = function () {
        return new rect_1.default(this.p.x, this.p.y, this.box.width, this.box.height);
    };
    ItemBase.prototype.setVisible = function (value) {
        _super.prototype.setVisible.call(this, value);
        this.visible ? dab_1.removeClass(this.g, "hide") : dab_1.addClass(this.g, "hide");
        return this;
    };
    ItemBase.prototype.remove = function () {
        var _a;
        (_a = this.g.parentNode) === null || _a === void 0 ? void 0 : _a.removeChild(this.g);
    };
    ItemBase.prototype.afterDOMinserted = function () { };
    return ItemBase;
}(item_1.default));
exports.default = ItemBase;
//# sourceMappingURL=itemsBase.js.map