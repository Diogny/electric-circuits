"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var interfaces_1 = require("./interfaces");
var types_1 = require("./types");
var ActionManager = /** @class */ (function () {
    function ActionManager(app) {
        this.app = app;
    }
    ActionManager.create = function (app) {
        if (manager)
            throw "cannot create duplicated manager";
        return manager = new ActionManager(app);
    };
    Object.defineProperty(ActionManager, "$", {
        get: function () {
            return manager;
        },
        enumerable: false,
        configurable: true
    });
    ActionManager.prototype.transition = function (state, action, newCtx, data) {
        return this.app.sm.transition(state, action, newCtx, data);
    };
    ActionManager.prototype.execute = function (action, trigger) {
        var arr = trigger.split('::'), comp = this.app.circuit.get(arr.shift()), name = arr.shift(), type = arr.shift(), nodeOrLine = parseInt(arr.shift()), data = arr.shift(), compNull = false;
        //this's a temporary fix to make it work
        //	final code will have a centralized action dispatcher
        switch (action) {
            case interfaces_1.ActionType.TOGGLE_SELECT:
                if (!(compNull = !comp) && comp.type == types_1.Type.EC) {
                    this.app.circuit.toggleSelect(comp);
                    this.app.refreshRotation(this.app.circuit.ec);
                    (this.app.circuit.ec && (this.app.winProps.load(this.app.circuit.ec), 1)) || this.app.winProps.clear();
                    //temporary, for testings...
                    this.app.circuit.ec && (window.ec = this.app.circuit.ec);
                }
                break;
            case interfaces_1.ActionType.SELECT:
                if (!(compNull = !comp) && comp.type == types_1.Type.EC) {
                    this.app.circuit.selectThis(comp);
                    this.app.refreshRotation(comp);
                    ((action == interfaces_1.ActionType.SELECT) && (this.app.winProps.load(comp), 1)) || this.app.winProps.clear();
                    //temporary, for testings...
                    window.ec = this.app.circuit.ec;
                }
                break;
            case interfaces_1.ActionType.SELECT_ALL:
                this.app.circuit.selectAll(true);
                this.app.refreshRotation();
                this.app.winProps.clear();
                //temporary, for testings...
                window.ec = void 0;
                break;
            case interfaces_1.ActionType.UNSELECT_ALL:
                this.app.circuit.selectAll(false);
                this.app.refreshRotation();
                this.app.winProps.clear();
                //temporary, for testings...
                window.ec = void 0;
                break;
            case interfaces_1.ActionType.DELETE_SELECTED:
                var selectedCount = this.app.circuit.selectedComponents.length, deletedCount = this.app.circuit.deleteSelected();
                this.app.refreshRotation();
                this.app.winProps.clear().setVisible(false);
                this.app.tooltip.setVisible(false);
                this.app.updateCircuitLabel();
                if (selectedCount != deletedCount) {
                    console.log("[" + deletedCount + "] components of [" + selectedCount + "]");
                }
                //temporary, for testings...
                window.ec = void 0;
                break;
            case interfaces_1.ActionType.DELETE:
                //only comp if sent
                if (!(compNull = !comp)) {
                    if (this.app.circuit.delete(comp)) {
                        this.app.refreshRotation();
                        this.app.winProps.clear().setVisible(false);
                        this.app.tooltip.setVisible(false);
                        this.app.updateCircuitLabel();
                        this.app.sm.send(interfaces_1.ActionType.AFTER_DELETE, comp.id);
                    }
                }
                //temporary, for testings...
                window.ec = void 0;
                break;
            case interfaces_1.ActionType.DELETE_THIS_LINE:
                //console.log(`delete line segment: `, trigger);
                if (!(compNull = !comp)) {
                    comp.deleteLine(nodeOrLine);
                    this.app.winProps.refresh();
                    this.app.updateCircuitLabel();
                }
                break;
            case interfaces_1.ActionType.DELETE_WIRE_NODE:
                //console.log(`delete wire node: `, trigger);
                if (!(compNull = !comp)) {
                    comp.deleteNode(nodeOrLine);
                    this.app.winProps.refresh();
                    this.app.updateCircuitLabel();
                }
                break;
            case interfaces_1.ActionType.SPLIT_THIS_LINE:
                //console.log(`split line segment: `, trigger, this.rightClick.offset);
                if (!(compNull = !comp)) {
                    comp.insertNode(nodeOrLine, this.app.rightClick.offset);
                    this.app.winProps.refresh();
                    this.app.updateCircuitLabel();
                }
                break;
            case interfaces_1.ActionType.SHOW_PROPERTIES:
                !(compNull = !comp) && this.app.winProps.load(comp);
                break;
            case interfaces_1.ActionType.ROTATE_45_CLOCKWISE:
            case interfaces_1.ActionType.ROTATE_45_COUNTER_CLOCKWISE:
            case interfaces_1.ActionType.ROTATE_90_CLOCKWISE:
            case interfaces_1.ActionType.ROTATE_90_COUNTER_CLOCKWISE:
                !(compNull = !comp) && data && this.app.rotateComponentBy(data | 0, comp);
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
    return ActionManager;
}());
var manager = void 0;
exports.default = ActionManager;
//# sourceMappingURL=action-manager.js.map