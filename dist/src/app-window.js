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
var base_window_1 = require("./base-window");
var utils_1 = require("./utils");
var point_1 = require("./point");
var ecprop_1 = require("./ecprop");
var AppWindow = /** @class */ (function (_super) {
    __extends(AppWindow, _super);
    function AppWindow(options) {
        var _this = _super.call(this, options) || this;
        var header = _this.win.querySelector("header"), footer = _this.win.querySelector("footer");
        //
        _this.titleHTML = header.children[0];
        _this.titleButtons = header.children[1];
        _this.settings.main = _this.win.querySelector("main");
        //
        _this.barTitle = footer.children[0];
        _this.barButtons = footer.children[1];
        //set title, content, and bottom bar
        _this.setTitle(_this.settings.title);
        _this.setText(_this.settings.content);
        _this.setBar(_this.settings.bar);
        //register this to this.win
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
    Object.defineProperty(AppWindow.prototype, "title", {
        get: function () { return this.settings.title; },
        enumerable: false,
        configurable: true
    });
    AppWindow.prototype.setTitle = function (value) {
        return this.titleHTML.innerText = (this.settings.title = value), this;
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
        this.app.topBarLeft.innerHTML = "&nbsp;";
        this.settings.offset && (this.settings.offset = new point_1.default(e.offsetX, e.offsetY));
        //console.log('IN app window', e.eventPhase, (e.target as HTMLElement).id);
    };
    AppWindow.prototype.onMouseLeave = function (e) {
        this.renderBar("");
        //console.log('OUT of app window', e.eventPhase, (e.target as HTMLElement).id);
    };
    AppWindow.prototype.setVisible = function (value) {
        _super.prototype.setVisible.call(this, value); //.visible ? addClass(this.win, "selected") : removeClass(this.win, "selected");
        if (this.visible) {
            //correct (x,y) in case of mainwindow resize moves it outside
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
        this.compId = "";
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
        this.compId = comp.id;
        comp.properties().forEach(function (name) {
            _this.appendPropChild(new ecprop_1.default(comp, name, function onEcPropChange(value) {
                console.log(this, value);
            }, true));
        });
        this.setVisible(true);
        return true;
    };
    AppWindow.prototype.refresh = function () {
        if (!this.compId)
            return;
        //refresh editable properties
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
            class: "win props",
            templateName: "propWin01",
            title: "Window",
            content: "",
            bar: "",
            selected: false,
            properties: []
        });
    };
    return AppWindow;
}(base_window_1.default));
exports.default = AppWindow;
function checkPosition(win, x, y) {
    return {
        x: dab_1.clamp(x, 0, win.app.size.width - win.win.offsetWidth),
        y: dab_1.clamp(y, 0, win.app.contentHeight - win.win.offsetHeight)
    };
}
function dragWindow(win) {
    var ofsx = 0, ofsy = 0;
    win.titleHTML.onmousedown = dragMouseDown;
    function dragMouseDown(e) {
        e = e || window.event;
        e.preventDefault();
        ofsx = e.offsetX;
        ofsy = e.offsetY;
        document.onmouseup = closeDragElement;
        document.onmousemove = elementDrag;
        dab_1.addClass(win.titleHTML, "dragging");
    }
    function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();
        var _a = checkPosition(win, e.clientX - ofsx - win.app.board.offsetLeft, e.clientY - ofsy - win.app.board.offsetTop), x = _a.x, y = _a.y;
        win.move(x, y);
    }
    function closeDragElement() {
        document.onmouseup = null;
        document.onmousemove = null;
        dab_1.removeClass(win.titleHTML, "dragging");
    }
}
//# sourceMappingURL=app-window.js.map