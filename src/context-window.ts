import BaseWindow from "./base-window";
import { IContextMenuOptions, IContextMenuItem, IContextMenuSettings, ActionType } from "./interfaces";
import { each } from "./utils";
import { nano, aEL, getParentAttr, attr } from "./dab";
import Comp from "./components";
import { MyApp } from "./myapp";
import ItemBoard from "./itemsBoard";
import { Type } from "./types";
import EC from "./ec";

export default class ContextWindow extends BaseWindow {

	protected settings: IContextMenuSettings;

	constructor(options: IContextMenuOptions) {
		options.templateName = "ctxWin01";
		//extend with specific class
		options.class = (options.class || "") + " ctx";
		//do not set size.height
		options.ignoreHeight = true;
		super(options);
		//store right click context options
		this.settings.list = new Map();
		each(options.list, (block: IContextMenuItem[], key: string) => {
			//load action numbers
			block.forEach(b => {
				b.action = ActionType[b.name]
			})
			this.settings.list.set(key, block);
		});
		this.settings.current = "board";
		let
			that = this;
		//register global click event
		aEL(this.win, "click", (e: MouseEvent) => {
			let
				self = getParentAttr(e.target as HTMLElement, "data-action"),
				action = attr(self, "data-action") | 0,
				trigger = attr(self.parentElement, "data-trigger")
			self && (that.setVisible(false), this.execute(action, trigger))
		}, false)
	}

	//public execute({ action, trigger, data }: { action: ActionType; trigger: string; data?: any; }) {
	public execute(action: ActionType, trigger: string, data?: any) {
		let
			arr = trigger.split('::'),
			comp = Comp.item(<string>arr.shift()),
			name = arr.shift(),
			type = arr.shift(),
			app = this.app as MyApp,
			compNull = false,
			selectAll = (value: boolean): ItemBoard[] => {
				let
					arr = Array.from(app.compList.values());
				arr.forEach(comp => comp.select(value));
				return arr;
			}
		//this's a temporary fix to make it work
		//	final code will have a centralized action dispatcher
		switch (action) {
			case ActionType.TOGGLE_SELECT:			//"Toggle Select"	6
				if (!(compNull = !comp)) {
					comp.select(!comp.selected);
					app.selectedComponents = Array.from(app.compList.values()).filter(c => c.selected);
					app.refreshRotation();
					(app.ec && (app.winProps.load(app.ec), (<any>window).ec = app.ec, 1)) || app.winProps.clear();
				}
				break;
			case ActionType.SELECT:			//"Select" just ONE		7
				if (!(compNull = !comp)) {
					selectAll(false);
					app.selectedComponents = [comp.select(true)];
					app.refreshRotation();
					app.winProps.load(comp);
					//temporary, for testings...
					(<any>window).ec = app.ec;
				}
				break;
			case ActionType.SELECT_ALL:			//"Select All"		8
				app.selectedComponents = selectAll(true);
				app.refreshRotation();
				app.winProps.clear();
				//temporary, for testings...
				(<any>window).ec = void 0;
				break;
			case ActionType.UNSELECT_ALL:			//"Deselect All"		9
				selectAll(false);
				app.selectedComponents = [];
				app.refreshRotation();
				app.winProps.clear();
				//temporary, for testings...
				(<any>window).ec = void 0;
				break;
			case ActionType.DELETE:		//"Delete"		10
				if (!(compNull = !comp)) {
					//disconnects and remove component from DOM
					comp.disconnect();
					comp.remove();
					app.compList.delete(comp.id);
					app.selectedComponents = Array.from(app.compList.values()).filter(c => c.selected);
					app.refreshRotation();
					(app.winProps.compId == comp.id) && app.winProps.clear();
					app.tooltip.setVisible(false);
					//temporary, for testings...
					(<any>window).ec = void 0;
				}
				break;
			case ActionType.SHOW_PROPERTIES:		//"Properties"		11
				if (!(compNull = !comp)) {
					app.winProps.load(comp);
				}
				break;
		}
		if (compNull) {
			console.log(`invalid trigger: ${trigger}`);
		} else {
			console.log(`action: ${action}, id: ${comp?.id}, name: ${name}, type: ${type}, trigger: ${trigger}`);
		}
	}

	public setVisible(value: boolean): ContextWindow {
		//clear data trigger info
		return (!super.setVisible(value).visible && this.win.setAttribute("data-trigger", "")), this
	}

	/**
	 * @description store data trigger and returns the context key, must be called this.build after
	 * @param comp component name
	 * @param type component child type
	 * @returns {string} context key
	 */
	public setTrigger(id: string, name: string, type: string, data: string): string {
		let
			ctx;
		switch (type) {
			case "node":
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
		let a = [id, name, type, data].filter(v => v != null);
		return this.win.setAttribute("data-trigger", `${a.join('::')}`), ctx
	}

	public build(key: string): ContextWindow {
		let
			entry = this.settings.list.get(key);
		if (entry) {
			this.settings.current = key;
			this.clear();
			let
				html = entry.map(value => nano(this.app.templates.ctxItem01, value)).join('');
			this.win.innerHTML = html;
		}
		return this;
	}

}