import Item from "./item";
import { Type } from "./types";
import { Application } from "./app";
import { IBaseWindowSettings, ISize, IBaseWindowOptions } from "./interfaces";
import { obj, pojo, removeClass, addClass, css, extend, nano, aEL } from "./dab";
import { html } from "./utils";

export default class BaseWindow extends Item {

	public static minWidth = 200;
	public static minHeight = 100;

	protected settings: IBaseWindowSettings;

	get type(): Type { return Type.WIN }

	get app(): Application { return this.settings.app }
	get win(): HTMLElement { return this.settings.win }

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

	public setVisible(value: boolean): BaseWindow {
		return super.setVisible(value).visible ? removeClass(this.win, "hide") : addClass(this.win, "hide"), this
	}

	get size(): ISize { return this.settings.size }

	set size(value: ISize) {
		if (!pojo(value)) {
			return;
		}
		this.settings.size = {
			width: Math.max(BaseWindow.minWidth, value.width | 0),
			height: Math.max(BaseWindow.minHeight, value.height | 0)
		};
		this.win.style.width = `${this.size.width}px`;
		!this.settings.ignoreHeight && (this.win.style.height = `${this.size.height}px`);
	}

	constructor(options: IBaseWindowOptions) {
		super(options);
		!this.settings.templateName && (this.settings.templateName = "baseWin01");
		this.settings.win = <HTMLElement>html(nano(this.app.templates[this.settings.templateName], {
			id: this.id,
			class: this.class
		}));
		this.move(this.x, this.y);
		this.size = this.settings.size;
		this.setVisible(!!this.settings.visible);
		let
			that = this as BaseWindow;
		aEL(this.win, "mouseenter", (e: MouseEvent) => that.onMouseEnter.call(that, e), false);
		aEL(this.win, "mouseleave", (e: MouseEvent) => that.onMouseLeave.call(that, e), false);
	}

	public onMouseEnter(e: MouseEvent) { }

	public onMouseLeave(e: MouseEvent) { }

	public move(x: number, y: number): BaseWindow {
		super.move(x, y);
		css(this.win, {
			top: `${this.y}px`,
			left: `${this.x}px`
		});
		return this
	}

	public clear(): BaseWindow {
		return this.win.innerHTML = "", this
	}

	public dispose() {
		//release hook handlers, ...
	}

	public propertyDefaults(): IBaseWindowOptions {
		return extend(super.propertyDefaults(), {
			app: void 0,
			size: <ISize>{
				width: 120,
				height: 150
			},
			visible: false,
			ignoreHeight: false
		})
	}

}