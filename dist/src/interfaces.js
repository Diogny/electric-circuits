"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActionType = exports.StateType = void 0;
var StateType;
(function (StateType) {
    StateType[StateType["IDLE"] = 1] = "IDLE";
    StateType[StateType["DEFAULT"] = 2] = "DEFAULT";
    StateType[StateType["BOARD"] = 3] = "BOARD";
    StateType[StateType["EC_NODE"] = 4] = "EC_NODE";
    StateType[StateType["EC_DRAG"] = 5] = "EC_DRAG";
    StateType[StateType["EC_BODY"] = 6] = "EC_BODY";
    StateType[StateType["WIRE_LINE"] = 7] = "WIRE_LINE";
    StateType[StateType["WIRE_EDIT"] = 8] = "WIRE_EDIT";
    StateType[StateType["WIRE_NODE"] = 9] = "WIRE_NODE";
    StateType[StateType["WIRE_NODE_DRAG"] = 10] = "WIRE_NODE_DRAG";
    StateType[StateType["WIRE_LINE_DRAG"] = 11] = "WIRE_LINE_DRAG";
    //BOND_WIRE = 13,					// bond_wire
    //BOND_WIRE_NODE = 14,			// bond_wire_node
    //BOND_WIRE_NODE_DRAG = 15,		// bond_wire_node_dragging
})(StateType = exports.StateType || (exports.StateType = {}));
var ActionType;
(function (ActionType) {
    ActionType[ActionType["DEFAULT"] = 1] = "DEFAULT";
    ActionType[ActionType["OVER"] = 2] = "OVER";
    ActionType[ActionType["OUT"] = 3] = "OUT";
    ActionType[ActionType["MOVE"] = 4] = "MOVE";
    ActionType[ActionType["DOWN"] = 5] = "DOWN";
    ActionType[ActionType["UP"] = 6] = "UP";
    ActionType[ActionType["START"] = 14] = "START";
    ActionType[ActionType["RESUME"] = 15] = "RESUME";
    ActionType[ActionType["STOP"] = 16] = "STOP";
    ActionType[ActionType["HIDE_NODE"] = 17] = "HIDE_NODE";
    ActionType[ActionType["SHOW_NODE_TOOLTIP"] = 18] = "SHOW_NODE_TOOLTIP";
    ActionType[ActionType["SHOW_BODY_TOOLTIP"] = 19] = "SHOW_BODY_TOOLTIP";
    ActionType[ActionType["FORWARD_OVER"] = 20] = "FORWARD_OVER";
    //SELECT_ALL = 21,				//unified actions
    //UNSELECT_ALL = 22,
    //check this one is used
    ActionType[ActionType["AFTER_DRAG"] = 51] = "AFTER_DRAG";
})(ActionType = exports.ActionType || (exports.ActionType = {}));
//# sourceMappingURL=interfaces.js.map