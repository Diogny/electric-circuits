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
var item_1 = require("./item");
var types_1 = require("./types");
var dab_1 = require("./dab");
var utils_1 = require("./utils");
var BaseWindow = /** @class */ (function (_super) {
    __extends(BaseWindow, _super);
    function BaseWindow(options) {
        var _this = _super.call(this, options) || this;
        _this.settings.win = utils_1.html(dab_1.nano(_this.app.templates[_this.settings.templateName], {
            id: _this.id,
            class: _this.class
        }));
        _this.move(_this.x, _this.y);
        _this.setVisible(!!_this.settings.visible);
        return _this;
    }
    Object.defineProperty(BaseWindow.prototype, "type", {
        get: function () { return types_1.Type.WIN; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(BaseWindow.prototype, "app", {
        get: function () { return this.settings.app; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(BaseWindow.prototype, "win", {
        get: function () { return this.settings.win; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(BaseWindow.prototype, "title", {
        get: function () { return this.settings.title; },
        enumerable: false,
        configurable: true
    });
    BaseWindow.prototype.setTitle = function (value) {
        return this.settings.title = value, this;
    };
    Object.defineProperty(BaseWindow.prototype, "ClientRect", {
        get: function () {
            var b = this.win.getBoundingClientRect(); //gives the DOM screen info
            return dab_1.obj({
                width: b.width | 0,
                height: b.height | 0
            });
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(BaseWindow.prototype, "box", {
        get: function () {
            return this.win.getBBox();
        },
        enumerable: false,
        configurable: true
    });
    BaseWindow.prototype.clear = function () {
        return this.win.innerHTML = "", this;
    };
    BaseWindow.prototype.propertyDefaults = function () {
        return dab_1.extend(_super.prototype.propertyDefaults.call(this), {
            app: void 0,
            visible: false,
            ignoreHeight: false,
            title: "",
            templateName: "baseWin01"
        });
    };
    return BaseWindow;
}(item_1.default));
exports.default = BaseWindow;
//# sourceMappingURL=base-window.js.map