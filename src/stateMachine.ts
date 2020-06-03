
import {
	IStateMachineSettings, IStateMachine, IStateMachineOptions, IMachineState, StateType, ActionType,
	IMachineActionCallback, IMouseState
} from "./interfaces";
import { each } from "./utils";
import { obj } from "./dab";

export default class StateMachine implements IStateMachine {

	private settings: IStateMachineSettings;

	get id(): string { return this.settings.id }

	get value(): StateType { return this.settings.value }

	get initial(): StateType { return this.settings.initial }

	get ctx(): IMouseState { return this.settings.ctx }

	set ctx(value: IMouseState) { this.settings.ctx = value }

	get enabled(): boolean { return this.settings.enabled }

	set enabled(value: boolean) { this.settings.enabled = value }

	//console logging
	get log(): boolean { return this.settings.log }
	set log(value: boolean) {
		(this.settings.log = !!value)
			&& console.log(`[${StateType[this.value]}]`)	// to visually track who got the action
	}

	//development
	private sendCmd: string;

	public state(name: string): IMachineState {
		return <any>this.settings.states.get(name)
	}

	constructor(options: IStateMachineOptions) {
		this.settings = obj(<IStateMachineSettings>{
			id: options.id,
			initial: <StateType><unknown>StateType[options.initial],
			value: options.initial,		//options.value is discarded
			ctx: options.ctx || {},
			enabled: false,
			states: new Map(),
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
		this.log && console.log(`[${StateType[this.value]}]`);
	}

	/**
	 * @description executes and action on the current state
	 * @param action action to be executed
	 * @param data data to be sent
	 */
	public send(action: ActionType, data?: any): boolean {
		const current: IMachineState = this.state(StateType[this.value]);
		if (!current)
			return false;
		let
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
					this.log && console.log(`${newSendCmd} -> deny`);
					return true;
				case "forward":
					//send action.FORWARD_OVER from common actions
					//accepts transitions to new state on mouse OVER
					fn = <any>this.settings.commonActions.get(actionName = "FORWARD_OVER");
					break;
				case "function":
					//call function if provided
					fn = (<any>current.actions)[actionName];
					break;
			}
		} else {
			fn = (<any>current.actions)[actionName]					// first priority in state[action]
				|| this.settings.commonActions.get(actionName)		// second priority are common actions to all states
				|| (<any>current.actions)[actionName = "DEFAULT"];	// third priority is stae.DEFAULT action
		}

		if (this.log && newSendCmd != this.sendCmd) {
			let
				postSendCmd = `  ::${actionName}`;
			//for ENTER show current state, to visually track who got the action
			(action == ActionType.ENTER) &&
				console.log(`[${StateType[this.value]}]`);
			console.log(`${this.sendCmd = newSendCmd}${newSendCmd != postSendCmd ? " -> " + postSendCmd : ""}${fn ? "" : " not found"}`);
		}

		//execute action if found
		return fn?.call(this, data), !!fn;
	}

	/**
	 * @description transition to a new state and executes and action on that new state
	 * @param state new state to go to
	 * @param action action to be executed on the new state
	 * @param data data to sent to new action
	 */
	public transition(state: StateType, action: ActionType, data?: any): boolean {
		let
			stateName = StateType[state];
		//https://kentcdodds.com/blog/implementing-a-simple-state-machine-library-in-javascript
		const newStateDef: IMachineState = this.state(stateName);
		if (!newStateDef)
			return false;
		this.log && console.log(`[${stateName}]${this.value == state ? " same state" : ""}`);
		//save new state to receive SEND commands
		this.settings.value = state;
		//
		return this.send(action, data);
	}

	/**
	 * @description register a new state
	 * @param state new state data
	 */
	public register(state: IMachineState): boolean {
		//find it by name
		let
			key = StateType[<StateType>state?.key];
		if (!state || this.state(key))
			return false;
		//save state actions
		this.settings.states.set(key, obj(<IMachineState>{
			key: state.key,
			overType: state.overType,
			actions: state.actions
		}));
		return true
	}
}