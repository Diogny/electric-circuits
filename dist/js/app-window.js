"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var dab_1 = require("./dab");
var interfaces_1 = require("./interfaces");
var utils_1 = require("./utils");
var point_1 = require("./point");
var ecprop_1 = require("./ecprop");
var board_window_1 = require("./board-window");
var action_manager_1 = require("./action-manager");
var AppWindow = /** @class */ (function (_super) {
    tslib_1.__extends(AppWindow, _super);
    function AppWindow(options) {
        var _this = _super.call(this, options) || this;
        var header = _this.win.querySelector("header"), footer = _this.win.querySelector("footer");
        _this.titleHTML = header.children[0];
        _this.titleButtons = header.children[1];
        _this.settings.main = _this.win.querySelector("main");
        _this.barTitle = footer.children[0];
        _this.barButtons = footer.children[1];
        _this.setTitle(_this.settings.title);
        _this.setText(_this.settings.content);
        _this.setBar(_this.settings.bar);
        _this.win.__win = _this;
        var that = _this;
        //header buttons
        dab_1.aEL(_this.titleButtons.querySelector('img:nth-of-type(1)'), "click", function (e) {
            e.stopPropagation();
            dab_1.toggleClass(that.win, "collapsed");
            that.setVisible(true);
        }, false);
        dab_1.aEL(_this.titleButtons.querySelector('img:nth-of-type(2)'), "click", function (e) {
            e.stopPropagation();
            that.setVisible(false);
        }, false);
        //footer buttons
        /*aEL(<HTMLElement>this.barButtons.querySelector('img:nth-of-type(1)'), "click", function (e: MouseEvent) {
            e.stopPropagation();
            that.setText("")
        }, false);*/
        //register handlers
        dragWindow(_this);
        return _this;
    }
    Object.defineProperty(AppWindow.prototype, "compId", {
        get: function () { return this.settings.compId; },
        enumerable: false,
        configurable: true
    });
    AppWindow.prototype.setTitle = function (value) {
        return this.titleHTML.innerText = _super.prototype.setTitle.call(this, value).title, this;
    };
    Object.defineProperty(AppWindow.prototype, "main", {
        //main/content
        get: function () { return this.settings.main; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(AppWindow.prototype, "text", {
        get: function () { return this.settings.content; },
        enumerable: false,
        configurable: true
    });
    AppWindow.prototype.setText = function (value) {
        return this.main.innerText = (this.settings.content = value), this;
    };
    AppWindow.prototype.setTextHtml = function (value) {
        return (this.main.innerHTML = value, this);
    };
    Object.defineProperty(AppWindow.prototype, "bar", {
        get: function () { return this.settings.bar; },
        enumerable: false,
        configurable: true
    });
    AppWindow.prototype.setBar = function (value) {
        return this.barTitle.innerText = (this.settings.bar = value), this;
    };
    AppWindow.prototype.onMouseEnter = function (e) {
        action_manager_1.default.$.transition(interfaces_1.StateType.WINDOW, interfaces_1.ActionType.START);
        this.settings.offset && (this.settings.offset = new point_1.default(e.offsetX, e.offsetY));
        //console.log('IN app window', e.eventPhase, (e.target as HTMLElement).id);
    };
    AppWindow.prototype.onMouseLeave = function (e) {
        action_manager_1.default.$.transition(interfaces_1.StateType.BOARD, interfaces_1.ActionType.RESUME);
        this.renderBar("");
        //console.log('OUT of app window', e.eventPhase, (e.target as HTMLElement).id);
    };
    AppWindow.prototype.setVisible = function (value) {
        if (_super.prototype.setVisible.call(this, value).visible) {
            var _a = checkPosition(this, this.x, this.y), x = _a.x, y = _a.y;
            this.move(x, y);
        }
        return this;
    };
    AppWindow.prototype.renderBar = function (text) {
        //this's temporary
        this.setBar("(" + this.x + ", " + this.y + ") " + text);
    };
    AppWindow.prototype.clear = function () {
        //don't call base.clear because it clears all innerHTML
        this.setTextHtml("");
        this.settings.compId = "";
        this.settings.properties = [];
        this.setVisible(false);
        return this;
    };
    /**
     * @description appends to main content window an html markup text
     * @param htmlContent html markup text
     */
    AppWindow.prototype.appendStringChild = function (htmlContent) {
        this.main.appendChild(utils_1.html(htmlContent));
        return this;
    };
    /**
     * @description appends a Html element to the main content. Useful to control from outside display iniside window
     * @param el Html element to be inserted in DOM
     */
    AppWindow.prototype.appendHtmlChild = function (el) {
        el && this.main.appendChild(el);
        return this;
    };
    AppWindow.prototype.load = function (comp) {
        var _this = this;
        if (!comp)
            return false;
        this.clear();
        this.settings.compId = comp.id;
        comp.properties().forEach(function (name) {
            _this.appendPropChild(new ecprop_1.default(comp, name, function onEcPropChange(value) {
                action_manager_1.default.$.app.circuit.modified = true;
                action_manager_1.default.$.app.updateCircuitLabel();
            }, true));
        });
        this.setVisible(true);
        return true;
    };
    AppWindow.prototype.refresh = function () {
        if (!this.compId)
            return;
        this.settings.properties.forEach(function (p) { return p.refresh(); });
    };
    AppWindow.prototype.appendPropChild = function (el) {
        return el && (this.main.appendChild(el.html), this.settings.properties.push(el)), this;
    };
    AppWindow.prototype.property = function (name) {
        return this.settings.properties.find(function (p) { return p.name == name; });
    };
    AppWindow.prototype.propertyDefaults = function () {
        return dab_1.extend(_super.prototype.propertyDefaults.call(this), {
            class: "win props no-select",
            templateName: "propWin01",
            title: "Window",
            content: "",
            bar: "",
            selected: false,
            properties: [],
            compId: "",
        });
    };
    return AppWindow;
}(board_window_1.default));
exports.default = AppWindow;
function checkPosition(win, x, y) {
    return {
        x: dab_1.clamp(x, 0, action_manager_1.default.$.app.size.width - win.win.offsetWidth),
        y: dab_1.clamp(y, 0, action_manager_1.default.$.app.contentHeight - win.win.offsetHeight)
    };
}
function dragWindow(win) {
    var ofsx = 0, ofsy = 0;
    win.titleHTML.addEventListener("mousedown", dragMouseDown, false);
    function dragMouseDown(e) {
        e = e || window.event;
        e.preventDefault();
        ofsx = e.offsetX;
        ofsy = e.offsetY;
        document.addEventListener("mouseup", closeDragElement, false);
        document.addEventListener("mousemove", elementDrag, false);
        dab_1.addClass(win.titleHTML, "dragging");
    }
    function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();
        var _a = checkPosition(win, e.clientX - ofsx - action_manager_1.default.$.app.boardOffsetLeft, e.clientY - ofsy - action_manager_1.default.$.app.boardOffsetTop), x = _a.x, y = _a.y;
        win.move(x, y);
    }
    function closeDragElement() {
        document.removeEventListener("mouseup", closeDragElement, false);
        document.removeEventListener("mousemove", elementDrag, false);
        dab_1.removeClass(win.titleHTML, "dragging");
    }
}
//# sourceMappingURL=app-window.js.map