
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

	public state(name: string): IMachineState {
		return <any>this.settings.states.get(name)
	}

	/*public stateBy(id: number): IMachineState {
		return <any>Object.keys(this.settings.states).find((key: string) => this.settings.states.get(key)?.id == id)
	}*/

	constructor(options: IStateMachineOptions) {
		this.settings = obj(<IStateMachineSettings>{
			id: options.id,
			initial: <StateType><unknown>StateType[options.initial],
			value: options.initial,		//options.value is discarded
			ctx: options.ctx || {},
			enabled: false,
			states: new Map()
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
		})
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
			fn: Function | undefined;
		//check action.OVER and overType
		if (action == ActionType.OVER) {
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
					fn = <any>this.settings.commonActions.get("FORWARD_OVER");
					break;
				case "function":
					//call function if provided
					fn = (<any>current.actions)[actionName];
					break;
			}
		} else {
			//get ON action first for current state
			// if not try to get common action
			// fall back to default action if available
			fn = (<any>current.actions)[actionName]
				|| this.settings.commonActions.get(actionName)
				|| (<any>current.actions).DEFAULT;
		}
		if (!fn)
			return false;
		//execute action
		fn.call(this, data);	//, this.machine.context, data
		return true;
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
			actions: state.actions //extend({ on: {}, transitions: {} }, state.state) //state.state
		}));
		return true;
	}
}