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
var base_window_1 = require("./base-window");
var dab_1 = require("./dab");
var BoardWindow = /** @class */ (function (_super) {
    __extends(BoardWindow, _super);
    function BoardWindow(options) {
        var _this = _super.call(this, options) || this;
        _this.size = _this.settings.size;
        var that = _this;
        dab_1.aEL(_this.win, "mouseenter", function (e) { return that.onMouseEnter.call(that, e); }, false);
        dab_1.aEL(_this.win, "mouseleave", function (e) { return that.onMouseLeave.call(that, e); }, false);
        return _this;
    }
    Object.defineProperty(BoardWindow.prototype, "size", {
        get: function () { return this.settings.size; },
        set: function (value) {
            if (!dab_1.pojo(value)) {
                return;
            }
            this.settings.size = {
                width: Math.max(BoardWindow.minWidth, value.width | 0),
                height: Math.max(BoardWindow.minHeight, value.height | 0)
            };
            this.win.style.width = this.size.width + "px";
            !this.settings.ignoreHeight && (this.win.style.height = this.size.height + "px");
        },
        enumerable: false,
        configurable: true
    });
    BoardWindow.prototype.onMouseEnter = function (e) { };
    BoardWindow.prototype.onMouseLeave = function (e) { };
    BoardWindow.prototype.setVisible = function (value) {
        return _super.prototype.setVisible.call(this, value).visible ? dab_1.removeClass(this.win, "hide") : dab_1.addClass(this.win, "hide"), this;
    };
    BoardWindow.prototype.move = function (x, y) {
        _super.prototype.move.call(this, x, y);
        dab_1.css(this.win, {
            top: this.y + "px",
            left: this.x + "px"
        });
        return this;
    };
    BoardWindow.prototype.dispose = function () {
        //release hook handlers, ...
    };
    BoardWindow.prototype.propertyDefaults = function () {
        return dab_1.extend(_super.prototype.propertyDefaults.call(this), {
            size: {
                width: 120,
                height: 150
            },
        });
    };
    BoardWindow.minWidth = 200;
    BoardWindow.minHeight = 100;
    return BoardWindow;
}(base_window_1.default));
exports.default = BoardWindow;
//# sourceMappingURL=board-window.js.map