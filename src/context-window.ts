import BaseWindow from "./base-window";
import { IContextMenuOptions, IContextMenuItem, IContextMenuSettings } from "./interfaces";
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

	public execute(action: number, trigger: string) {
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
			case 7:			//"Select" just ONE
				if (!(compNull = !comp)) {
					selectAll(false);
					app.selectedComponents = [comp.select(true)];
					app.refreshRotation();
					app.winProps.load(comp);
					//temporary, for testings...
					(<any>window).ec = app.ec;
				}
				break;
			case 8:			//"Select All"
				app.selectedComponents = selectAll(true);
				app.refreshRotation();
				app.winProps.clear();
				break;
			case 9:			//"Deselect All"
				selectAll(false);
				app.selectedComponents = [];
				app.refreshRotation();
				app.winProps.clear();
				break;
			case 10:		//"Delete"
				//disconnects and remove component from DOM
				//app.ec && (app.ec.disconnect(), app.ec.remove());
				break;
			case 11:		//"Properties"
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