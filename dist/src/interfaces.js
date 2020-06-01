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
    StateType[StateType["WIRE_EDIT_NODE"] = 9] = "WIRE_EDIT_NODE";
    StateType[StateType["WIRE_EDIT_NODE_DRAG"] = 10] = "WIRE_EDIT_NODE_DRAG";
    StateType[StateType["WIRE_EDIT_LINE_DRAG"] = 11] = "WIRE_EDIT_LINE_DRAG";
    StateType[StateType["WIRE_EDIT_EC"] = 12] = "WIRE_EDIT_EC";
    StateType[StateType["WIRE_EDIT_EC_DRAG"] = 13] = "WIRE_EDIT_EC_DRAG";
})(StateType = exports.StateType || (exports.StateType = {}));
var ActionType;
(function (ActionType) {
    ActionType[ActionType["DEFAULT"] = 1] = "DEFAULT";
    ActionType[ActionType["OVER"] = 2] = "OVER";
    ActionType[ActionType["OUT"] = 3] = "OUT";
    ActionType[ActionType["MOVE"] = 4] = "MOVE";
    ActionType[ActionType["DOWN"] = 5] = "DOWN";
    ActionType[ActionType["UP"] = 6] = "UP";
    ActionType[ActionType["ENTER"] = 7] = "ENTER";
    ActionType[ActionType["LEAVE"] = 8] = "LEAVE";
    ActionType[ActionType["START"] = 14] = "START";
    ActionType[ActionType["RESUME"] = 15] = "RESUME";
    ActionType[ActionType["STOP"] = 16] = "STOP";
    ActionType[ActionType["HIDE_NODE"] = 17] = "HIDE_NODE";
    ActionType[ActionType["SHOW_NODE_TOOLTIP"] = 18] = "SHOW_NODE_TOOLTIP";
    ActionType[ActionType["SHOW_BODY_TOOLTIP"] = 19] = "SHOW_BODY_TOOLTIP";
    ActionType[ActionType["FORWARD_OVER"] = 20] = "FORWARD_OVER";
    //unified actions
    ActionType[ActionType["SELECT"] = 100] = "SELECT";
    ActionType[ActionType["SELECT_ONLY"] = 101] = "SELECT_ONLY";
    ActionType[ActionType["TOGGLE_SELECT"] = 102] = "TOGGLE_SELECT";
    ActionType[ActionType["SELECT_ALL"] = 103] = "SELECT_ALL";
    ActionType[ActionType["UNSELECT_ALL"] = 104] = "UNSELECT_ALL";
    ActionType[ActionType["DELETE"] = 110] = "DELETE";
    ActionType[ActionType["DELETE_SELECTED"] = 111] = "DELETE_SELECTED";
    ActionType[ActionType["DELETE_ALL"] = 112] = "DELETE_ALL";
    ActionType[ActionType["SHOW_PROPERTIES"] = 200] = "SHOW_PROPERTIES";
    ActionType[ActionType["BRING_TO_FRONT"] = 201] = "BRING_TO_FRONT";
    ActionType[ActionType["ROTATE_45_CLOCKWISE"] = 202] = "ROTATE_45_CLOCKWISE";
    ActionType[ActionType["ROTATE_45_COUNTER_CLOCKWISE"] = 203] = "ROTATE_45_COUNTER_CLOCKWISE";
    ActionType[ActionType["ROTATE_90_CLOCKWISE"] = 204] = "ROTATE_90_CLOCKWISE";
    ActionType[ActionType["ROTATE_90_COUNTER_CLOCKWISE"] = 205] = "ROTATE_90_COUNTER_CLOCKWISE";
    ActionType[ActionType["UNBOND"] = 206] = "UNBOND";
    ActionType[ActionType["CONNECTIONS"] = 207] = "CONNECTIONS";
})(ActionType = exports.ActionType || (exports.ActionType = {}));
/*

*/ 
//# sourceMappingURL=interfaces.js.map