import { IMyApp, ActionType, StateType } from "./interfaces";
import { Type } from "./types";
import EC from "./ec";
import Wire from "./wire";

class ActionManager {

	private constructor(public app: IMyApp) {
	}

	public static create(app: IMyApp): ActionManager {
		if (manager)
			throw `cannot create duplicated manager`;
		return manager = new ActionManager(app);
	}

	public static get $(): ActionManager {
		return manager;
	}
	
	public transition(state: StateType, action: ActionType, newCtx?: any, data?: any): boolean {
		return this.app.sm.transition(state, action, newCtx, data);
	}

	public execute(action: ActionType, trigger: string) {
		let
			arr = trigger.split('::'),
			comp = this.app.circuit.get(<string>arr.shift()),
			name = arr.shift(),
			type = arr.shift(),
			nodeOrLine = parseInt(<any>arr.shift()),
			data = arr.shift(),
			compNull = false;
		//this's a temporary fix to make it work
		//	final code will have a centralized action dispatcher
		switch (action) {
			case ActionType.TOGGLE_SELECT:
				if (!(compNull = !comp) && comp.type == Type.EC) {
					this.app.circuit.toggleSelect(comp as EC);
					this.app.refreshRotation(this.app.circuit.ec);
					(this.app.circuit.ec && (this.app.winProps.load(this.app.circuit.ec), 1)) || this.app.winProps.clear();
					//temporary, for testings...
					this.app.circuit.ec && ((<any>window).ec = this.app.circuit.ec);
				}
				break;
			case ActionType.SELECT:
				if (!(compNull = !comp) && comp.type == Type.EC) {
					this.app.circuit.selectThis(comp as EC);
					this.app.refreshRotation(comp);
					((action == ActionType.SELECT) && (this.app.winProps.load(comp), 1)) || this.app.winProps.clear();
					//temporary, for testings...
					(<any>window).ec = this.app.circuit.ec;
				}
				break;
			case ActionType.SELECT_ALL:
				this.app.circuit.selectAll(true);
				this.app.refreshRotation();
				this.app.winProps.clear();
				//temporary, for testings...
				(<any>window).ec = void 0;
				break;
			case ActionType.UNSELECT_ALL:
				this.app.circuit.selectAll(false);
				this.app.refreshRotation();
				this.app.winProps.clear();
				//temporary, for testings...
				(<any>window).ec = void 0;
				break;
			case ActionType.DELETE_SELECTED:
				let
					selectedCount = this.app.circuit.selectedComponents.length,
					deletedCount = this.app.circuit.deleteSelected();
				this.app.refreshRotation();
				this.app.winProps.clear().setVisible(false);
				this.app.tooltip.setVisible(false);
				this.app.updateCircuitLabel();
				if (selectedCount != deletedCount) {
					console.log(`[${deletedCount}] components of [${selectedCount}]`)
				}
				//temporary, for testings...
				(<any>window).ec = void 0;
				break;
			case ActionType.DELETE:
				//only comp if sent
				if (!(compNull = !comp)) {
					if (this.app.circuit.delete(comp)) {
						this.app.refreshRotation();
						this.app.winProps.clear().setVisible(false);
						this.app.tooltip.setVisible(false);
						this.app.updateCircuitLabel();
						this.app.sm.send(ActionType.AFTER_DELETE, comp.id);
					}
				}
				//temporary, for testings...
				(<any>window).ec = void 0;
				break;
			case ActionType.DELETE_THIS_LINE:
				//console.log(`delete line segment: `, trigger);
				if (!(compNull = !comp)) {
					(comp as Wire).deleteLine(nodeOrLine);
					this.app.winProps.refresh();
					this.app.updateCircuitLabel();
				}
				break;
			case ActionType.DELETE_WIRE_NODE:
				//console.log(`delete wire node: `, trigger);
				if (!(compNull = !comp)) {
					(comp as Wire).deleteNode(nodeOrLine);
					this.app.winProps.refresh();
					this.app.updateCircuitLabel();
				}
				break;
			case ActionType.SPLIT_THIS_LINE:
				//console.log(`split line segment: `, trigger, this.rightClick.offset);
				if (!(compNull = !comp)) {
					(comp as Wire).insertNode(nodeOrLine, this.app.rightClick.offset);
					this.app.winProps.refresh();
					this.app.updateCircuitLabel();
				}
				break;
			case ActionType.SHOW_PROPERTIES:
				!(compNull = !comp) && this.app.winProps.load(comp);
				break;
			case ActionType.ROTATE_45_CLOCKWISE:
			case ActionType.ROTATE_45_COUNTER_CLOCKWISE:
			case ActionType.ROTATE_90_CLOCKWISE:
			case ActionType.ROTATE_90_COUNTER_CLOCKWISE:
				!(compNull = !comp) && data && this.app.rotateComponentBy(<any>data | 0, comp);
				break;
		}
		//logs
		if (compNull) {
			console.log(`invalid trigger: ${trigger}`);
		} else {
			//console.log(`action: ${action}, id: ${comp?.id}, name: ${name}, type: ${type}, trigger: ${trigger}`);
		}
	}

}
var
	manager: ActionManager = <any>void 0;

export default ActionManager;