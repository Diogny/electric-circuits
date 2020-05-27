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
var AppWindow = /** @class */ (function (_super) {
    __extends(AppWindow, _super);
    function AppWindow(options) {
        var _this = this;
        options.templateName = "propWin01";
        //extend with specific class
        options.class = (options.class || "") + " props";
        _this = _super.call(this, options) || this;
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
        //selectable
        _this.select(_this.selected);
        //register this to this.win
        _this.win.__win = _this;
        var that = _this;
        //header buttons
        dab_1.aEL(_this.titleButtons.querySelector('img:nth-of-type(1)'), "click", function (e) {
            e.stopPropagation();
            dab_1.toggleClass(that.win, "collapsed");
        }, false);
        dab_1.aEL(_this.titleButtons.querySelector('img:nth-of-type(2)'), "click", function (e) {
            e.stopPropagation();
            that.setVisible(false);
        }, false);
        //footer buttons
        dab_1.aEL(_this.barButtons.querySelector('img:nth-of-type(1)'), "click", function (e) {
            e.stopPropagation();
            that.setText("");
        }, false);
        //register handlers
        dab_1.aEL(_this.titleHTML, "mousedown", function (e) {
            e.stopPropagation();
            //
            that.settings.dragging = false;
            that.settings.offset = new point_1.default(e.offsetX, e.offsetY); // Point.minus(win.p, offset);
            //console.log(`mousedown, eventPhase: ${e.eventPhase} tag: ${(<Element>e.target).tagName}`);
            //console.log('offset', offset, 'win.p', win.p, 'dragging', win.settings.dragging, e);
        }, false);
        //
        dab_1.aEL(_this.titleHTML, "mousemove", function (e) {
            //console.log(`mousemove, eventPhase: ${e.eventPhase} tag: ${(<Element>e.target).tagName}`);
            e.stopPropagation();
            if (!that.settings.dragging) {
                if (that.settings.offset) {
                    //this's the start of dragging
                    that.settings.dragging = true;
                    dab_1.addClass(header, "dragging");
                    //console.log("dragging started");
                }
            }
            var client = new point_1.default(e.clientX, e.clientY), offset = new point_1.default(that.win.parentNode.offsetLeft, that.win.parentNode.offsetTop), dispP = point_1.default.minus(client, offset), maxX = that.win.parentNode.offsetWidth - that.win.offsetWidth, maxY = that.win.parentNode.offsetHeight - that.win.offsetHeight;
            if (that.settings.dragging) {
                var p = point_1.default.minus(dispP, that.settings.offset);
                //fix p
                p = new point_1.default(dab_1.clamp(p.x, 0, maxX), dab_1.clamp(p.y, 0, maxY));
                that.move(p.x, p.y);
                //console.log('offset', offset, 'win.p', win.p, 'p', p, e);
                //console.log("dragging");
            }
            else {
                //console.log("mousemove");
            }
            that.renderBar("(" + dispP.x + ", " + dispP.y + ")");
        }, false);
        var stopDragging = function (e) {
            //e.preventDefault();
            e.stopPropagation();
            //delete dragging flags
            that.settings.dragging = false;
            delete that.settings.offset;
            //remove dragging class
            dab_1.removeClass(header, "dragging");
            //that.bar = `...`;
        };
        dab_1.aEL(_this.titleHTML, "mouseup", function (e) {
            //console.log(`mouseup, eventPhase: ${e.eventPhase} tag: ${(<Element>e.target).tagName}`);
            if (!that.settings.dragging) {
                that.select(!that.selected); //click, toggle
                //console.log(`win: ${that.selected}`);
            }
            else {
                //console.log("stop dragging");
            }
            stopDragging(e);
        }, false);
        dab_1.aEL(_this.titleHTML, "mouseout", function (e) {
            if (that.settings.dragging)
                return;
            stopDragging(e);
            //console.log(`mouseout, eventPhase: ${e.eventPhase} tag: ${(<Element>e.target).tagName}`);
            that.renderBar("");
        }, false);
        return _this;
    }
    Object.defineProperty(AppWindow.prototype, "selected", {
        get: function () {
            return this.settings.selected;
        },
        enumerable: false,
        configurable: true
    });
    AppWindow.prototype.select = function (value) {
        if ((this.settings.selected = !!value)) {
            dab_1.addClass(this.win, "selected");
        }
        else {
            dab_1.removeClass(this.win, "selected");
        }
        return this;
    };
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
    AppWindow.prototype.onMouseOver = function (e) {
        this.app.topBarLeft.innerHTML = "&nbsp;";
        this.settings.offset && (this.settings.offset = new point_1.default(e.offsetX, e.offsetY));
    };
    AppWindow.prototype.renderBar = function (text) {
        //this's temporary
        this.setBar("(" + this.x + ", " + this.y + ") " + text);
    };
    AppWindow.prototype.clear = function () {
        //don't call base.clear because it clears all innerHTML
        this.setTextHtml("");
        this.settings.properties = [];
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
    AppWindow.prototype.appendPropChild = function (el, wrap) {
        if (el) {
            var root = this.main;
            wrap && (root = root.appendChild(document.createElement("div")), root.classList.add("ec-wrap"));
            root.appendChild(el.html);
            this.settings.properties.push(el);
        }
        return this;
    };
    AppWindow.prototype.property = function (name) {
        return this.settings.properties.find(function (p) { return p.name == name; });
    };
    //public propertyDefaults = (): IItemBaseProperties => {
    AppWindow.prototype.propertyDefaults = function () {
        return dab_1.extend(_super.prototype.propertyDefaults.call(this), {
            title: "Window",
            content: "",
            bar: "",
            //dragging: false,
            selected: false,
            properties: []
        });
    };
    return AppWindow;
}(base_window_1.default));
exports.default = AppWindow;
//# sourceMappingURL=app-window.js.map