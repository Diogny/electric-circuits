import Item from "./item";
import { Type } from "./types";
import { Application } from "./app";
import { IBaseWindowSettings, ISize, IBaseWindowOptions } from "./interfaces";
import { obj, pojo, removeClass, addClass, css, extend, nano, addClassX, aEL } from "./dab";
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

	get visible(): boolean {
		return this.settings.visible
	}

	public setVisible(value: boolean): BaseWindow {
		super.setVisible(value).visible ? removeClass(this.win, "hide") : addClass(this.win, "hide");
		return this;
	}

	get size(): ISize { return this.settings.size }

	set size(value: ISize) {
		if (!pojo(value)) {
			return; //value = this.propertyDefaults().size;
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
		//create HTML main win template
		!options.templateName && (options.templateName = "baseWin01");
		this.settings.win = <HTMLElement>html(nano(this.app.templates[options.templateName], {
			id: options.id,
			class: "win"		//default class
		}));
		addClassX(this.win, this.settings.class);
		//move to location
		this.move(this.x, this.y);
		//size accordingly
		this.size = options.size;
		this.setVisible(!!this.settings.visible);
		let
			that = this as BaseWindow;
		//default
		aEL(this.win, "mouseover", (e: MouseEvent) => that.onMouseOver.call(that, e), false);
	}

	public onMouseOver(e: MouseEvent) {
	}

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
		//release hook handlers
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