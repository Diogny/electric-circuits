import Item from "./item";
import { Type } from "./types";
import { IBaseWindowSettings, ISize, IBaseWindowOptions } from "./interfaces";
import { obj, extend } from "./dab";
import { html } from "./utils";
import { Templates } from "./templates";

export default class BaseWindow extends Item {

	protected settings: IBaseWindowSettings;

	get type(): Type { return Type.WIN }

	get win(): HTMLElement { return this.settings.win }

	get title(): string { return this.settings.title }
	public setTitle(value: string): BaseWindow {
		return this.settings.title = value, this
	}

	get ClientRect(): ISize {
		let b = this.win.getBoundingClientRect();
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
		this.settings.win = <HTMLElement>html(Templates.nano(this.settings.templateName, {
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
			visible: false,
			ignoreHeight: false,
			title: "",
			templateName: "baseWin01"
		})
	}

}