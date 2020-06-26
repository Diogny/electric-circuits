"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var interfaces_1 = require("./interfaces");
var utils_1 = require("./utils");
var dab_1 = require("./dab");
var point_1 = require("./point");
var board_window_1 = require("./board-window");
var templates_1 = require("./templates");
var action_manager_1 = require("./action-manager");
var ContextWindow = /** @class */ (function (_super) {
    tslib_1.__extends(ContextWindow, _super);
    function ContextWindow(options) {
        var _this = _super.call(this, options) || this;
        _this.settings.list = new Map();
        utils_1.each(options.list, function (block, key) {
            block.forEach(function (b) {
                b.action = interfaces_1.ActionType[b.name];
                b.enabled &&
                    (b.enabled = b.enabled.map(function (stateName) { return interfaces_1.StateType[stateName]; }));
            });
            _this.settings.list.set(key, block);
        });
        _this.settings.current = "board";
        _this.settings.offset = point_1.default.origin;
        var that = _this;
        //register global click event
        dab_1.aEL(_this.win, "click", function (e) {
            var self = dab_1.getParentAttr(e.target, "data-action"), action = dab_1.attr(self, "data-action") | 0, data = dab_1.attr(self, "data-data"), disabled = self.hasAttribute("disabled"), trigger = dab_1.attr(self.parentElement, "data-trigger");
            self
                && !disabled
                && (that.setVisible(false),
                    data && (trigger += "::" + data),
                    action_manager_1.default.$.execute(action, trigger));
        }, false);
        return _this;
    }
    Object.defineProperty(ContextWindow.prototype, "offset", {
        //client x,y where mouse right-click
        get: function () { return this.settings.offset; },
        enumerable: false,
        configurable: true
    });
    ContextWindow.prototype.onMouseEnter = function (e) {
        //console.log('IN context window', e.eventPhase, (e.target as HTMLElement).id);
        //return false;
    };
    ContextWindow.prototype.onMouseLeave = function (e) {
        action_manager_1.default.$.transition(interfaces_1.StateType.BOARD, interfaces_1.ActionType.RESUME);
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
                //case "node-x":
                //name: "h-node", it can be a Wire-node or an EC-node
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
    ContextWindow.prototype.build = function (key, state, offset) {
        var entry = this.settings.list.get(key);
        if (entry) {
            this.settings.current = key;
            this.clear();
            this.win.innerHTML = entry.map(function (value) {
                var o = dab_1.clone(value);
                (value.enabled && !value.enabled.some(function (i) { return i == state; })) && (o.disabled = "disabled");
                return templates_1.Templates.nano('ctxItem01', o);
            }).join('');
            this.settings.offset = offset;
        }
        else
            this.settings.offset = point_1.default.origin;
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
}(board_window_1.default));
exports.default = ContextWindow;
//# sourceMappingURL=context-window.js.map