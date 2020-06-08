import {
	IStateMachineSettings, IStateMachine, IStateMachineOptions, IMachineState, StateType, ActionType,
	IMachineActionCallback
} from "./interfaces";
import { each } from "./utils";
import { obj } from "./dab";

function sendAction(action: ActionType, newCtx?: any): boolean {
	let
		current: IMachineState = (this as StateMachine).getState(this.stateName),
		actionName = ActionType[action],
		fn: Function | undefined,
		newSendCmd = `  ::${actionName}`;

	//check action.OVER and overType
	if (action == ActionType.OVER) {
		switch (current.overType) {
			case "deny":
				//do nothing ...
				//deny transitions here, by not calling app.state.transition
				//  so DEFAULT action is not called
				//and on all others, accept, this way I can prevent stop dragging while OVER event
				(this as StateMachine).log && console.log(`${newSendCmd} -> deny`);
				return true;
			case "forward":
				//send action.FORWARD_OVER from common actions
				//accepts transitions to new state on mouse OVER
				fn = <any>(this as StateMachine).settings.commonActions.get(actionName = "FORWARD_OVER");
				break;
			case "function":
				//call function if provided
				fn = (<any>current.actions)[actionName];
				break;
		}
	} else {
		fn = (<any>current.actions)[actionName]					// first priority in state[action]
			|| (this as StateMachine).settings.commonActions.get(actionName)		// second priority are common actions to all states
			|| (<any>current.actions)[actionName = "DEFAULT"];	// third priority is stae.DEFAULT action
	}

	if ((this as StateMachine).log && newSendCmd != (this as StateMachine).sendCmd) {	// && actionName != "FORWARD_OVER"
		let
			postSendCmd = `  ::${actionName}`;
		//for ENTER show current state, to visually track who got the action
		(action == ActionType.ENTER) &&
			console.log(`[${(this as StateMachine).stateName}]`);
		console.log(`${(this as StateMachine).sendCmd = newSendCmd}${newSendCmd != postSendCmd ? " -> " + postSendCmd : ""}${fn ? "" : " not found"}`);
	}

	//execute action if found
	return fn?.call(this, newCtx), !!fn;
}

export default class StateMachine implements IStateMachine {

	settings: IStateMachineSettings;
	transitioning: boolean;

	get id(): string { return this.settings.id }

	get initial(): StateType { return this.settings.initial }

	get state(): StateType { return this.settings.state }
	get stateName(): string { return StateType[this.state] }

	get enabled(): boolean { return this.settings.enabled }
	set enabled(value: boolean) { this.settings.enabled = value }

	get data(): any {
		let state = this.getState(this.stateName);
		return state ? state.data : undefined
	}
	set data(value: any) {
		let state = this.getState(this.stateName);
		state && (state.data = value)
	}

	//console logging
	get log(): boolean { return this.settings.log }
	set log(value: boolean) {
		(this.settings.log = !!value)
			&& console.log(`[${this.stateName}]`)	// to visually track who got the action
	}

	//development
	sendCmd: string;

	public getState(name: string): IMachineState {
		return <any>this.settings.stateList.get(name)
	}

	constructor(options: IStateMachineOptions) {
		this.settings = obj(<IStateMachineSettings>{
			id: options.id,
			initial: <StateType><unknown>StateType[options.initial],
			state: options.initial,		//options.value is discarded
			//ctx: options.ctx || {},
			enabled: false,
			stateList: new Map(),
			log: !!options.log || false
		});
		//all defined states
		each(options.states, (value: IMachineState, key: string) => {
			//if not key defined, then get it from key
			!value.key && (value.key = <StateType><unknown>StateType[<any>key]);
			//register new state
			this.register(value);
		});
		this.settings.commonActions = new Map();
		//all common actions
		each(options.commonActions, (value: IMachineActionCallback, key: string) => {
			this.settings.commonActions.set(key, value)
		});
		this.sendCmd = "";
		this.log && console.log(`[${this.stateName}]`);
		this.transitioning = false;
	}

	/**
	 * @description executes and action on the current state
	 * @param action action to be executed
	 * @param data data to be sent
	 */
	public send(action: ActionType, newCtx?: any): boolean {
		if (this.transitioning) {
			console.log(`action: ${ActionType[action]} discarded while transitioning to a new state`);
			//return false;
		}
		return sendAction.call(this, action, newCtx);
	}

	/**
	 * @description transition to a new state and executes and action on that new state
	 * @param state new state to go to
	 * @param action action to be executed on the new state
	 * @param data data to sent to new action
	 */
	public transition(state: StateType, action: ActionType, newCtx?: any, data?: any): boolean {
		this.transitioning = true;
		let
			stateName = StateType[state];
		//https://kentcdodds.com/blog/implementing-a-simple-state-machine-library-in-javascript
		const newStateDef: IMachineState = this.getState(stateName);
		if (!newStateDef || !this.enabled)
			return false;
		this.log
			//&& !(action == ActionType.FORWARD_OVER)
			&& console.log(`[${stateName}]${this.state == state ? " same state" : ""}`);
		//save new state to receive SEND commands
		this.settings.state = state;
		//persists data between state transitions
		if (data == undefined)
			!newStateDef.persistData && (this.data != undefined) && (this.data = undefined);
		else
			//overrides state persistData
			this.data = data;
		let
			result = <boolean>sendAction.call(this, action, newCtx);
		//action executed already
		this.transitioning = false;
		return result;
	}

	/**
	 * @description register a new state
	 * @param state new state data
	 */
	public register(state: IMachineState): boolean {
		//find it by name
		let
			key = StateType[<StateType>state?.key];
		if (!state || this.getState(key))
			return false;
		//initial state value
		!state.data && (state.data = undefined);
		//save
		this.settings.stateList.set(key, state);
		/*this.settings.states.set(key, obj(<IMachineState>{
			key: state.key,
			overType: state.overType,
			actions: state.actions
		}));*/
		return true
	}
}