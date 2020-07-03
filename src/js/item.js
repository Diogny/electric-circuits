"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var point_1 = require("./point");
var dab_1 = require("./dab");
var types_1 = require("./types");
var Item = /** @class */ (function (_super) {
    tslib_1.__extends(Item, _super);
    function Item(options) {
        var _this = _super.call(this) || this;
        //merge defaults and deep copy
        //all default properties must be refrenced from this or this.settings
        // options is for custom options only
        var optionsClass = options.class || "";
        delete options.class;
        _this.settings = dab_1.obj(dab_1.copy(_this.propertyDefaults(), options));
        _this.settings.class = dab_1.unique((_this.class + " " + optionsClass).split(' ')).join(' ');
        _this.settings.x = _this.settings.x || 0;
        _this.settings.y = _this.settings.y || 0;
        return _this;
    }
    Object.defineProperty(Item.prototype, "name", {
        get: function () { return this.settings.name; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Item.prototype, "id", {
        get: function () { return this.settings.id; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Item.prototype, "x", {
        get: function () { return this.settings.x; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Item.prototype, "y", {
        get: function () { return this.settings.y; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Item.prototype, "p", {
        get: function () { return new point_1.default(this.x, this.y); },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Item.prototype, "class", {
        get: function () { return this.settings.class; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Item.prototype, "visible", {
        get: function () { return this.settings.visible; },
        enumerable: false,
        configurable: true
    });
    Item.prototype.setVisible = function (value) {
        this.settings.visible = !!value;
        return this;
    };
    Item.prototype.move = function (x, y) {
        this.settings.x = x | 0;
        this.settings.y = y | 0;
        return this;
    };
    Item.prototype.movePoint = function (p) {
        return this.move(p.x, p.y);
    };
    Item.prototype.translate = function (dx, dy) {
        return this.move(this.x + (dx | 0), this.y + (dy | 0));
    };
    Item.prototype.propertyDefaults = function () {
        return {
            id: "",
            name: "",
            x: 0,
            y: 0,
            class: "",
            visible: true,
            base: void 0,
            label: ""
        };
    };
    return Item;
}(types_1.TypedClass));
exports.default = Item;
//# sourceMappingURL=item.js.map