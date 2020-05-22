import BaseWindow from "./base-window";
import { IContextMenuOptions, IContextMenuItem, IContextMenuSettings } from "./interfaces";
import { each } from "./utils";
import { nano, aEL, getParentAttr, attr } from "./dab";

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
				action = attr(self, "data-action"),
				trigger = attr(self.parentElement, "data-trigger")
			self && (console.log(self.nodeName, action, trigger), that.setVisible(false))
		}, false)
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
	public setTrigger(id: string, comp: string, type: string, data: string): string {
		let
			ctx;
		switch (type) {
			case "node":
				ctx = ((comp == "wire") ? "wire-" : "ec-") + type;
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
				return <any>void 0;
		}
		let a = [id, comp, type, data].filter(v => v != null);
		return this.win.setAttribute("data-trigger", `${a.join(':')}`), ctx
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