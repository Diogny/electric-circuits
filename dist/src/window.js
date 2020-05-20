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
var types_1 = require("./types");
var item_1 = require("./item");
var utils_1 = require("./utils");
var point_1 = require("./point");
var HtmlWindow = /** @class */ (function (_super) {
    __extends(HtmlWindow, _super);
    function HtmlWindow(options) {
        var _this = _super.call(this, options) || this;
        //create HTML main win template
        _this.settings.win = utils_1.html(dab_1.nano(_this.app.templates.propWin01, {
            id: options.id,
            class: 'win' //this.settings.class
        }));
        _this.settings.header = _this.win.querySelector("header");
        _this.headerTitle = _this.header.children[0];
        _this.headerButtons = _this.header.children[1];
        _this.settings.main = _this.win.querySelector("main");
        _this.settings.footer = _this.win.querySelector("footer");
        _this.footerBar = _this.footer.children[0];
        _this.footerButtons = _this.footer.children[1];
        //
        _this.visible = !(_this.settings.visible = !_this.settings.visible);
        //set title, content, and bottom bar
        _this.setTitle(_this.settings.title);
        _this.setText(_this.settings.content);
        _this.setBar(_this.settings.bar);
        //move to location
        _this.move(_this.x, _this.y);
        //size accordingly
        _this.size = options.size;
        //selectable
        _this.select(_this.selected);
        //register this to this.win
        _this.win.__win = _this;
        var that = _this;
        //header buttons
        dab_1.aEL(_this.headerButtons.querySelector('img:nth-of-type(1)'), "click", function (e) {
            e.stopPropagation();
            dab_1.toggleClass(that.win, "collapsed");
        }, false);
        dab_1.aEL(_this.headerButtons.querySelector('img:nth-of-type(2)'), "click", function (e) {
            e.stopPropagation();
            that.visible = false;
        }, false);
        //footer buttons
        dab_1.aEL(_this.footerButtons.querySelector('img:nth-of-type(1)'), "click", function (e) {
            e.stopPropagation();
            that.setText("");
        }, false);
        //register handlers
        dab_1.aEL(_this.headerTitle, "mousedown", function (e) {
            e.stopPropagation();
            //
            that.settings.dragging = false;
            that.settings.offset = new point_1.default(e.offsetX, e.offsetY); // Point.minus(win.p, offset);
            //console.log(`mousedown, eventPhase: ${e.eventPhase} tag: ${(<Element>e.target).tagName}`);
            //console.log('offset', offset, 'win.p', win.p, 'dragging', win.settings.dragging, e);
        }, false);
        //
        dab_1.aEL(_this.headerTitle, "mousemove", function (e) {
            //console.log(`mousemove, eventPhase: ${e.eventPhase} tag: ${(<Element>e.target).tagName}`);
            e.stopPropagation();
            if (!that.settings.dragging) {
                if (that.settings.offset) {
                    //this's the start of dragging
                    that.settings.dragging = true;
                    dab_1.addClass(that.header, "dragging");
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
            dab_1.removeClass(that.header, "dragging");
            //that.bar = `...`;
        };
        dab_1.aEL(_this.headerTitle, "mouseup", function (e) {
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
        dab_1.aEL(_this.headerTitle, "mouseout", function (e) {
            if (that.settings.dragging)
                return;
            stopDragging(e);
            //console.log(`mouseout, eventPhase: ${e.eventPhase} tag: ${(<Element>e.target).tagName}`);
            that.renderBar("");
        }, false);
        dab_1.aEL(_this.win, "mouseover", function (e) {
            that.app.topBarLeft.innerHTML = "&nbsp;";
            that.settings.offset && (that.settings.offset = new point_1.default(e.offsetX, e.offsetY));
        }, false);
        return _this;
    }
    Object.defineProperty(HtmlWindow.prototype, "type", {
        get: function () { return types_1.Type.WIN; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(HtmlWindow.prototype, "app", {
        get: function () { return this.settings.app; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(HtmlWindow.prototype, "win", {
        get: function () { return this.settings.win; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(HtmlWindow.prototype, "header", {
        get: function () { return this.settings.header; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(HtmlWindow.prototype, "title", {
        get: function () { return this.settings.title; },
        enumerable: false,
        configurable: true
    });
    HtmlWindow.prototype.setTitle = function (value) {
        return this.headerTitle.innerText = (this.settings.title = value), this;
    };
    Object.defineProperty(HtmlWindow.prototype, "main", {
        get: function () { return this.settings.main; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(HtmlWindow.prototype, "text", {
        get: function () { return this.settings.content; },
        enumerable: false,
        configurable: true
    });
    HtmlWindow.prototype.setText = function (value) {
        return (this.main.innerText = (this.settings.content = value), this);
    };
    HtmlWindow.prototype.setTextHtml = function (value) {
        return (this.main.innerHTML = value, this);
    };
    Object.defineProperty(HtmlWindow.prototype, "footer", {
        get: function () { return this.settings.footer; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(HtmlWindow.prototype, "bar", {
        get: function () { return this.settings.bar; },
        enumerable: false,
        configurable: true
    });
    HtmlWindow.prototype.setBar = function (value) {
        return this.footerBar.innerText = (this.settings.bar = value), this;
    };
    Object.defineProperty(HtmlWindow.prototype, "ClientRect", {
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
    Object.defineProperty(HtmlWindow.prototype, "box", {
        get: function () {
            return this.win.getBBox();
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(HtmlWindow.prototype, "visible", {
        get: function () {
            return this.settings.visible;
        },
        set: function (value) {
            (this.settings.visible = !!value) ? dab_1.removeClass(this.win, "hide") : dab_1.addClass(this.win, "hide");
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(HtmlWindow.prototype, "selected", {
        get: function () {
            return this.settings.selected;
        },
        enumerable: false,
        configurable: true
    });
    HtmlWindow.prototype.select = function (value) {
        if ((this.settings.selected = !!value)) {
            dab_1.addClass(this.win, "selected");
        }
        else {
            dab_1.removeClass(this.win, "selected");
        }
        return this;
    };
    Object.defineProperty(HtmlWindow.prototype, "size", {
        get: function () { return this.settings.size; },
        set: function (value) {
            if (!dab_1.pojo(value)) {
                return; //value = this.propertyDefaults().size;
            }
            this.settings.size = {
                width: Math.max(HtmlWindow.minWidth, value.width | 0),
                height: Math.max(HtmlWindow.minHeight, value.height | 0)
            };
            dab_1.css(this.win, {
                width: this.size.width + "px",
                height: this.size.height + "px"
            });
        },
        enumerable: false,
        configurable: true
    });
    HtmlWindow.prototype.renderBar = function (text) {
        //this's temporary
        this.setBar("(" + this.x + ", " + this.y + ") " + text);
    };
    HtmlWindow.prototype.move = function (x, y) {
        _super.prototype.move.call(this, x, y);
        dab_1.css(this.win, {
            top: this.y + "px",
            left: this.x + "px"
        });
        return this;
    };
    HtmlWindow.prototype.clear = function () {
        this.setTextHtml("");
        return this;
    };
    /**
     * @description appends to main content window an html markup text
     * @param htmlContent html markup text
     */
    HtmlWindow.prototype.appendStringChild = function (htmlContent) {
        this.main.appendChild(utils_1.html(htmlContent));
        return this;
    };
    /**
     * @description appends a Html element to the main content. Useful to control from outside display iniside window
     * @param el Html element to be inserted in DOM
     */
    HtmlWindow.prototype.appendHtmlChild = function (el) {
        el && this.main.appendChild(el);
        return this;
    };
    HtmlWindow.prototype.appendPropChild = function (el, wrap) {
        if (el) {
            var root = this.main;
            wrap && (root = root.appendChild(document.createElement("div")), root.classList.add("ec-wrap"));
            root.appendChild(el.html);
        }
        return this;
    };
    HtmlWindow.prototype.dispose = function () {
        //release hook handlers
    };
    //public propertyDefaults = (): IItemBaseProperties => {
    HtmlWindow.prototype.propertyDefaults = function () {
        return dab_1.extend(_super.prototype.propertyDefaults.call(this), {
            app: void 0,
            title: "Window",
            content: "",
            bar: "",
            //dragging: false,
            selected: false,
            size: {
                width: 120,
                height: 150
            }
        });
    };
    HtmlWindow.minWidth = 200;
    HtmlWindow.minHeight = 100;
    return HtmlWindow;
}(item_1.default));
exports.default = HtmlWindow;
//# sourceMappingURL=window.js.map