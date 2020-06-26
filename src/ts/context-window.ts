import {
	IContextMenuOptions, IContextMenuItem, IContextMenuSettings, ActionType, StateType, IBoardWindowOptions
} from "./interfaces";
import { each } from "./utils";
import { aEL, getParentAttr, attr, extend, clone } from "./dab";
import Point from "./point";
import BoardWindow from "./board-window";
import { Templates } from "./templates";
import ActionManager from "./action-manager";

export default class ContextWindow extends BoardWindow {

	protected settings: IContextMenuSettings;
	//client x,y where mouse right-click
	get offset(): Point { return this.settings.offset }

	constructor(options: IContextMenuOptions) {
		super(options);
		this.settings.list = new Map();
		each(options.list, (block: IContextMenuItem[], key: string) => {
			block.forEach(b => {
				b.action = ActionType[b.name];
				b.enabled &&
					(b.enabled = b.enabled.map((stateName: any): StateType => StateType[<string>stateName]))
			})
			this.settings.list.set(key, block);
		});
		this.settings.current = "board";
		this.settings.offset = Point.origin;
		let
			that = this as BoardWindow;
		//register global click event
		aEL(this.win, "click", (e: MouseEvent) => {
			let
				self = getParentAttr(e.target as HTMLElement, "data-action"),
				action = attr(self, "data-action") | 0,
				data = attr(self, "data-data"),
				disabled = self.hasAttribute("disabled"),
				trigger = attr(self.parentElement, "data-trigger");
			self
				&& !disabled
				&& (that.setVisible(false),
					data && (trigger += `::${data}`),
					ActionManager.$.execute(action, trigger)
				)
		}, false)
	}

	public onMouseEnter(e: MouseEvent) {
		//console.log('IN context window', e.eventPhase, (e.target as HTMLElement).id);
		//return false;
	}

	public onMouseLeave(e: MouseEvent) {
		ActionManager.$.transition(StateType.BOARD, ActionType.RESUME);
	}

	public setVisible(value: boolean): ContextWindow {
		return (!super.setVisible(value).visible && this.win.setAttribute("data-trigger", "")), this
	}

	/**
	 * @description store data trigger and returns the context key, must be called this.build after
	 * @param comp component name
	 * @param type component child type
	 * @returns {string} context key
	 */
	public setTrigger(id: string, name: string, type: string, nodeOrLine: number): string {
		let
			ctx;
		switch (type) {
			case "node":
				//case "node-x":
				//name: "h-node", it can be a Wire-node or an EC-node
				ctx = ((name == "wire") ? "wire-" : "ec-") + type;
				break;
			case "board":
				ctx = type;
				break;
			case "body":
				ctx = "ec-" + type;			//comp == 'gate', 'dip'
				break;
			case "line":
				ctx = "wire-" + type;
				break;
			default:
				//if id && comp has a value, then type is "body"
				if (id && name) {
					ctx = "ec-" + (type = "body");
				} else
					return <any>void 0;
		}
		//let a = [id, name, type, nodeOrLine];//.filter(v => v != null);
		return this.win.setAttribute("data-trigger", `${[id, name, type, nodeOrLine].join('::')}`), ctx
	}

	public build(key: string, state: StateType, offset: Point): ContextWindow {
		let
			entry = this.settings.list.get(key);
		if (entry) {
			this.settings.current = key;
			this.clear();
			this.win.innerHTML = entry.map(value => {
				let
					o = clone<IContextMenuItem>(value);
				(value.enabled && !value.enabled.some(i => i == state)) && (o.disabled = "disabled");
				return Templates.nano('ctxItem01', o)
			}
			).join('');
			this.settings.offset = offset;
		} else
			this.settings.offset = Point.origin;
		return this;
	}

	public propertyDefaults(): IBoardWindowOptions {
		return extend(super.propertyDefaults(), {
			class: "win ctx",
			ignoreHeight: true,
			templateName: "ctxWin01"
		})
	}
}