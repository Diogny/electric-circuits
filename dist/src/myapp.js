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
exports.MyApp = void 0;
var app_1 = require("./app");
var interfaces_1 = require("./interfaces");
var utils_1 = require("./utils");
var rect_1 = require("./rect");
var size_1 = require("./size");
var point_1 = require("./point");
var tooltip_1 = require("./tooltip");
var dab_1 = require("./dab");
var app_window_1 = require("./app-window");
var stateMachine_1 = require("./stateMachine");
var components_1 = require("./components");
var context_window_1 = require("./context-window");
var MyApp = /** @class */ (function (_super) {
    __extends(MyApp, _super);
    function MyApp(options) {
        var _this = _super.call(this, options) || this;
        _this.tooltipFontSize = function () { return Math.max(10, 35 * _this.multiplier); };
        var that = _this, 
        //HTML
        getClientXY = function (evt) {
            return new point_1.default(evt.clientX - that.board.offsetLeft, evt.clientY - that.board.offsetTop);
        }, 
        //SVG
        getOffset = function (clientXY, evt) {
            return point_1.default.times(clientXY, that.ratioX, that.ratioY).round();
        }, handleMouseEvent = function (evt) {
            //this is MyApp
            evt.preventDefault();
            evt.stopPropagation();
            var arr = [], target = evt.target, parent = target.parentNode, clientXY = getClientXY(evt), state = {
                id: '#' + parent.id,
                type: dab_1.attr(parent, "svg-comp"),
                button: evt.button,
                //parent: parent,
                client: clientXY,
                offset: getOffset(clientXY, evt),
                event: evt.type.replace('mouse', ''),
                timeStamp: evt.timeStamp,
                over: {
                    type: dab_1.attr(target, "svg-type"),
                    svg: target
                },
                ctrlKey: evt.ctrlKey,
                shiftKey: evt.shiftKey,
                altKey: evt.altKey,
                it: components_1.default.item(parent.id)
            };
            //post actions
            switch (state.over.type) {
                case "node":
                    state.over.nodeNumber = dab_1.attr(state.over.svg, state.over.type);
                    state.it && (state.over.node = state.it.getNode(state.over.nodeNumber));
                    break;
                case "line":
                    state.over.line = dab_1.attr(state.over.svg, state.over.type) | 0;
                    break;
                default:
                    //if we got here, it's a hit on a component without svg-type
                    //state.type != ["board", "wire"] then it's "body"
                    (state.it && state.type != "wire") && (state.over.type = "body");
                    break;
            }
            //UI logs
            arr.push(" " + state.event + " " + state.id + " " + state.type + "^" + state.over.type);
            arr.push("multiplier: " + that.multiplier);
            arr.push("state: " + interfaces_1.StateType[that.state.value]);
            arr.push(state.offset.toString()); //`x: ${round(state.offset.x, 1)} y: ${round(state.offset.y, 1)}`
            arr.push("client " + clientXY.toString());
            //arr.push(`scaled: x: ${clientXYScaled.x} y: ${clientXYScaled.y}`);
            //render
            that.topBarLeft.innerText = arr.join(", ");
            return state;
        };
        ;
        //location is panning, size is for scaling
        _this.viewBox = new rect_1.default(point_1.default.origin, size_1.default.empty);
        //scaling multipler
        _this.multiplier = 0.5; // 2X UI default
        //this's a const value
        _this.ratio = window.screen.width / window.screen.height;
        _this.ratioX = 1;
        _this.ratioY = 1;
        _this.pos = new point_1.default(50, 10);
        //main SVG insertion point
        _this.tooltip = new tooltip_1.default({ id: "tooltip", borderRadius: 4 });
        _this.rootDir = utils_1.basePath(); //not used in electron
        _this.board = utils_1.qS("#board");
        _this.svgBoard = _this.board.children[0];
        _this.topBarLeft = utils_1.qS("#top-bar>div:nth-of-type(1)");
        _this.topBarRight = utils_1.qS("#top-bar>div:nth-of-type(2)");
        //this'll hold the properties of the current selected component
        _this.winProps = new app_window_1.default({
            app: _this,
            id: "win-props",
            x: 800,
            y: 0,
            size: {
                width: 250,
                height: 300
            },
            title: "Properties",
            bar: "...",
            content: "Aaaaa...!  kjsdhj sjh sj d sj sd sdjs djsdj kkisaujn ak asd asdn askd askd aksdn aksd  ia hsdoia oa sdoas "
        });
        //create state machine
        _this.state = new stateMachine_1.default({
            id: "state-machine-01",
            initial: interfaces_1.StateType.IDLE,
            states: {},
            ctx: {},
            commonActions: {
                HIDE_NODE: function (newContext) {
                    newContext.it && newContext.it.hideNode();
                    //hide tooltip
                    that.tooltip.setVisible(false);
                },
                SHOW_BODY_TOOLTIP: function (newContext) {
                    var _a;
                    var p = point_1.default.translateBy(newContext.offset, 20);
                    that.tooltip.setVisible(true)
                        .move(p.x, p.y)
                        .setFontSize(that.tooltipFontSize())
                        .setText((_a = newContext.it) === null || _a === void 0 ? void 0 : _a.id);
                },
                SHOW_NODE_TOOLTIP: function (newContext) {
                    var _a, _b, _c;
                    //data has current state
                    if (!((_a = newContext.it) === null || _a === void 0 ? void 0 : _a.highlighted)) {
                        (_b = newContext.it) === null || _b === void 0 ? void 0 : _b.showNode(newContext.over.nodeNumber);
                        //show tooltip
                        var p = point_1.default.translateBy(newContext.offset, 20);
                        that.tooltip.setVisible(true)
                            .move(p.x, p.y)
                            .setFontSize(that.tooltipFontSize())
                            .setText(newContext.over.nodeNumber + " -" + ((_c = newContext.over.node) === null || _c === void 0 ? void 0 : _c.label));
                    }
                },
                FORWARD_OVER: function (newContext) {
                    //accepts transitions to new state on mouse OVER
                    var prefix = !newContext.it ? "" : newContext.it.type == 1 ? "EC_" : "WIRE_", stateName = (prefix + newContext.over.type).toUpperCase(), state = interfaces_1.StateType[stateName];
                    //EC_NODE		WIRE_NODE
                    that.state.transition(state, interfaces_1.ActionType.START, newContext);
                    //console.log(`transition: ${transition}.${action}`)
                }
            }
        });
        //context menu
        _this.rightClick = new context_window_1.default({
            app: _this,
            id: "win-rc",
            x: 50,
            y: 50,
            size: {
                width: 200,
                height: 250
            },
            class: "no-select",
            list: options.list
        });
        dab_1.aEL(_this.svgBoard, "mouseover", function (evt) {
            that.state.enabled && that.state.send(interfaces_1.ActionType.OVER, handleMouseEvent.call(that, evt));
        }, false);
        dab_1.aEL(_this.svgBoard, "mousemove", function (evt) {
            that.state.enabled && that.state.send(interfaces_1.ActionType.MOVE, handleMouseEvent.call(that, evt));
        }, false);
        dab_1.aEL(_this.svgBoard, "mouseout", function (evt) {
            that.state.enabled && that.state.send(interfaces_1.ActionType.OUT, handleMouseEvent.call(that, evt));
        }, false);
        //
        dab_1.aEL(_this.svgBoard, "mousedown", function (evt) {
            that.state.enabled && that.state.send(interfaces_1.ActionType.DOWN, handleMouseEvent.call(that, evt));
        }, false);
        dab_1.aEL(_this.svgBoard, "mouseup", function (evt) {
            that.state.enabled && that.state.send(interfaces_1.ActionType.UP, handleMouseEvent.call(that, evt));
        }, false);
        //right click o board
        dab_1.aEL(_this.svgBoard, "contextmenu", function (evt) {
            evt.stopPropagation();
            var target = evt.target, type = dab_1.attr(target, "svg-type"), key = that.rightClick.setTrigger(dab_1.attr(target.parentNode, "id"), dab_1.attr(target.parentNode, "svg-comp"), type, dab_1.attr(target, type));
            if (key) {
                that.rightClick
                    .build(key)
                    .movePoint(getClientXY(evt))
                    .setVisible(true);
            }
        }, false);
        return _this;
    }
    MyApp.prototype.insideBoard = function (p) {
        //later include panning
        return p.x > 0 && p.y > 0 && p.x < this.viewBox.size.width && p.y < this.viewBox.size.height;
    };
    MyApp.prototype.setViewBox = function (m) {
        if (!m) {
            var zoom_item = utils_1.qS('.bar-item[data-scale].selected'), //get default from DOM
            o = dab_1.attr(zoom_item, "data-scale");
            m = parseFloat(o);
        }
        this.multiplier = m;
        this.baseViewBox = new size_1.default(this.board.clientWidth * this.ratio | 0, this.board.clientHeight * this.ratio | 0);
        //calculate size
        this.viewBox.size = new size_1.default(this.baseViewBox.width * this.multiplier | 0, this.baseViewBox.height * this.multiplier | 0);
        //set SVG DOM viewBox attribute
        dab_1.attr(this.svgBoard, { "viewBox": this.viewBox.x + " " + this.viewBox.y + " " + this.viewBox.width + " " + this.viewBox.height });
        //calculate ratio
        this.ratioX = this.viewBox.width / this.svgBoard.clientWidth;
        this.ratioY = this.viewBox.height / this.svgBoard.clientHeight;
        //
        this.refreshTopBarRight();
    };
    MyApp.prototype.refreshTopBarRight = function () {
        this.topBarRight.innerHTML = dab_1.nano(this.templates.viewBox01, this.viewBox) + "&nbsp; " +
            dab_1.nano(this.templates.size01, this.size);
    };
    MyApp.prototype.getAspectRatio = function (width, height) {
        var ratio = width / height;
        return (Math.abs(ratio - 4 / 3) < Math.abs(ratio - 16 / 9)) ? '4:3' : '16:9';
    };
    return MyApp;
}(app_1.Application));
exports.MyApp = MyApp;
//# sourceMappingURL=myapp.js.map