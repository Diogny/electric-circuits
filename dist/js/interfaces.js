"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DialogType = exports.ActionType = exports.StateType = void 0;
var StateType;
(function (StateType) {
    StateType[StateType["WINDOW"] = 1] = "WINDOW";
    StateType[StateType["DEFAULT"] = 2] = "DEFAULT";
    StateType[StateType["BOARD"] = 3] = "BOARD";
    StateType[StateType["EC_NODE"] = 4] = "EC_NODE";
    StateType[StateType["EC_DRAG"] = 5] = "EC_DRAG";
    StateType[StateType["EC_BODY"] = 6] = "EC_BODY";
    StateType[StateType["WIRE_NODE"] = 7] = "WIRE_NODE";
    StateType[StateType["WIRE_NODE_DRAG"] = 8] = "WIRE_NODE_DRAG";
    StateType[StateType["WIRE_LINE"] = 9] = "WIRE_LINE";
    StateType[StateType["WIRE_LINE_DRAG"] = 10] = "WIRE_LINE_DRAG";
    StateType[StateType["NEW_WIRE_FROM_EC"] = 11] = "NEW_WIRE_FROM_EC";
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
    //jump to leave space for basic actions
    ActionType[ActionType["START"] = 14] = "START";
    ActionType[ActionType["RESUME"] = 15] = "RESUME";
    ActionType[ActionType["STOP"] = 16] = "STOP";
    ActionType[ActionType["HIDE_NODE"] = 17] = "HIDE_NODE";
    ActionType[ActionType["FORWARD_OVER"] = 18] = "FORWARD_OVER";
    ActionType[ActionType["KEY"] = 40] = "KEY";
    //unified actions
    ActionType[ActionType["SELECT"] = 100] = "SELECT";
    //SELECT_ONLY = 101,
    ActionType[ActionType["TOGGLE_SELECT"] = 102] = "TOGGLE_SELECT";
    ActionType[ActionType["SELECT_ALL"] = 103] = "SELECT_ALL";
    ActionType[ActionType["UNSELECT_ALL"] = 104] = "UNSELECT_ALL";
    ActionType[ActionType["DELETE"] = 110] = "DELETE";
    ActionType[ActionType["DELETE_SELECTED"] = 111] = "DELETE_SELECTED";
    ActionType[ActionType["DELETE_ALL"] = 112] = "DELETE_ALL";
    ActionType[ActionType["DELETE_WIRE_NODE"] = 113] = "DELETE_WIRE_NODE";
    ActionType[ActionType["DELETE_THIS_LINE"] = 114] = "DELETE_THIS_LINE";
    ActionType[ActionType["AFTER_DELETE"] = 115] = "AFTER_DELETE";
    ActionType[ActionType["SPLIT_THIS_LINE"] = 120] = "SPLIT_THIS_LINE";
    ActionType[ActionType["SHOW_PROPERTIES"] = 200] = "SHOW_PROPERTIES";
    ActionType[ActionType["BRING_TO_FRONT"] = 201] = "BRING_TO_FRONT";
    ActionType[ActionType["ROTATE_45_CLOCKWISE"] = 202] = "ROTATE_45_CLOCKWISE";
    ActionType[ActionType["ROTATE_45_COUNTER_CLOCKWISE"] = 203] = "ROTATE_45_COUNTER_CLOCKWISE";
    ActionType[ActionType["ROTATE_90_CLOCKWISE"] = 204] = "ROTATE_90_CLOCKWISE";
    ActionType[ActionType["ROTATE_90_COUNTER_CLOCKWISE"] = 205] = "ROTATE_90_COUNTER_CLOCKWISE";
    ActionType[ActionType["UNBOND"] = 206] = "UNBOND";
    ActionType[ActionType["RESUME_EDIT"] = 207] = "RESUME_EDIT";
})(ActionType = exports.ActionType || (exports.ActionType = {}));
//***************************************** Dialog Windows ************************************//
var DialogType;
(function (DialogType) {
    DialogType[DialogType["OK"] = 0] = "OK";
    DialogType[DialogType["Canceled"] = 1] = "Canceled";
    DialogType[DialogType["Error"] = 2] = "Error";
    DialogType[DialogType["Loaded"] = 3] = "Loaded";
    DialogType[DialogType["Saved"] = 4] = "Saved";
})(DialogType = exports.DialogType || (exports.DialogType = {}));
/*

*/ 
//# sourceMappingURL=interfaces.js.map