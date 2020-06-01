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
var interfaces_1 = require("./interfaces");
var utils_1 = require("./utils");
var dab_1 = require("./dab");
var ContextWindow = /** @class */ (function (_super) {
    __extends(ContextWindow, _super);
    function ContextWindow(options) {
        var _this = _super.call(this, options) || this;
        _this.settings.list = new Map();
        utils_1.each(options.list, function (block, key) {
            block.forEach(function (b) {
                b.action = interfaces_1.ActionType[b.name];
            });
            _this.settings.list.set(key, block);
        });
        _this.settings.current = "board";
        var that = _this;
        //register global click event
        dab_1.aEL(_this.win, "click", function (e) {
            var self = dab_1.getParentAttr(e.target, "data-action"), action = dab_1.attr(self, "data-action") | 0, data = dab_1.attr(self, "data-data"), trigger = dab_1.attr(self.parentElement, "data-trigger");
            self && (that.setVisible(false), data && (trigger += "::" + data), _this.app.execute(action, trigger));
        }, false);
        return _this;
    }
    ContextWindow.prototype.onMouseEnter = function (e) {
        //console.log('IN context window', e.eventPhase, (e.target as HTMLElement).id);
        //return false;
    };
    ContextWindow.prototype.onMouseLeave = function (e) {
        //console.log('OUT of context window', e.eventPhase, (e.target as HTMLElement).id);
        //return false;
    };
    ContextWindow.prototype.setVisible = function (value) {
        return (!_super.prototype.setVisible.call(this, value).visible && this.win.setAttribute("data-trigger", "")), this;
    };
    /**
     * @description store data trigger and returns the context key, must be called this.build after
     * @param comp component name
     * @param type component child type
     * @returns {string} context key
     */
    ContextWindow.prototype.setTrigger = function (id, name, type, nodeOrLine) {
        var ctx;
        switch (type) {
            case "node":
                ctx = ((name == "wire") ? "wire-" : "ec-") + type;
                break;
            case "board":
                ctx = type;
                break;
            case "body":
                ctx = "ec-" + type; //comp == 'gate', 'dip'
                break;
            case "line":
                ctx = "wire-" + type;
                break;
            default:
                //if id && comp has a value, then type is "body"
                if (id && name) {
                    ctx = "ec-" + (type = "body");
                }
                else
                    return void 0;
        }
        //let a = [id, name, type, nodeOrLine];//.filter(v => v != null);
        return this.win.setAttribute("data-trigger", "" + [id, name, type, nodeOrLine].join('::')), ctx;
    };
    ContextWindow.prototype.build = function (key) {
        var _this = this;
        var entry = this.settings.list.get(key);
        if (entry) {
            this.settings.current = key;
            this.clear();
            var html = entry.map(function (value) { return dab_1.nano(_this.app.templates.ctxItem01, value); }).join('');
            this.win.innerHTML = html;
        }
        return this;
    };
    ContextWindow.prototype.propertyDefaults = function () {
        return dab_1.extend(_super.prototype.propertyDefaults.call(this), {
            class: "win ctx",
            ignoreHeight: true,
            templateName: "ctxWin01"
        });
    };
    return ContextWindow;
}(base_window_1.default));
exports.default = ContextWindow;
//# sourceMappingURL=context-window.js.map