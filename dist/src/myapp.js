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
var types_1 = require("./types");
var linealign_1 = require("./linealign");
var highlightNode_1 = require("./highlightNode");
var MyApp = /** @class */ (function (_super) {
    __extends(MyApp, _super);
    function MyApp(options) {
        var _a;
        var _this = _super.call(this, options) || this;
        _this.tooltipFontSize = function () { return Math.max(10, 35 * _this.multiplier); };
        var that = _this, hideNodeTooltip = function (newCtx) {
            that.highlight.hide();
            that.tooltip.setVisible(false);
        }, 
        //HTML
        getClientXY = function (ev) {
            return new point_1.default(ev.clientX - that.board.offsetLeft, ev.clientY - that.board.offsetTop);
        }, 
        //SVG
        getOffset = function (clientXY) {
            return point_1.default.times(clientXY, that.ratioX, that.ratioY).round();
        }, handleMouseEvent = function (ev) {
            //this is MyApp
            ev.preventDefault();
            ev.stopPropagation();
            var arr = [], target = ev.target, parent = target.parentNode, clientXY = getClientXY(ev), state = {
                //id: parent.id,
                type: dab_1.attr(parent, "svg-comp"),
                button: ev.button,
                //parent: parent,
                client: clientXY,
                offset: getOffset(clientXY),
                event: ev.type.replace('mouse', ''),
                //timeStamp: ev.timeStamp,
                over: {
                    type: dab_1.attr(target, "svg-type"),
                    svg: target
                },
                ctrlKey: ev.ctrlKey,
                shiftKey: ev.shiftKey,
                altKey: ev.altKey,
                it: components_1.default.item(parent.id)
            };
            //post actions
            switch (state.over.type) {
                case "node":
                    //case "node-x":
                    state.over.node = dab_1.attr(state.over.svg, state.over.type) | 0;
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
            arr.push(utils_1.pad(state.event, 5, '&nbsp;') + " " + parent.id + " " + state.type + "^" + state.over.type);
            //arr.push(`multiplier: ${that.multiplier}`);
            arr.push("state: " + interfaces_1.StateType[that.sm.state]);
            arr.push(state.offset.toString()); //`x: ${round(state.offset.x, 1)} y: ${round(state.offset.y, 1)}`
            //arr.push(`client ${clientXY.toString()}`);
            //arr.push(`scaled: x: ${clientXYScaled.x} y: ${clientXYScaled.y}`);
            //render
            that.topBarLeft.innerHTML = arr.join(", ");
            return state;
        };
        _this.compList = new Map();
        _this.selectedComponents = [];
        _this.viewBox = rect_1.default.empty(); //location is panning, size is for scaling
        _this.multiplier = 0.5; //scaling multipler 2X UI default
        _this.ratio = window.screen.width / window.screen.height; //this's a const value
        _this.ratioX = 1;
        _this.ratioY = 1;
        _this.tooltip = new tooltip_1.default({ id: "tooltip", borderRadius: 4 });
        _this.rootDir = utils_1.basePath(); //not used in electron
        _this.board = utils_1.qS("#board");
        _this.svgBoard = _this.board.children[0];
        _this.topBarLeft = utils_1.qS("#top-bar>div:nth-of-type(1)");
        _this.topBarRight = utils_1.qS("#top-bar>div:nth-of-type(2)");
        _this.dash = new linealign_1.default(_this);
        _this.highlight = new highlightNode_1.default({});
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
        _this.sm = new stateMachine_1.default({
            id: "state-machine-01",
            initial: interfaces_1.StateType.BOARD,
            states: {},
            log: (_a = _this.prop("cons_log")) === null || _a === void 0 ? void 0 : _a.value,
            ctx: {},
            commonActions: {
                ENTER: function (newCtx) {
                    //that.sm.ctx = newCtx;		//for now just copy data
                },
                LEAVE: function (newCtx) {
                    //cannot save new context, erases wiring status
                    hideNodeTooltip(newCtx);
                    that.topBarLeft.innerHTML = "&nbsp;";
                },
                KEY: function (code) {
                    console.log("KEY: " + code);
                    //this's the default
                    (code == "Delete") && that.execute(interfaces_1.ActionType.DELETE, "");
                },
                HIDE_NODE: hideNodeTooltip,
                FORWARD_OVER: function (newCtx) {
                    //accepts transitions to new state on mouse OVER
                    var prefix = !newCtx.it ? "" : newCtx.it.type == 1 ? "EC_" : "WIRE_", stateName = (prefix + newCtx.over.type).toUpperCase(), state = interfaces_1.StateType[stateName];
                    that.sm.transition(state, interfaces_1.ActionType.START, newCtx); //EC_NODE		WIRE_NODE
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
        dab_1.aEL(_this.svgBoard, "mouseenter", function (ev) {
            that.sm.send(interfaces_1.ActionType.ENTER, handleMouseEvent.call(that, ev));
        }, false);
        dab_1.aEL(_this.svgBoard, "mouseleave", function (ev) {
            that.sm.send(interfaces_1.ActionType.LEAVE, handleMouseEvent.call(that, ev));
        }, false);
        dab_1.aEL(_this.svgBoard, "mouseover", function (ev) {
            that.sm.send(interfaces_1.ActionType.OVER, handleMouseEvent.call(that, ev));
        }, false);
        dab_1.aEL(_this.svgBoard, "mousemove", function (ev) {
            that.sm.send(interfaces_1.ActionType.MOVE, handleMouseEvent.call(that, ev));
        }, false);
        dab_1.aEL(_this.svgBoard, "mouseout", function (ev) {
            that.sm.send(interfaces_1.ActionType.OUT, handleMouseEvent.call(that, ev));
        }, false);
        //
        dab_1.aEL(_this.svgBoard, "mousedown", function (ev) {
            that.sm.send(interfaces_1.ActionType.DOWN, handleMouseEvent.call(that, ev));
        }, false);
        dab_1.aEL(_this.svgBoard, "mouseup", function (ev) {
            that.sm.send(interfaces_1.ActionType.UP, handleMouseEvent.call(that, ev));
        }, false);
        //right click on board
        dab_1.aEL(_this.svgBoard, "contextmenu", function (ev) {
            ev.stopPropagation();
            var target = ev.target, parent = target.parentNode, id = dab_1.attr(parent, "id"), compName = dab_1.attr(parent, "svg-comp"), type = dab_1.attr(target, "svg-type"), nodeOrLine = parseInt(dab_1.attr(target, type)), key = void 0, clientXY = getClientXY(ev), comp = void 0;
            //test for highlightNode
            (compName == "h-node") &&
                (id = that.highlight.selectedId,
                    comp = components_1.default.item(id),
                    compName = comp.type == types_1.Type.WIRE ? "wire" : "ec",
                    (nodeOrLine != that.highlight.selectedNode && console.log("node: " + nodeOrLine + " <> " + that.highlight.selectedNode)));
            key = that.rightClick.setTrigger(id, compName, type, isNaN(nodeOrLine) ? undefined : nodeOrLine);
            key &&
                that.rightClick
                    .build(key, that.sm.state, getOffset(clientXY))
                    .movePoint(clientXY)
                    .setVisible(true);
        }, false);
        document.onkeydown = function (ev) {
            //https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/code
            switch (ev.code) {
                case 'Enter':
                case 'Escape':
                case 'ArrowLeft':
                case 'ArrowUp':
                case 'ArrowRight':
                case 'ArrowDown':
                case 'Delete':
                case 'ControlLeft':
                case 'ControlRight':
                    that.sm.send(interfaces_1.ActionType.KEY, ev.code);
                    break;
            }
            //console.log(ev.code)
        };
        return _this;
    }
    Object.defineProperty(MyApp.prototype, "tooltipOfs", {
        get: function () { return 15; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(MyApp.prototype, "ec", {
        //has value if only one comp selected, none or multiple has undefined
        get: function () {
            return this.selectedComponents.length == 1 ? this.selectedComponents[0] : void 0;
        },
        enumerable: false,
        configurable: true
    });
    MyApp.prototype.insideBoard = function (p) {
        //later include panning
        return p.x > 0 && p.y > 0 && p.x < this.viewBox.width && p.y < this.viewBox.height;
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
        this.viewBox.width = this.baseViewBox.width * this.multiplier | 0;
        this.viewBox.height = this.baseViewBox.height * this.multiplier | 0;
        //this.viewBox.size = new Size(
        //	this.baseViewBox.width * this.multiplier | 0,
        //	this.baseViewBox.height * this.multiplier | 0);
        //set SVG DOM viewBox attribute
        dab_1.attr(this.svgBoard, { "viewBox": this.viewBox.x + " " + this.viewBox.y + " " + this.viewBox.width + " " + this.viewBox.height });
        //calculate ratio
        this.ratioX = this.viewBox.width / this.svgBoard.clientWidth;
        this.ratioY = this.viewBox.height / this.svgBoard.clientHeight;
        this.center = new point_1.default(this.viewBox.width / 2, this.viewBox.height / 2);
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
    MyApp.prototype.hasComponent = function (id) { return this.compList.has(id); };
    MyApp.prototype.addComponent = function (comp) {
        if (comp) {
            if (this.hasComponent(comp.id))
                throw "duplicated component " + comp.id;
            this.compList.set(comp.id, comp);
            //add it to SVG DOM
            (comp.type == types_1.Type.WIRE) ?
                this.dash.g.insertAdjacentElement("afterend", comp.g) :
                this.svgBoard.insertBefore(comp.g, this.tooltip.g);
            //do after DOM inserted work
            comp.afterDOMinserted();
        }
        return comp;
    };
    MyApp.prototype.rotateEC = function (angle) {
        this.rotateComponentBy(angle, this.ec);
    };
    MyApp.prototype.rotateComponentBy = function (angle, comp) {
        if (!comp || comp.type != types_1.Type.EC)
            return;
        var ec = comp;
        ec && ec.rotate(ec.rotation + angle);
        this.refreshRotation(ec);
    };
    MyApp.prototype.refreshRotation = function (ec) {
        var _a;
        var isEC = ec && (ec.type == types_1.Type.EC), rotation = isEC ? ec.rotation : 0;
        this.prop("rot_lbl").value = " " + rotation + "\u00B0";
        isEC && (this.winProps.compId == (ec === null || ec === void 0 ? void 0 : ec.id)) && ((_a = this.winProps.property("rotation")) === null || _a === void 0 ? void 0 : _a.refresh());
    };
    //public execute({ action, trigger, data }: { action: ActionType; trigger: string; data?: any; }) {
    MyApp.prototype.execute = function (action, trigger) {
        var _this = this;
        var arr = trigger.split('::'), comp = components_1.default.item(arr.shift()), name = arr.shift(), type = arr.shift(), nodeOrLine = parseInt(arr.shift()), data = arr.shift(), compNull = false, selectAll = function (value) {
            var arr = Array.from(_this.compList.values());
            arr.forEach(function (comp) { return comp.select(value); });
            return arr;
        };
        //this's a temporary fix to make it work
        //	final code will have a centralized action dispatcher
        switch (action) {
            case interfaces_1.ActionType.TOGGLE_SELECT:
                if (!(compNull = !comp)) {
                    comp.select(!comp.selected);
                    this.selectedComponents = Array.from(this.compList.values()).filter(function (c) { return c.selected; });
                    this.refreshRotation(this.ec);
                    (this.ec && (this.winProps.load(this.ec), 1)) || this.winProps.clear();
                    //temporary, for testings...
                    this.ec && (window.ec = this.ec);
                }
                break;
            case interfaces_1.ActionType.SELECT:
            case interfaces_1.ActionType.SELECT_ONLY:
                if (!(compNull = !comp)) {
                    selectAll(false);
                    this.selectedComponents = [comp.select(true)];
                    this.refreshRotation(comp);
                    ((action == interfaces_1.ActionType.SELECT) && (this.winProps.load(comp), 1)) || this.winProps.clear();
                    //temporary, for testings...
                    window.ec = this.ec;
                }
                break;
            case interfaces_1.ActionType.SELECT_ALL:
                this.selectedComponents = selectAll(true);
                this.refreshRotation();
                this.winProps.clear();
                //temporary, for testings...
                window.ec = void 0;
                break;
            case interfaces_1.ActionType.UNSELECT_ALL:
                selectAll(false);
                this.selectedComponents = [];
                this.refreshRotation();
                this.winProps.clear();
                //temporary, for testings...
                window.ec = void 0;
                break;
            case interfaces_1.ActionType.DELETE_SELECTED:
                var selectedCount = this.selectedComponents.length, deletedCount_1 = 0;
                this.selectedComponents = this.selectedComponents.filter(function (c) {
                    if (_this.compList.delete(c.id)) {
                        //disconnects and remove component from DOM
                        c.disconnect();
                        c.remove();
                        deletedCount_1++;
                        return false;
                    }
                    return true;
                });
                this.refreshRotation();
                this.winProps.clear().setVisible(false);
                this.tooltip.setVisible(false);
                if (selectedCount != deletedCount_1) {
                    console.log("[" + deletedCount_1 + "] components of [" + selectedCount + "]");
                }
                //temporary, for testings...
                window.ec = void 0;
                break;
            case interfaces_1.ActionType.DELETE:
                //only comp if sent
                if (!(compNull = !comp)) {
                    if (this.compList.delete(comp.id)) {
                        //disconnects and remove component from DOM
                        comp.disconnect();
                        comp.remove();
                        this.refreshRotation();
                        this.winProps.clear().setVisible(false);
                        this.tooltip.setVisible(false);
                        this.sm.send(interfaces_1.ActionType.AFTER_DELETE, comp.id);
                    }
                }
                //temporary, for testings...
                window.ec = void 0;
                break;
            case interfaces_1.ActionType.DELETE_THIS_LINE:
                console.log("delete line segment: ", trigger);
                if (!(compNull = !comp)) {
                    comp.deleteLine(nodeOrLine);
                    this.winProps.refresh();
                }
                break;
            case interfaces_1.ActionType.DELETE_WIRE_NODE:
                console.log("delete wire node: ", trigger);
                if (!(compNull = !comp)) {
                    comp.deleteNode(nodeOrLine);
                    this.winProps.refresh();
                }
                break;
            case interfaces_1.ActionType.SPLIT_THIS_LINE:
                console.log("split line segment: ", trigger, this.rightClick.offset);
                if (!(compNull = !comp)) {
                    comp.insertNode(nodeOrLine, this.rightClick.offset);
                    this.winProps.refresh();
                }
                break;
            case interfaces_1.ActionType.SHOW_PROPERTIES:
                !(compNull = !comp) && this.winProps.load(comp);
                break;
            case interfaces_1.ActionType.ROTATE_45_CLOCKWISE:
            case interfaces_1.ActionType.ROTATE_45_COUNTER_CLOCKWISE:
            case interfaces_1.ActionType.ROTATE_90_CLOCKWISE:
            case interfaces_1.ActionType.ROTATE_90_COUNTER_CLOCKWISE:
                !(compNull = !comp) && data && this.rotateComponentBy(data | 0, comp);
                break;
        }
        //logs
        if (compNull) {
            console.log("invalid trigger: " + trigger);
        }
        else {
            //console.log(`action: ${action}, id: ${comp?.id}, name: ${name}, type: ${type}, trigger: ${trigger}`);
        }
    };
    return MyApp;
}(app_1.Application));
exports.MyApp = MyApp;
//# sourceMappingURL=myapp.js.map