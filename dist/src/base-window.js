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
        //create HTML main win template
        !options.templateName && (options.templateName = "baseWin01");
        _this.settings.win = utils_1.html(dab_1.nano(_this.app.templates[options.templateName], {
            id: options.id,
            class: "win" //default class
        }));
        dab_1.addClassX(_this.win, _this.settings.class);
        //move to location
        _this.move(_this.x, _this.y);
        //size accordingly
        _this.size = options.size;
        _this.setVisible(!!_this.settings.visible);
        var that = _this;
        //default
        dab_1.aEL(_this.win, "mouseover", function (e) { return that.onMouseOver.call(that, e); }, false);
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
    Object.defineProperty(BaseWindow.prototype, "visible", {
        get: function () {
            return this.settings.visible;
        },
        enumerable: false,
        configurable: true
    });
    BaseWindow.prototype.setVisible = function (value) {
        _super.prototype.setVisible.call(this, value).visible ? dab_1.removeClass(this.win, "hide") : dab_1.addClass(this.win, "hide");
        return this;
    };
    Object.defineProperty(BaseWindow.prototype, "size", {
        get: function () { return this.settings.size; },
        set: function (value) {
            if (!dab_1.pojo(value)) {
                return; //value = this.propertyDefaults().size;
            }
            this.settings.size = {
                width: Math.max(BaseWindow.minWidth, value.width | 0),
                height: Math.max(BaseWindow.minHeight, value.height | 0)
            };
            this.win.style.width = this.size.width + "px";
            !this.settings.ignoreHeight && (this.win.style.height = this.size.height + "px");
        },
        enumerable: false,
        configurable: true
    });
    BaseWindow.prototype.onMouseOver = function (e) {
    };
    BaseWindow.prototype.move = function (x, y) {
        _super.prototype.move.call(this, x, y);
        dab_1.css(this.win, {
            top: this.y + "px",
            left: this.x + "px"
        });
        return this;
    };
    BaseWindow.prototype.clear = function () {
        return this.win.innerHTML = "", this;
    };
    BaseWindow.prototype.dispose = function () {
        //release hook handlers
    };
    BaseWindow.prototype.propertyDefaults = function () {
        return dab_1.extend(_super.prototype.propertyDefaults.call(this), {
            app: void 0,
            size: {
                width: 120,
                height: 150
            },
            visible: false,
            ignoreHeight: false
        });
    };
    BaseWindow.minWidth = 200;
    BaseWindow.minHeight = 100;
    return BaseWindow;
}(item_1.default));
exports.default = BaseWindow;
//# sourceMappingURL=base-window.js.map