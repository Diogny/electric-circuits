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
var utils_1 = require("./utils");
var dab_1 = require("./dab");
var components_1 = require("./components");
var ContextWindow = /** @class */ (function (_super) {
    __extends(ContextWindow, _super);
    function ContextWindow(options) {
        var _this = this;
        options.templateName = "ctxWin01";
        //extend with specific class
        options.class = (options.class || "") + " ctx";
        //do not set size.height
        options.ignoreHeight = true;
        _this = _super.call(this, options) || this;
        //store right click context options
        _this.settings.list = new Map();
        utils_1.each(options.list, function (block, key) {
            _this.settings.list.set(key, block);
        });
        _this.settings.current = "board";
        var that = _this;
        //register global click event
        dab_1.aEL(_this.win, "click", function (e) {
            var self = dab_1.getParentAttr(e.target, "data-action"), action = dab_1.attr(self, "data-action") | 0, trigger = dab_1.attr(self.parentElement, "data-trigger");
            self && (that.setVisible(false), _this.execute(action, trigger));
        }, false);
        return _this;
    }
    ContextWindow.prototype.execute = function (action, trigger) {
        var arr = trigger.split('::'), comp = components_1.default.item(arr.shift()), name = arr.shift(), type = arr.shift(), app = this.app, compNull = false, selectAll = function (value) {
            var arr = Array.from(app.compList.values());
            arr.forEach(function (comp) { return comp.select(value); });
            return arr;
        };
        //this's a temporary fix to make it work
        //	final code will have a centralized action dispatcher
        switch (action) {
            case 7: //"Select" just ONE
                if (!(compNull = !comp)) {
                    selectAll(false);
                    app.selectedComponents = [comp.select(true)];
                    app.refreshRotation();
                    app.winProps.load(comp);
                    //temporary, for testings...
                    window.ec = app.ec;
                }
                break;
            case 8: //"Select All"
                app.selectedComponents = selectAll(true);
                app.refreshRotation();
                app.winProps.clear();
                break;
            case 9: //"Deselect All"
                selectAll(false);
                app.selectedComponents = [];
                app.refreshRotation();
                app.winProps.clear();
                break;
            case 10: //"Delete"
                //disconnects and remove component from DOM
                //app.ec && (app.ec.disconnect(), app.ec.remove());
                break;
            case 11: //"Properties"
                if (!(compNull = !comp)) {
                    app.winProps.load(comp);
                }
                break;
        }
        if (compNull) {
            console.log("invalid trigger: " + trigger);
        }
        else {
            console.log("action: " + action + ", id: " + (comp === null || comp === void 0 ? void 0 : comp.id) + ", name: " + name + ", type: " + type + ", trigger: " + trigger);
        }
    };
    ContextWindow.prototype.setVisible = function (value) {
        //clear data trigger info
        return (!_super.prototype.setVisible.call(this, value).visible && this.win.setAttribute("data-trigger", "")), this;
    };
    /**
     * @description store data trigger and returns the context key, must be called this.build after
     * @param comp component name
     * @param type component child type
     * @returns {string} context key
     */
    ContextWindow.prototype.setTrigger = function (id, name, type, data) {
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
        var a = [id, name, type, data].filter(function (v) { return v != null; });
        return this.win.setAttribute("data-trigger", "" + a.join('::')), ctx;
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
    return ContextWindow;
}(base_window_1.default));
exports.default = ContextWindow;
//# sourceMappingURL=context-window.js.map