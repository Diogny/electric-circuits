"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var interfaces_1 = require("./interfaces");
var utils_1 = require("./utils");
var dab_1 = require("./dab");
var StateMachine = /** @class */ (function () {
    /*public stateBy(id: number): IMachineState {
        return <any>Object.keys(this.settings.states).find((key: string) => this.settings.states.get(key)?.id == id)
    }*/
    function StateMachine(options) {
        var _this = this;
        this.settings = dab_1.obj({
            id: options.id,
            initial: interfaces_1.StateType[options.initial],
            value: options.initial,
            ctx: options.ctx || {},
            enabled: false,
            states: new Map()
        });
        //all defined states
        utils_1.each(options.states, function (value, key) {
            //if not key defined, then get it from key
            !value.key && (value.key = interfaces_1.StateType[key]);
            //register new state
            _this.register(value);
        });
        this.settings.commonActions = new Map();
        //all common actions
        utils_1.each(options.commonActions, function (value, key) {
            _this.settings.commonActions.set(key, value);
        });
    }
    Object.defineProperty(StateMachine.prototype, "id", {
        get: function () { return this.settings.id; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(StateMachine.prototype, "value", {
        get: function () { return this.settings.value; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(StateMachine.prototype, "initial", {
        get: function () { return this.settings.initial; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(StateMachine.prototype, "ctx", {
        get: function () { return this.settings.ctx; },
        set: function (value) { this.settings.ctx = value; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(StateMachine.prototype, "enabled", {
        get: function () { return this.settings.enabled; },
        set: function (value) { this.settings.enabled = value; },
        enumerable: false,
        configurable: true
    });
    StateMachine.prototype.state = function (name) {
        return this.settings.states.get(name);
    };
    /**
     * @description executes and action on the current state
     * @param action action to be executed
     * @param data data to be sent
     */
    StateMachine.prototype.send = function (action, data) {
        var current = this.state(interfaces_1.StateType[this.value]);
        if (!current)
            return false;
        var actionName = interfaces_1.ActionType[action], fn;
        //check action.OVER and overType
        if (action == interfaces_1.ActionType.OVER) {
            switch (current.overType) {
                case "deny":
                    //do nothing ...
                    //deny transitions here, by not calling app.state.transition
                    //  so DEFAULT action is not called
                    //and on all others, accept, this way I can prevent stop dragging while OVER event
                    return true;
                case "forward":
                    //send action.FORWARD_OVER from common actions
                    //accepts transitions to new state on mouse OVER
                    fn = this.settings.commonActions.get("FORWARD_OVER");
                    break;
                case "function":
                    //call function if provided
                    fn = current.actions[actionName];
                    break;
            }
        }
        else {
            //get ON action first for current state
            // if not try to get common action
            // fall back to default action if available
            fn = current.actions[actionName]
                || this.settings.commonActions.get(actionName)
                || current.actions.DEFAULT;
        }
        if (!fn)
            return false;
        //execute action
        fn.call(this, data); //, this.machine.context, data
        return true;
    };
    /**
     * @description transition to a new state and executes and action on that new state
     * @param state new state to go to
     * @param action action to be executed on the new state
     * @param data data to sent to new action
     */
    StateMachine.prototype.transition = function (state, action, data) {
        var stateName = interfaces_1.StateType[state];
        //https://kentcdodds.com/blog/implementing-a-simple-state-machine-library-in-javascript
        var newStateDef = this.state(stateName);
        if (!newStateDef)
            return false;
        //save new state to receive SEND commands
        this.settings.value = state;
        //
        return this.send(action, data);
    };
    /**
     * @description register a new state
     * @param state new state data
     */
    StateMachine.prototype.register = function (state) {
        //find it by name
        var key = interfaces_1.StateType[state === null || state === void 0 ? void 0 : state.key];
        if (!state || this.state(key))
            return false;
        //save state actions
        this.settings.states.set(key, dab_1.obj({
            key: state.key,
            overType: state.overType,
            actions: state.actions //extend({ on: {}, transitions: {} }, state.state) //state.state
        }));
        return true;
    };
    return StateMachine;
}());
exports.default = StateMachine;
//# sourceMappingURL=stateMachine.js.map