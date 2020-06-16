"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var electron_1 = require("electron");
var utils_1 = require("./utils");
var fs = require("fs");
var xml2js = require("xml2js");
var interfaces_1 = require("./interfaces");
var components_1 = require("./components");
var myapp_1 = require("./myapp");
var dab_1 = require("./dab");
var point_1 = require("./point");
var types_1 = require("./types");
var size_1 = require("src/size");
var rect_1 = require("src/rect");
var app, showBodyAndTooltip = function (offset, label) {
    var p = point_1.default.translateBy(offset, app.tooltipOfs);
    app.tooltip.setVisible(true)
        .move(p.x, p.y)
        .setFontSize(app.tooltipFontSize())
        .setText(label);
}, hideNodeTooltip = function (it) {
    app.highlight.hide();
    app.tooltip.setVisible(false);
}, showWireConnections = function (wire) {
    app.sm.data.showWireConnections = true;
    app.highlight.showConnections(getWireConnections(wire));
}, hideWireConnections = function () {
    app.sm.data.showWireConnections = false;
    app.highlight.hide();
}, cursorDeltas = {
    ArrowLeft: { x: -1, y: 0 },
    ArrowUp: { x: 0, y: -1 },
    ArrowRight: { x: 1, y: 0 },
    ArrowDown: { x: 0, y: 1 }
}, cursorBoardHandler = function (code) {
    app.tooltip.setVisible(false);
    app.highlight.setVisible(false);
    //console.log(`BOARD key code: ${code}`)
    switch (code) {
        case 'CtrlKeyA':
            app.execute(interfaces_1.ActionType.SELECT_ALL, "");
            break;
        case 'CtrlKeyS':
            app.circuit.save(false);
            break;
        case 'CtrlKeyL':
            app.loadCircuit();
            break;
        case 'Delete':
            app.execute(interfaces_1.ActionType.DELETE_SELECTED, "");
            break;
        case 'ArrowLeft':
        case 'ArrowUp':
        case 'ArrowRight':
        case 'ArrowDown':
            var vector_1 = cursorDeltas[code];
            app.circuit.selectedComponents
                .forEach(function (comp) { return comp.move(comp.x + vector_1.x, comp.y + vector_1.y); });
            app.circuit.modified = true;
            break;
    }
};
//experimental
var ecCircles = {
    g: utils_1.tag("g", "ec-circles", {
        class: "hide"
    })
};
function hookEvents() {
    //ZOOM controls
    utils_1.qSA('.bar-item[data-scale]').forEach(function (item) {
        dab_1.aEL(item, "click", function (e) {
            var scaleTarget = dab_1.getParentAttr(e.target, "data-scale"), o = dab_1.attr(scaleTarget, "data-scale"), m = parseFloat(o);
            if (app.multiplier == m)
                return;
            app.setBoardZoom(m, true);
        }, false);
    });
    //Rotations
    dab_1.aEL(utils_1.qS('.bar-item[rot-dir="left"]'), "click", function () { return app.rotateEC(-45); }, false);
    dab_1.aEL(utils_1.qS('.bar-item[rot-dir="right"]'), "click", function () { return app.rotateEC(45); }, false);
    //add component
    dab_1.aEL(utils_1.qS('.bar-item[action="comp-create"]'), "click", function () {
        return app.circuit.add(app.prop("comp_option").value, true);
    }, false);
    //ViewBox Reset
    dab_1.aEL(utils_1.qS('.bar-item[tool="vb-focus"]'), "click", function () { return app.updateViewBox(0, 0); }, false);
    //File Open
    dab_1.aEL(utils_1.qS('.bar-item[file="open"]'), "click", function () { return app.loadCircuit(); }, false);
    //Save File
    dab_1.aEL(utils_1.qS('.bar-item[file="save"]'), "click", function () { return app.circuit.save(false); }, false);
}
function getWireConnections(wire) {
    var wireCollection = [wire], wiresFound = [], points = [], findComponents = function (bond) {
        bond.to.forEach(function (b) {
            var w = app.circuit.get(b.id);
            if (!w)
                throw "Invalid bond connections"; //shouldn't happen, but to catch wrong code
            switch (b.type) {
                case types_1.Type.WIRE:
                    if (!wiresFound.some(function (id) { return id == b.id; })) {
                        wiresFound.push(w.id);
                        wireCollection.push(w);
                        points.push(point_1.default.create(w.getNode(b.ndx)));
                    }
                    break;
                case types_1.Type.EC:
                    points.push(w.getNodeRealXY(b.ndx));
                    break;
            }
        });
    };
    while (wireCollection.length) {
        var w = wireCollection.shift();
        wiresFound.push(w.id);
        w.bonds.forEach(findComponents);
    }
    return points;
}
function registerBoardState() {
    app.sm.register({
        key: interfaces_1.StateType.BOARD,
        overType: "function",
        persistData: true,
        data: {},
        actions: {
            KEY: cursorBoardHandler,
            ENTER: function (newCtx) {
                //console.log('BOARD.ENTER')
                app.sm.data.panningVector = void 0;
                app.sm.data.selection = false;
                app.selection.hide();
                app.sm.data.mouseDown = false;
                dab_1.removeClass(app.svgBoard, "dragging");
            },
            LEAVE: function (newCtx) {
                app.bottomBarLeft.innerHTML = "&nbsp;";
                //console.log('BOARD.LEAVE', newCtx)
            },
            OUT: function (newCtx) {
                //out of any component in the board
                //console.log('BOARD.OUT', newCtx)
            },
            OVER: function (newCtx) {
                if (!newCtx.it || app.sm.data.panningVector || app.sm.data.selection || !newCtx.it)
                    return;
                //
                switch (newCtx.over.type) {
                    case "node":
                        app.sm.transition(interfaces_1.StateType.EC_NODE, interfaces_1.ActionType.START, newCtx, {
                            it: newCtx.it,
                            node: newCtx.over.node
                        });
                        break;
                    case "line":
                        newCtx.it.editMode = true;
                        app.sm.transition(interfaces_1.StateType.WIRE_LINE, interfaces_1.ActionType.START, newCtx, {
                            it: newCtx.it,
                            line: newCtx.over.line
                        });
                        break;
                    case "body":
                        app.sm.transition(interfaces_1.StateType.EC_BODY, interfaces_1.ActionType.START, newCtx, {
                            it: newCtx.it
                        });
                        break;
                }
            },
            MOVE: function (newCtx) {
                //Board panning
                if (newCtx.altKey) {
                    if (app.sm.data.panningVector) {
                        app.updateViewBox(newCtx.client.x - app.sm.data.panningVector.x, newCtx.client.y - app.sm.data.panningVector.y);
                    }
                    return;
                }
                else
                    app.sm.data.panningVector = void 0;
                //Selection Rect
                if (app.sm.data.mouseDown) {
                    if (!app.sm.data.selection) {
                        //start new selection
                        app.sm.data.selection = true;
                        app.selection.show(newCtx.offset);
                        //console.log('startig: ', app.selection.rect)
                    }
                    else
                        app.selection.calculate(newCtx.offset);
                    return;
                }
                if (!newCtx.it)
                    return;
                //
                switch (newCtx.over.type) {
                    case "node":
                        console.log("move: " + newCtx.it.id + " node: " + newCtx.over.node);
                        break;
                    case "line":
                        //wire should be opened here
                        //newCtx.over.line is 0 when wire opened up
                        app.sm.transition(interfaces_1.StateType.WIRE_LINE, interfaces_1.ActionType.START, newCtx, {
                            it: newCtx.it,
                            line: newCtx.over.line
                        });
                        break;
                    case "body":
                        //  rarely happens	¿?
                        console.log('transition on BOARD.MOVE');
                        app.sm.transition(interfaces_1.StateType.EC_BODY, interfaces_1.ActionType.START, newCtx, {
                            it: newCtx.it
                        });
                        break;
                }
            },
            DOWN: function (newCtx) {
                //Board pan
                if (newCtx.altKey) {
                    dab_1.addClass(app.svgBoard, "dragging");
                    app.sm.data.panningVector = new point_1.default(newCtx.client.x - app.viewBox.x, newCtx.client.y - app.viewBox.y);
                }
                else {
                    //Board item selection box
                    app.sm.data.mouseDown = true;
                }
            },
            UP: function (newCtx) {
                app.sm.data.mouseDown = false;
                if (newCtx.button == 0)
                    app.execute(interfaces_1.ActionType.UNSELECT_ALL, "");
                app.rightClick.setVisible(false);
                app.sm.data.panningVector && (app.sm.data.panningVector = void 0,
                    dab_1.removeClass(app.svgBoard, "dragging"));
                if (app.sm.data.selection) {
                    app.sm.data.selection = false;
                    //console.log('ending: ', app.selection.rect);
                    app.circuit.selectRect(app.selection.rect);
                    app.selection.hide();
                }
            },
            //transitions
            START: function () {
                throw 'BOARD.START ILLEGAL, to catch lose code';
            },
            RESUME: function () {
                app.sm.data.mouseDown = false;
                app.sm.data.panningVector = void 0;
                app.sm.data.selection = false;
                app.selection.hide();
                app.highlight.hide();
                hideWireConnections();
            }
        }
    });
}
function registerEcBodyState() {
    app.sm.register({
        key: interfaces_1.StateType.EC_BODY,
        overType: "deny",
        actions: {
            KEY: cursorBoardHandler,
            MOVE: function (newCtx) {
                /*
                //experimental
                if (newCtx.shiftKey) {
                    let
                        ec = app.sm.data.it as EC,
                        p = Point.plus(ec.origin, ec.p);
                    attr(app.sm.data.x.center, {
                        cx: p.x,
                        cy: p.y
                    });
                    app.sm.data.x.circles.forEach((c: SVGCircleElement, ndx: number) => {
                        let
                            p = ec.getNodeRealXY(ndx);
                        attr(c, {
                            cx: p.x,
                            cy: p.y
                        })
                    });
                    removeClass(ecCircles.g, "hide")
                    return;
                } else {
                    addClass(ecCircles.g, "hide")
                }
                */
                if (app.sm.data.mouseDown
                    && app.sm.data.button == 0) {
                    app.sm.transition(interfaces_1.StateType.EC_DRAG, interfaces_1.ActionType.START, newCtx, {
                        it: app.sm.data.it
                    });
                }
                else {
                    var ec = app.sm.data.it, node = ec.overNode(newCtx.offset, 0);
                    if (node != -1) {
                        app.tooltip.setVisible(false);
                        app.sm.transition(interfaces_1.StateType.EC_NODE, interfaces_1.ActionType.START, newCtx, {
                            it: ec,
                            node: node
                        });
                    }
                    else {
                        var p = point_1.default.translateBy(newCtx.offset, app.tooltipOfs);
                        app.tooltip.move(p.x, p.y);
                    }
                }
            },
            OUT: function () {
                app.tooltip.setVisible(false);
                app.sm.transition(interfaces_1.StateType.BOARD, interfaces_1.ActionType.RESUME);
                //experimental
                //addClass(ecCircles.g, "hide")
            },
            DOWN: function (newCtx) {
                app.sm.data.mouseDown = true;
                app.sm.data.button = newCtx.button;
            },
            UP: function (newCtx) {
                var _a, _b;
                app.sm.data.mouseDown = false;
                app.rightClick.setVisible(false);
                (newCtx.button == 0) && app.execute(newCtx.ctrlKey ?
                    interfaces_1.ActionType.TOGGLE_SELECT : // Ctrl+click	=> toggle select
                    interfaces_1.ActionType.SELECT, // click		=> select one
                [(_a = newCtx.it) === null || _a === void 0 ? void 0 : _a.id, (_b = newCtx.it) === null || _b === void 0 ? void 0 : _b.name, "body"].join('::'));
            },
            //transitions
            START: function (newCtx) {
                showBodyAndTooltip(newCtx.offset, app.sm.data.it.id);
                app.sm.data.mouseDown = false;
                app.sm.data.button = newCtx.button;
                /*
                //experimental
                let
                    ec = app.sm.data.it as EC,
                    circle = (p: IPoint) => {
                        return <SVGCircleElement>tag("circle", "", {
                            cx: p.x,
                            cy: p.y,
                            r: 9
                        })
                    };

                app.sm.data.x = {
                    shiftKey: false,
                    center: circle(Point.plus(ec.origin, ec.p)),
                    circles: range(0, ec.count).map(n => circle(ec.getNodeRealXY(n)))
                }
                ecCircles.g.innerHTML = app.sm.data.x.center.outerHTML
                    + app.sm.data.x.circles.map((c: SVGCircleElement) => c.outerHTML).join('');
                */
            }
        }
    });
}
function registerEcDragState() {
    app.sm.register({
        key: interfaces_1.StateType.EC_DRAG,
        overType: "deny",
        actions: {
            MOVE: function (newCtx) {
                var _a, _b;
                this.data.dragging.forEach(function (comp) {
                    var p = point_1.default.minus(newCtx.offset, comp.offset);
                    comp.ec.move(p.x, p.y);
                });
                (((_a = app.circuit.ec) === null || _a === void 0 ? void 0 : _a.id) == app.winProps.compId) && ((_b = app.winProps.property("p")) === null || _b === void 0 ? void 0 : _b.refresh());
            },
            OUT: function () {
                //has to be empty so dragging is not STOP when passing over another component
            },
            UP: function (newCtx) {
                dab_1.removeClass(app.svgBoard, this.data.className);
                app.sm.transition(interfaces_1.StateType.EC_BODY, interfaces_1.ActionType.START, newCtx, {
                    it: app.sm.data.it
                });
            },
            //transitions
            START: function (newCtx) {
                var self = this, it = self.data.it, newCtxIt = newCtx.it;
                if (!newCtxIt)
                    throw "EC_DRAG on undefined EC";
                !app.circuit.selectedComponents.some(function (comp) { return comp.id == newCtxIt.id; }) &&
                    (app.execute(interfaces_1.ActionType.SELECT, newCtxIt.id + "::" + newCtxIt.name + "::body"));
                self.data = {
                    it: it,
                    className: "dragging",
                    dragging: app.circuit.selectedComponents.map(function (comp) { return ({
                        ec: comp,
                        offset: point_1.default.minus(newCtx.offset, comp.p)
                    }); })
                };
                app.circuit.modified = true;
                dab_1.addClass(app.svgBoard, self.data.className);
                hideNodeTooltip(newCtxIt);
                app.rightClick.setVisible(false);
            },
        }
    });
}
function registerEcNodeState() {
    app.sm.register({
        key: interfaces_1.StateType.EC_NODE,
        overType: "deny",
        actions: {
            KEY: cursorBoardHandler,
            MOVE: function (newCtx) {
                var node = app.sm.data.it.overNode(newCtx.offset, 0), p = point_1.default.translateBy(newCtx.offset, app.tooltipOfs);
                if (node == -1) {
                    app.tooltip.setVisible(false);
                    app.sm.transition(interfaces_1.StateType.BOARD, interfaces_1.ActionType.RESUME);
                }
                else
                    app.tooltip.move(p.x, p.y);
            },
            UP: function (newCtx) {
                if (newCtx.ctrlKey) {
                    app.tooltip.setVisible(false);
                    app.sm.transition(interfaces_1.StateType.NEW_WIRE_FROM_EC, interfaces_1.ActionType.START, newCtx, {
                        start: {
                            it: app.sm.data.it,
                            node: app.sm.data.node
                        }
                    });
                }
            },
            //transitions
            START: function (newCtx) {
                var it = app.sm.data.it, node = app.sm.data.node, itemNode = it.getNode(node), label = itemNode.label, p = point_1.default.plus(it.p, it.rotation ? itemNode.rot : itemNode).round();
                app.highlight.show(p.x, p.y, it.id, node);
                showBodyAndTooltip(newCtx.offset, node + " -" + label);
            },
        }
    });
}
function registerNewWireFromEcState() {
    app.sm.register({
        key: interfaces_1.StateType.NEW_WIRE_FROM_EC,
        overType: "function",
        actions: {
            KEY: function (code) {
                var _a;
                if (code == "Escape") {
                    app.sm.data.wire.editMode = true;
                    (_a = app.sm.data.selectedItem) === null || _a === void 0 ? void 0 : _a.it.select(false);
                    app.highlight.hide();
                    app.sm.transition(interfaces_1.StateType.BOARD, interfaces_1.ActionType.RESUME);
                }
            },
            UP: function (newCtx) {
                var self = this, wire = self.data.wire;
                if (self.data.selectedItem) {
                    var destIt = self.data.selectedItem.it, destNode = self.data.selectedItem.node;
                    wire.editMode = true;
                    destIt.select(false);
                    wire.bond(wire.last, destIt, destNode);
                    app.highlight.hide();
                    app.sm.transition(interfaces_1.StateType.BOARD, interfaces_1.ActionType.RESUME);
                }
                else {
                    //otherwise correct last node
                    wire.setNode(wire.last, newCtx.offset);
                    wire.appendNode(newCtx.offset);
                }
            },
            OUT: function (newCtx) {
                var _a;
                if (newCtx.over.type == "node") { //"node-x"
                    (_a = app.sm.data.selectedItem) === null || _a === void 0 ? void 0 : _a.it.select(false);
                    app.sm.data.selectedItem = undefined;
                    app.highlight.hide();
                }
            },
            OVER: function (newCtx) {
                var node = -1, pos = void 0, it = newCtx.it;
                if (!it)
                    return;
                switch (newCtx.over.type) {
                    case "body":
                        pos = it.getNodeRealXY(node = it.findNode(newCtx.offset));
                        break;
                    case "line":
                        pos = it.getNode(node = it.findLineNode(newCtx.offset, newCtx.over.line));
                        break;
                }
                if (it.id != app.sm.data.wire.id
                    && pos
                    && !(it.type == types_1.Type.WIRE && (node == 0 || node == it.last))) {
                    if (app.sm.data.selectedItem && app.sm.data.selectedItem.it.id != it.id) {
                        app.sm.data.selectedItem.it.select(false);
                    }
                    (app.sm.data.selectedItem = {
                        it: it,
                        node: node
                    }).it.select(true);
                    app.highlight.show(pos.x, pos.y, it.id, node);
                }
            },
            MOVE: function (newCtx) {
                var self = this, prevNodePos = self.data.wire.getNode(self.data.wire.last - 1), r = 7, angle = Math.atan2(newCtx.offset.y - prevNodePos.y, newCtx.offset.x - prevNodePos.x), p = new point_1.default((newCtx.offset.x - r * Math.cos(angle)) | 0, (newCtx.offset.y - r * Math.sin(angle)) | 0);
                self.data.wire.setNode(self.data.wire.last, p);
            },
            AFTER_DELETE: function (deletedId) {
                if (app.sm.data.wire.id == deletedId) {
                    app.sm.transition(interfaces_1.StateType.BOARD, interfaces_1.ActionType.RESUME);
                }
            },
            //transitions
            START: function () {
                var ec = app.sm.data.start.it, node = app.sm.data.start.node, pos = app.sm.data.start.fromWire ? ec.getNode(node) : ec.getNodeRealXY(node);
                app.highlight.hide();
                app.sm.data.wire = app.circuit.add("wire", true, [pos, pos]);
                app.sm.data.wire.bond(0, ec, node);
                app.execute(interfaces_1.ActionType.UNSELECT_ALL, "");
                app.sm.data.selectedItem = undefined;
            },
        }
    });
}
function registerWireLineState() {
    app.sm.register({
        key: interfaces_1.StateType.WIRE_LINE,
        overType: "deny",
        actions: {
            KEY: cursorBoardHandler,
            OUT: function (newCtx) {
                if (!newCtx.it || app.sm.data.node == -1) {
                    app.highlight.hide();
                    app.tooltip.setVisible(false);
                    app.sm.transition(interfaces_1.StateType.BOARD, interfaces_1.ActionType.RESUME);
                    if (app.sm.data.showWireConnections) {
                        hideWireConnections();
                    }
                }
            },
            MOVE: function (newCtx) {
                if (app.sm.data.wiringFromNode)
                    return;
                var wire = app.sm.data.it, line = newCtx.over.line;
                if (app.sm.data.showWireConnections) {
                    hideWireConnections();
                }
                if (app.sm.data.mouseDown
                    && newCtx.button == 0) {
                    //node or line
                    if (app.sm.data.node >= 0) {
                        app.sm.transition(interfaces_1.StateType.WIRE_NODE_DRAG, interfaces_1.ActionType.START, newCtx, {
                            it: app.sm.data.it,
                            node: app.sm.data.node
                        });
                    }
                    else if (!((line == 1 && wire.nodeBonds(0))
                        || (line == wire.lastLine && wire.nodeBonds(wire.last)))) {
                        app.sm.transition(interfaces_1.StateType.WIRE_LINE_DRAG, interfaces_1.ActionType.START, newCtx, {
                            it: app.sm.data.it,
                            line: line
                        });
                    }
                    else {
                        app.sm.transition(interfaces_1.StateType.BOARD, interfaces_1.ActionType.RESUME);
                    }
                    app.sm.data.mouseDown = false;
                    return;
                }
                app.sm.data.mouseDown = false;
                var node = wire.overNode(newCtx.offset, newCtx.over.line), pos = wire.getNode(node);
                if (pos && !((node == 0 && wire.nodeBonds(0)) ||
                    (node == wire.last && wire.nodeBonds(wire.last)))) {
                    app.sm.data.node = node;
                    app.highlight.show(pos.x, pos.y, wire.id, node);
                }
                else {
                    var p = point_1.default.translateBy(newCtx.offset, app.tooltipOfs);
                    !app.tooltip.move(p.x, p.y).visible
                        && app.tooltip.setVisible(true);
                }
            },
            DOWN: function (newCtx) {
                app.tooltip.setVisible(false);
                if (newCtx.ctrlKey) {
                    var wire = app.sm.data.it;
                    if (app.sm.data.node > 0 && app.sm.data.node < wire.last) {
                        app.sm.data.wiringFromNode = true;
                    }
                    else
                        showWireConnections(wire);
                }
                else
                    app.sm.data.mouseDown = true;
            },
            UP: function (newCtx) {
                if (app.sm.data.wiringFromNode) {
                    app.sm.transition(interfaces_1.StateType.NEW_WIRE_FROM_EC, interfaces_1.ActionType.START, newCtx, {
                        start: {
                            it: app.sm.data.it,
                            node: app.sm.data.node,
                            fromWire: true
                        },
                    });
                    return;
                }
                app.rightClick.setVisible(false);
                (newCtx.button == 0
                    && app.sm.data.mouseDown)
                    && (app.sm.data.mouseDown = false,
                        app.execute(newCtx.ctrlKey ?
                            interfaces_1.ActionType.TOGGLE_SELECT : // Ctrl+click	=> toggle select
                            interfaces_1.ActionType.SELECT, // click		=> select one
                        [app.sm.data.it.id, app.sm.data.it.name, "body"].join('::')));
                if (app.sm.data.showWireConnections) {
                    hideWireConnections();
                }
                showBodyAndTooltip(newCtx.offset, app.sm.data.it.id);
            },
            //transitions
            START: function (newCtx) {
                app.sm.data.node = -1;
                app.sm.data.mouseDown = false;
                app.sm.data.showWireConnections = false;
                app.sm.data.wiringFromNode = false;
                showBodyAndTooltip(newCtx.offset, app.sm.data.it.id);
            },
        }
    });
}
function registerWireNodeDragState() {
    app.sm.register({
        key: interfaces_1.StateType.WIRE_NODE_DRAG,
        overType: "deny",
        actions: {
            KEY: function (code) {
            },
            MOVE: function (newCtx) {
                app.sm.data.it.setNode(app.sm.data.node, newCtx.offset);
                app.highlight.show(newCtx.offset.x, newCtx.offset.y, app.sm.data.it.id, app.sm.data.node);
                var wire = app.sm.data.it, wireNode = app.sm.data.node;
                if (newCtx.ctrlKey && (wireNode == 0 || wireNode == wire.last)) {
                    var item = app.sm.data.list
                        .filter(function (c) { return c.r.inside(newCtx.offset); })
                        .map(function (c) {
                        var node = c.it.findNode(newCtx.offset);
                        return {
                            it: c.it,
                            node: node
                        };
                    })
                        .filter(function (c) { return (c.node != -1)
                        && !(c.it.type == types_1.Type.WIRE && (c.node == 0 || c.node == c.it.last)); })[0];
                    if (item) {
                        if (app.sm.data.selectedItem && app.sm.data.selectedItem.it.id != item.it.id) {
                            app.sm.data.selectedItem.it.select(false);
                        }
                        (app.sm.data.selectedItem = item).it.select(true);
                    }
                    else if (app.sm.data.selectedItem) {
                        app.sm.data.selectedItem.it.select(false);
                    }
                    app.dash.hide();
                }
                else
                    app.dash.matchWireNode(app.sm.data.it, app.sm.data.node);
            },
            UP: function (newCtx) {
                dab_1.removeClass(app.svgBoard, this.data.className);
                app.highlight.hide();
                app.dash.hide();
                if (app.sm.data.selectedItem) {
                    app.sm.data.selectedItem.it.select(false);
                    app.sm.data.it.bond(app.sm.data.node, app.sm.data.selectedItem.it, app.sm.data.selectedItem.node);
                }
                else {
                    app.dash.match
                        && (app.dash.wire.setNode(app.dash.node, app.dash.p));
                }
                app.sm.transition(interfaces_1.StateType.BOARD, interfaces_1.ActionType.RESUME, newCtx);
            },
            OUT: function () {
                //has to be empty so dragging is not STOP when passing over another component
            },
            //transitions
            START: function () {
                dab_1.addClass(app.svgBoard, app.sm.data.className = "dragging");
                app.rightClick.setVisible(false);
                var screenBounds = rect_1.default.create(app.viewBox), id = app.sm.data.it.id;
                app.sm.data.list = app.circuit.components
                    .filter(function (item) { return item.id != id; })
                    .map(function (item) {
                    var r = item.rect();
                    screenBounds.intersect(r);
                    return {
                        it: item,
                        r: r
                    };
                }).filter(function (elem) { return !elem.r.empty; });
                app.circuit.modified = true;
                app.sm.data.selectedItem = undefined;
                app.sm.data.it.select(false);
            },
        }
    });
}
function registerWireLineDragState() {
    app.sm.register({
        key: interfaces_1.StateType.WIRE_LINE_DRAG,
        overType: "deny",
        actions: {
            MOVE: function (newCtx) {
                var self = this, line = self.data.line;
                self.data.it.setNode(line - 1, point_1.default.minus(newCtx.offset, self.data.A));
                self.data.it.setNode(line, point_1.default.minus(newCtx.offset, self.data.B));
                app.dash.matchWireLine(self.data.it, line);
            },
            UP: function (newCtx) {
                dab_1.removeClass(app.svgBoard, app.sm.data.className);
                app.dash.hide();
                if (app.dash.match) {
                    var line = app.sm.data.line, vector = point_1.default.minus(app.dash.p, app.dash.wire.getNode(app.dash.node));
                    //there's a rare exceptio here
                    app.dash.wire.setNode(line - 1, point_1.default.plus(app.dash.wire.getNode(line - 1), vector));
                    app.dash.wire.setNode(line, point_1.default.plus(app.dash.wire.getNode(line), vector));
                }
                app.sm.transition(interfaces_1.StateType.BOARD, interfaces_1.ActionType.RESUME, newCtx);
            },
            OUT: function () {
                //has to be empty so dragging is not STOP when passing over another component
            },
            //transitions
            START: function (newCtx) {
                var wire = app.sm.data.it, line = app.sm.data.line;
                app.sm.data.A = point_1.default.minus(newCtx.offset, wire.getNode(line - 1));
                app.sm.data.B = point_1.default.minus(newCtx.offset, wire.getNode(line));
                dab_1.addClass(app.svgBoard, app.sm.data.className = "dragging");
                app.rightClick.setVisible(false);
                app.circuit.modified = true;
            },
        }
    });
}
function readJson(path) {
    var data = fs.readFileSync(path);
    var json = JSON.parse(data.toString().replace(/[\t\r\n]*/g, ""));
    return json;
}
window.addEventListener("DOMContentLoaded", function () {
    //load DOM script HTML templates
    utils_1.templatesDOM("viewBox01|size01|point01|baseWin01|ctxWin01|ctxItem01|propWin01|dialogWin01")
        .then(function (templates) { return __awaiter(void 0, void 0, void 0, function () {
        var json;
        return __generator(this, function (_a) {
            json = readJson('./dist/data/library-circuits.v2.json');
            json.forEach(function (element) {
                components_1.default.register(element);
            });
            json = readJson('./dist/data/context-menu.json');
            app = new myapp_1.MyApp({
                templates: templates,
                includePropsInThis: true,
                multiplier: getUIZoom(),
                props: {
                    rot_lbl: {
                        tag: "#rot-lbl"
                    },
                    comp_option: {
                        tag: "#comp-option",
                        onChange: function (value, where) {
                            if (where != 1) // 1 == "ui"
                                return;
                            //"value" has the string name of the selected component
                        }
                    },
                    cons_log: {
                        tag: "#cons-log",
                        onChange: function (value, where) {
                            app.sm.log = value;
                        }
                    },
                    theme_select: {
                        tag: 'select[tool="theme-select"]',
                        onChange: function (value, where) {
                            (where == 1) // 1 == "ui"
                                && (document.body.className != value)
                                && (document.body.className = value);
                        }
                    }
                },
                list: json
            });
            updateViewBox(electron_1.ipcRenderer.sendSync('get-win-size', ''));
            app.board.appendChild(app.winProps.win);
            app.board.appendChild(app.rightClick.win);
            app.svgBoard.append(app.dash.g);
            app.svgBoard.append(app.selection.g);
            app.svgBoard.append(app.tooltip.g);
            app.svgBoard.append(app.highlight.g);
            utils_1.qS('body>footer').insertAdjacentElement("afterend", app.dialog.win);
            //experimental
            //app.svgBoard.append(ecCircles.g);
            hookEvents();
            //register states
            registerBoardState();
            registerEcBodyState();
            registerEcDragState();
            registerEcNodeState();
            registerNewWireFromEcState();
            registerWireLineState();
            registerWireNodeDragState();
            registerWireLineDragState();
            app.sm.enabled = true;
            //////////////////// TESTINGS /////////////////
            //(<any>window).win = app.winProps;
            //(<any>window).combo = app.prop("comp_option");
            window.tooltip = app.tooltip;
            window.rc = app.rightClick;
            window.Rect = rect_1.default;
            window.MyApp = app;
            window.dialog = app.dialog;
            console.log("We are using Node.js " + process.versions.node + ", Chromium " + process.versions.chrome + ", and Electron " + process.versions.electron);
            return [2 /*return*/];
        });
    }); })
        .catch(function (ex) {
        console.log(ex);
    });
});
function getUIZoom() {
    var zoom_item = utils_1.qS('.bar-item[data-scale].selected'), o = dab_1.attr(zoom_item, "data-scale"), m = parseFloat(o);
    return m;
}
function updateViewBox(arg) {
    utils_1.qS("body").style.height = arg.height + "px";
    var mainHeight = utils_1.qS("body").offsetHeight - utils_1.qS("body>header").offsetHeight - utils_1.qS("body>footer").offsetHeight;
    utils_1.qS("body>main").style.height = mainHeight + "px";
    app.board.style.height = mainHeight + "px";
    app.size = new size_1.default(arg.width, arg.height);
    app.contentHeight = mainHeight;
    app.setBoardZoom(getUIZoom(), false);
}
//[Obsolete]
electron_1.ipcRenderer.on('fileData', function (event, data) {
    xml2js.parseString(data, { trim: true }, function (err, result) {
        if (err)
            console.log(err);
        else
            console.log(result);
    });
    //console.log('file content:', data)
});
electron_1.ipcRenderer.on("check-before-exit", function (event, arg) {
    if (app.dialog.visible
        || app.circuit.circuitLoadingOrSaving)
        return;
    app.circuit.save(true)
        .then(function (choice) {
        if (choice != 1) // Cancel
            electron_1.ipcRenderer.send('app-quit', '');
    });
});
//this's a proof of concept of how to communicate with main process, the recommended NEW way...
//	function updateViewBox(arg: any) built this way
electron_1.ipcRenderer.on("win-resize", function (event, arg) {
    updateViewBox(arg);
});
console.log(electron_1.ipcRenderer.sendSync('synchronous-message', 'ping')); // prints "pong"
electron_1.ipcRenderer.on('asynchronous-reply', function (event, arg) {
    console.log(arg); // prints "pong"
});
electron_1.ipcRenderer.send('asynchronous-message', 'ping');
//remote.getGlobal('sharedObj')	will be deprecated soon
//https://www.electronjs.org/docs/tutorial/security
/*
let
                a = await ipcRenderer.invoke('shared', 'app');
            console.log("global.app =", a);

            console.log("global.app.circuit.modified =",
                await ipcRenderer.invoke('shared-data', ['app.circuit.modified']));

            console.log("global.app.circuit.modified = true; =>",
                await ipcRenderer.invoke('shared-data', ['app.circuit.modified', true]));

            console.log("global.app.circuit.modified =",
                await ipcRenderer.invoke('shared-data', ['app.circuit.modified']));

                */ 
//# sourceMappingURL=index.js.map