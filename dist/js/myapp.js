"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MyApp = void 0;
var tslib_1 = require("tslib");
var electron_1 = require("electron");
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
var context_window_1 = require("./context-window");
var types_1 = require("./types");
var linealign_1 = require("./linealign");
var highlightNode_1 = require("./highlightNode");
var selection_rect_1 = require("./selection-rect");
var circuit_1 = require("./circuit");
var dialog_windows_1 = require("./dialog-windows");
var MyApp = /** @class */ (function (_super) {
    tslib_1.__extends(MyApp, _super);
    function MyApp(options) {
        var _a;
        var _this = _super.call(this, options) || this;
        _this.tooltipFontSize = function () { return Math.max(10, 35 * _this.circuit.zoom); };
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
            return point_1.default.plus(new point_1.default(_this.viewBox.x, _this.viewBox.y), point_1.default.times(clientXY, that.ratioX, that.ratioY)
                .round());
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
                it: that.circuit.get(parent.id)
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
            //arr.push(`zoom: ${that.zoom}`);
            arr.push("state: " + interfaces_1.StateType[that.sm.state]);
            arr.push(state.offset.toString()); //`x: ${round(state.offset.x, 1)} y: ${round(state.offset.y, 1)}`
            //arr.push(`client ${clientXY.toString()}`);
            //arr.push(`scaled: x: ${clientXYScaled.x} y: ${clientXYScaled.y}`);
            //render
            that.bottomBarLeft.innerHTML = arr.join(", ");
            return state;
        };
        _this.viewBox = rect_1.default.empty(); //location is panning, size is for scaling
        _this.ratio = window.screen.width / window.screen.height; //this's a const value
        _this.ratioX = 1;
        _this.ratioY = 1;
        _this.tooltip = new tooltip_1.default({ id: "tooltip", borderRadius: 4 });
        _this.rootDir = utils_1.basePath(); //not used in electron
        _this.board = utils_1.qS("#board");
        _this.svgBoard = _this.board.children[0];
        _this.bottomBarLeft = utils_1.qS('[bar="bottom-left"]');
        _this.bottomBarCenter = utils_1.qS('[bar="bottom-center"]');
        _this.circuitName = utils_1.qS('footer [circuit="name"]');
        _this.dash = new linealign_1.default(_this);
        _this.highlight = new highlightNode_1.default({});
        _this.selection = new selection_rect_1.SelectionRect(_this);
        _this.dialog = new dialog_windows_1.DialogWindow({
            app: _this,
            id: "win-dialog",
        });
        _this.form = new dialog_windows_1.FormWindow({
            app: _this,
            id: "win-form",
        });
        _this.circuit = new circuit_1.Circuit({ name: "new circuit", zoom: _this.getUIZoom() }); //scaling multipler 2X UI default
        _this.updateCircuitLabel();
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
            content: "Aaaaa...!  lorep itsum.... whatever"
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
                    //that.sm.ctx = newCtx;		//save data
                },
                LEAVE: function (newCtx) {
                    //cannot save new context, erases wiring status
                    hideNodeTooltip(newCtx);
                    that.bottomBarLeft.innerHTML = "&nbsp;";
                },
                KEY: function (code) {
                    //console.log(`KEY: ${code}`);
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
        dab_1.aEL(_this.svgBoard, "mouseenter", function (ev) { return that.sm.send(interfaces_1.ActionType.ENTER, handleMouseEvent.call(that, ev)); }, false);
        dab_1.aEL(_this.svgBoard, "mouseleave", function (ev) { return that.sm.send(interfaces_1.ActionType.LEAVE, handleMouseEvent.call(that, ev)); }, false);
        dab_1.aEL(_this.svgBoard, "mouseover", function (ev) { return that.sm.send(interfaces_1.ActionType.OVER, handleMouseEvent.call(that, ev)); }, false);
        dab_1.aEL(_this.svgBoard, "mousemove", function (ev) { return that.sm.send(interfaces_1.ActionType.MOVE, handleMouseEvent.call(that, ev)); }, false);
        dab_1.aEL(_this.svgBoard, "mouseout", function (ev) { return that.sm.send(interfaces_1.ActionType.OUT, handleMouseEvent.call(that, ev)); }, false);
        //
        dab_1.aEL(_this.svgBoard, "mousedown", function (ev) { return that.sm.send(interfaces_1.ActionType.DOWN, handleMouseEvent.call(that, ev)); }, false);
        dab_1.aEL(_this.svgBoard, "mouseup", function (ev) { return that.sm.send(interfaces_1.ActionType.UP, handleMouseEvent.call(that, ev)); }, false);
        //right click on board
        dab_1.aEL(_this.svgBoard, "contextmenu", function (ev) {
            ev.stopPropagation();
            var target = ev.target, parent = target.parentNode, id = dab_1.attr(parent, "id"), compName = dab_1.attr(parent, "svg-comp"), type = dab_1.attr(target, "svg-type"), nodeOrLine = parseInt(dab_1.attr(target, type)), key = void 0, clientXY = getClientXY(ev), comp = void 0;
            //test for highlightNode
            (compName == "h-node") &&
                (id = that.highlight.selectedId,
                    comp = that.circuit.get(id),
                    compName = comp.type == types_1.Type.WIRE ? "wire" : "ec",
                    (nodeOrLine != that.highlight.selectedNode
                    //&& console.log(`node: ${nodeOrLine} <> ${that.highlight.selectedNode}`)
                    ));
            key = that.rightClick.setTrigger(id, compName, type, isNaN(nodeOrLine) ? undefined : nodeOrLine);
            key &&
                that.rightClick
                    .build(key, that.sm.state, getOffset(clientXY))
                    .movePoint(clientXY)
                    .setVisible(true);
        }, false);
        document.addEventListener("keydown", function (ev) {
            //https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/code
            if (that.dialog.visible)
                return;
            var keyCode = ev.code;
            switch (ev.code) {
                case 'Enter':
                case 'Escape':
                case 'Space':
                case 'Delete':
                //
                case 'ArrowLeft':
                case 'ArrowUp':
                case 'ArrowRight':
                case 'ArrowDown':
                //case 'ControlLeft':
                //case 'ControlRight':
                case 'F1':
                    break;
                case 'KeyA': // CtrlKeyA		select all ECs
                case 'KeyC': // CtrlKeyC		copy selected ECs
                case 'KeyV': // CtrlKeyV		paste cloned selected ECs
                //case 'KeyX':	// CtrlKeyX		cut selected ECs - see if it makes sense
                case 'KeyS': // CtrlKeyS		saves current circuit
                case 'KeyL': // CtrlKeyL		loads a new circuit
                case 'KeyN': // CtrlKeyN		creates a new circuit
                case 'KeyP': // CtrlKeyP		prints current circuit
                case 'KeyZ': // CtrlKeyZ		undo previous command
                case 'KeyY': // CtrlKeyY		redo previous undone command
                case 'KeyH': // CtrlKeyZ		help
                    ev.ctrlKey && (keyCode = "Ctrl" + keyCode); // CtrlKeyA
                    break;
                default:
                    return;
            }
            that.sm.send(interfaces_1.ActionType.KEY, keyCode);
            //console.log(ev.code)
        }, false);
        return _this;
    }
    Object.defineProperty(MyApp.prototype, "tooltipOfs", {
        get: function () { return 15; },
        enumerable: false,
        configurable: true
    });
    MyApp.prototype.insideBoard = function (p) {
        //later include panning
        return p.x > 0 && p.y > 0 && p.x < this.viewBox.width && p.y < this.viewBox.height;
    };
    MyApp.prototype.getUIZoom = function () {
        var zoom_item = utils_1.qS('.bar-item[data-scale].selected'), o = dab_1.attr(zoom_item, "data-scale"), m = parseFloat(o);
        return m;
    };
    MyApp.prototype.setBoardZoom = function (zoom) {
        //remove all selected class, should be one
        utils_1.qSA('.bar-item[data-scale].selected').forEach(function (item) {
            dab_1.removeClass(item, "selected");
        });
        dab_1.addClass(utils_1.qS("[data-scale=\"" + zoom + "\"]"), "selected");
        this.updateViewBox(zoom);
    };
    MyApp.prototype.updateCircuitLabel = function () {
        this.circuitName.innerHTML = dab_1.nano('<span class="{class}">*</span><span>{name}</span>', {
            name: this.circuit.name,
            class: this.circuit.modified ? "" : "hide"
        });
    };
    MyApp.prototype.updateViewBox = function (zoom, x, y) {
        this.baseViewBox = new size_1.default(this.board.clientWidth * this.ratio | 0, this.board.clientHeight * this.ratio | 0);
        //calculate size
        this.viewBox.width = this.baseViewBox.width * zoom | 0;
        this.viewBox.height = this.baseViewBox.height * zoom | 0;
        calculateAndUpdateViewBoxData.call(this, x, y);
    };
    MyApp.prototype.getViewBoxRects = function (r) {
        var _this = this;
        var getRect = function (z, index) { return ({
            zoom: circuit_1.Circuit.zoomFactors[index],
            rect: new rect_1.default(r.x, r.y, _this.baseViewBox.width * z, _this.baseViewBox.height * z)
        }); }, sizes = circuit_1.Circuit.zoomMultipliers.map(getRect)
            .filter(function (o) { return o.rect.contains(r); });
        return sizes.length ? sizes : [getRect(circuit_1.Circuit.zoomMultipliers[0], 0)];
    };
    MyApp.prototype.refreshViewBoxData = function () {
        this.bottomBarCenter.innerHTML = dab_1.nano(this.templates.viewBox01, this.viewBox) + "&nbsp; ";
        //+ nano(this.templates.size01, this.size);
    };
    MyApp.prototype.getAspectRatio = function (width, height) {
        var ratio = width / height;
        return (Math.abs(ratio - 4 / 3) < Math.abs(ratio - 16 / 9)) ? '4:3' : '16:9';
    };
    MyApp.prototype.rotateEC = function (angle) {
        this.rotateComponentBy(angle, this.circuit.ec);
    };
    MyApp.prototype.rotateComponentBy = function (angle, comp) {
        if (!comp || comp.type != types_1.Type.EC)
            return;
        var rotation = comp.rotation;
        (rotation != comp.rotate(comp.rotation + angle).rotation)
            && (this.circuit.modified = true, this.updateCircuitLabel());
        this.refreshRotation(comp);
    };
    MyApp.prototype.refreshRotation = function (ec) {
        var _a;
        var isEC = ec && (ec.type == types_1.Type.EC), rotation = isEC ? ec.rotation : 0;
        this.prop("rot_lbl").value = " " + rotation + "\u00B0";
        isEC && (this.winProps.compId == (ec === null || ec === void 0 ? void 0 : ec.id)) && ((_a = this.winProps.property("rotation")) === null || _a === void 0 ? void 0 : _a.refresh());
    };
    //public execute({ action, trigger, data }: { action: ActionType; trigger: string; data?: any; }) {
    MyApp.prototype.execute = function (action, trigger) {
        var arr = trigger.split('::'), comp = this.circuit.get(arr.shift()), name = arr.shift(), type = arr.shift(), nodeOrLine = parseInt(arr.shift()), data = arr.shift(), compNull = false;
        //this's a temporary fix to make it work
        //	final code will have a centralized action dispatcher
        switch (action) {
            case interfaces_1.ActionType.TOGGLE_SELECT:
                if (!(compNull = !comp) && comp.type == types_1.Type.EC) {
                    this.circuit.toggleSelect(comp);
                    this.refreshRotation(this.circuit.ec);
                    (this.circuit.ec && (this.winProps.load(this.circuit.ec), 1)) || this.winProps.clear();
                    //temporary, for testings...
                    this.circuit.ec && (window.ec = this.circuit.ec);
                }
                break;
            case interfaces_1.ActionType.SELECT:
                if (!(compNull = !comp) && comp.type == types_1.Type.EC) {
                    this.circuit.selectThis(comp);
                    this.refreshRotation(comp);
                    ((action == interfaces_1.ActionType.SELECT) && (this.winProps.load(comp), 1)) || this.winProps.clear();
                    //temporary, for testings...
                    window.ec = this.circuit.ec;
                }
                break;
            case interfaces_1.ActionType.SELECT_ALL:
                this.circuit.selectAll(true);
                this.refreshRotation();
                this.winProps.clear();
                //temporary, for testings...
                window.ec = void 0;
                break;
            case interfaces_1.ActionType.UNSELECT_ALL:
                this.circuit.selectAll(false);
                this.refreshRotation();
                this.winProps.clear();
                //temporary, for testings...
                window.ec = void 0;
                break;
            case interfaces_1.ActionType.DELETE_SELECTED:
                var selectedCount = this.circuit.selectedComponents.length, deletedCount = this.circuit.deleteSelected();
                this.refreshRotation();
                this.winProps.clear().setVisible(false);
                this.tooltip.setVisible(false);
                this.updateCircuitLabel();
                if (selectedCount != deletedCount) {
                    console.log("[" + deletedCount + "] components of [" + selectedCount + "]");
                }
                //temporary, for testings...
                window.ec = void 0;
                break;
            case interfaces_1.ActionType.DELETE:
                //only comp if sent
                if (!(compNull = !comp)) {
                    if (this.circuit.delete(comp)) {
                        this.refreshRotation();
                        this.winProps.clear().setVisible(false);
                        this.tooltip.setVisible(false);
                        this.updateCircuitLabel();
                        this.sm.send(interfaces_1.ActionType.AFTER_DELETE, comp.id);
                    }
                }
                //temporary, for testings...
                window.ec = void 0;
                break;
            case interfaces_1.ActionType.DELETE_THIS_LINE:
                //console.log(`delete line segment: `, trigger);
                if (!(compNull = !comp)) {
                    comp.deleteLine(nodeOrLine);
                    this.winProps.refresh();
                    this.updateCircuitLabel();
                }
                break;
            case interfaces_1.ActionType.DELETE_WIRE_NODE:
                //console.log(`delete wire node: `, trigger);
                if (!(compNull = !comp)) {
                    comp.deleteNode(nodeOrLine);
                    this.winProps.refresh();
                    this.updateCircuitLabel();
                }
                break;
            case interfaces_1.ActionType.SPLIT_THIS_LINE:
                //console.log(`split line segment: `, trigger, this.rightClick.offset);
                if (!(compNull = !comp)) {
                    comp.insertNode(nodeOrLine, this.rightClick.offset);
                    this.winProps.refresh();
                    this.updateCircuitLabel();
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
    MyApp.prototype.addToDOM = function (comp) {
        switch (comp.type) {
            case types_1.Type.EC:
                this.svgBoard.insertBefore(comp.g, this.tooltip.g);
                break;
            case types_1.Type.WIRE:
                this.dash.g.insertAdjacentElement("afterend", comp.g);
                break;
            default:
                return false;
        }
        comp.afterDOMinserted();
        return true;
    };
    MyApp.prototype.saveDialogIfModified = function () {
        var _this = this;
        return this.circuit.modified
            ? this.dialog.showDialog("Confirm", "You have unsaved work!", ["Save", "Cancel", "Don't Save"])
                .then(function (choice) {
                if (choice == 0)
                    return _this.circuit.save(); // Save: 0, Cancel: 1, Error: 5
                else
                    return Promise.resolve(choice);
            })
            : Promise.resolve(3); // Not Modified: 3
    };
    MyApp.prototype.newCircuit = function () {
        var self = this, options = circuit_1.Circuit.circuitProperties(), path = options.find(function (value) { return value.label == "path"; });
        path && (path.visible = false);
        this.circuitLoadingOrSaving = true;
        return this.saveDialogIfModified()
            .then(function (choice) {
            self.updateCircuitLabel();
            if (choice == 0 || choice == 2 || choice == 3) { // Save: 0, Don't Save: 2, Not Modified: 3
                return self.form.showDialog("New Circuit", options)
                    .then(function (choice) {
                    if (choice == 0) {
                        console.log(options);
                        var circuit = new circuit_1.Circuit({
                            name: options[0].value,
                            description: options[1].value,
                            zoom: self.getUIZoom()
                        });
                        //everything OK here
                        self.circuit.destroy();
                        self.circuit = circuit;
                        self.updateViewBox(circuit.zoom, circuit.view.x, circuit.view.y);
                        circuit.modified = false;
                        self.updateCircuitLabel();
                        choice = 4; // Load: 4
                    }
                    self.circuitLoadingOrSaving = false;
                    return Promise.resolve(choice);
                });
            }
            else {
                self.circuitLoadingOrSaving = false;
                return Promise.resolve(choice);
            }
        })
            .catch(function (reason) {
            self.circuitLoadingOrSaving = false;
            console.log('error: ', reason);
            return Promise.resolve(5); // Error: 5
        });
    };
    MyApp.prototype.saveCircuit = function (showDialog) {
        var self = this;
        //here make later a dialogBox with error or something else
        return (showDialog
            ? this.saveDialogIfModified()
            : this.circuit.save())
            .then(function (choice) {
            self.updateCircuitLabel();
            return Promise.resolve(choice);
        });
    };
    MyApp.prototype.loadCircuit = function () {
        var self = this;
        this.circuitLoadingOrSaving = true;
        return this.saveDialogIfModified()
            .then(function (choice) {
            self.updateCircuitLabel();
            if (choice == 0 || choice == 2 || choice == 3) { // Save: 0, Don't Save: 2, Not Modified: 3
                var answer = electron_1.ipcRenderer.sendSync('openFile', "");
                //error treatment
                if (answer.error) {
                    console.log(answer); //later popup with error
                    choice = 5; // Error: 5
                }
                else if (answer.canceled) {
                    console.log(answer);
                    choice = 1; // Cancel: 1
                }
                else if (!answer.data) {
                    console.log(answer); //later popup with error
                    choice = 5; // Error: 5
                }
                else {
                    var circuit = circuit_1.Circuit.load({ filePath: answer.filePath, data: answer.data });
                    //everything OK here
                    self.circuit.destroy();
                    self.circuit = circuit;
                    self.setBoardZoom(circuit.zoom);
                    self.circuit.components
                        .forEach(function (comp) { return self.addToDOM(comp); });
                    self.updateViewBox(circuit.zoom, circuit.view.x, circuit.view.y);
                    circuit.modified = false;
                    self.updateCircuitLabel();
                    choice = 4; // Load: 4
                }
            }
            self.circuitLoadingOrSaving = false;
            return Promise.resolve(choice);
        })
            .catch(function (reason) {
            self.circuitLoadingOrSaving = false;
            console.log('error: ', reason);
            return Promise.resolve(5); // Error: 5
        });
    };
    return MyApp;
}(app_1.Application));
exports.MyApp = MyApp;
function calculateAndUpdateViewBoxData(x, y) {
    var self = this, updateCircuit = false;
    (x != undefined) && (self.viewBox.x = x, updateCircuit = true);
    (y != undefined) && (self.viewBox.y = y, updateCircuit = true);
    //set SVG DOM viewBox attribute
    dab_1.attr(self.svgBoard, { "viewBox": self.viewBox.x + " " + self.viewBox.y + " " + self.viewBox.width + " " + self.viewBox.height });
    //calculate ratio
    self.ratioX = self.viewBox.width / self.svgBoard.clientWidth;
    self.ratioY = self.viewBox.height / self.svgBoard.clientHeight;
    self.center = new point_1.default(Math.round(self.viewBox.x + self.viewBox.width / 2), Math.round(self.viewBox.y + self.viewBox.height / 2));
    self.refreshViewBoxData();
    if (updateCircuit) {
        self.circuit.view = new point_1.default(self.viewBox.x, self.viewBox.y);
        self.circuit.modified = true;
        self.updateCircuitLabel();
    }
}
//# sourceMappingURL=myapp.js.map