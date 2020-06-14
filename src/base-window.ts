import Item from "./item";
import { Type } from "./types";
import { Application } from "./app";
import { IBaseWindowSettings, ISize, IBaseWindowOptions } from "./interfaces";
import { obj, extend, nano } from "./dab";
import { html } from "./utils";

export default class BaseWindow extends Item {

	protected settings: IBaseWindowSettings;

	get type(): Type { return Type.WIN }

	get app(): Application { return this.settings.app }

	get win(): HTMLElement { return this.settings.win }

	get title(): string { return this.settings.title }
	public setTitle(value: string): BaseWindow {
		return this.settings.title = value, this
	}

	get ClientRect(): ISize {
		let b = this.win.getBoundingClientRect();//gives the DOM screen info
		return obj({
			width: b.width | 0,
			height: b.height | 0
		})
	}

	get box(): any {
		return (<any>this.win).getBBox()
	}

	constructor(options: IBaseWindowOptions) {
		super(options);
		this.settings.win = <HTMLElement>html(nano(this.app.templates[this.settings.templateName], {
			id: this.id,
			class: this.class
		}));
		this.move(this.x, this.y);
		this.setVisible(!!this.settings.visible);
	}

	public clear(): BaseWindow {
		return this.win.innerHTML = "", this
	}

	public propertyDefaults(): IBaseWindowOptions {
		return extend(super.propertyDefaults(), {
			app: void 0,
			visible: false,
			ignoreHeight: false,
			title: "",
			templateName: "baseWin01"
		})
	}

}