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
    StateType[StateType["WIRING"] = 8] = "WIRING";
    StateType[StateType["WIRING_WIRE_NODE"] = 9] = "WIRING_WIRE_NODE";
    StateType[StateType["WIRING_WIRE_NODE_DRAG"] = 10] = "WIRING_WIRE_NODE_DRAG";
    StateType[StateType["WIRING_LINE_DRAG"] = 11] = "WIRING_LINE_DRAG";
    StateType[StateType["WIRING_EC_BODY"] = 12] = "WIRING_EC_BODY";
    StateType[StateType["WIRING_EC_BODY_DRAG"] = 13] = "WIRING_EC_BODY_DRAG";
    StateType[StateType["WIRING_WIRE_NEW"] = 14] = "WIRING_WIRE_NEW";
    StateType[StateType["WIRING_EC_NODE"] = 15] = "WIRING_EC_NODE";
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
    ActionType[ActionType["KEY"] = 40] = "KEY";
    //unified actions
    ActionType[ActionType["SELECT"] = 100] = "SELECT";
    ActionType[ActionType["SELECT_ONLY"] = 101] = "SELECT_ONLY";
    ActionType[ActionType["TOGGLE_SELECT"] = 102] = "TOGGLE_SELECT";
    ActionType[ActionType["SELECT_ALL"] = 103] = "SELECT_ALL";
    ActionType[ActionType["UNSELECT_ALL"] = 104] = "UNSELECT_ALL";
    ActionType[ActionType["DELETE"] = 110] = "DELETE";
    ActionType[ActionType["DELETE_SELECTED"] = 111] = "DELETE_SELECTED";
    ActionType[ActionType["DELETE_ALL"] = 112] = "DELETE_ALL";
    ActionType[ActionType["AFTER_DELETE"] = 113] = "AFTER_DELETE";
    ActionType[ActionType["SHOW_PROPERTIES"] = 200] = "SHOW_PROPERTIES";
    ActionType[ActionType["BRING_TO_FRONT"] = 201] = "BRING_TO_FRONT";
    ActionType[ActionType["ROTATE_45_CLOCKWISE"] = 202] = "ROTATE_45_CLOCKWISE";
    ActionType[ActionType["ROTATE_45_COUNTER_CLOCKWISE"] = 203] = "ROTATE_45_COUNTER_CLOCKWISE";
    ActionType[ActionType["ROTATE_90_CLOCKWISE"] = 204] = "ROTATE_90_CLOCKWISE";
    ActionType[ActionType["ROTATE_90_COUNTER_CLOCKWISE"] = 205] = "ROTATE_90_COUNTER_CLOCKWISE";
    ActionType[ActionType["UNBOND"] = 206] = "UNBOND";
    ActionType[ActionType["RESUME_EDIT"] = 207] = "RESUME_EDIT";
})(ActionType = exports.ActionType || (exports.ActionType = {}));
/*

*/ 
//# sourceMappingURL=interfaces.js.map