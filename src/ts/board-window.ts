import BaseWindow from "./base-window";
import { IBoardWindowOptions, IBoardWindowProperties, ISize } from "./interfaces";
import { pojo, extend, aEL, css, removeClass, addClass } from "./dab";

export default class BoardWindow extends BaseWindow {

	public static minWidth = 200;
	public static minHeight = 100;

	protected settings: IBoardWindowProperties;

	get size(): ISize { return this.settings.size }

	set size(value: ISize) {
		this.settings.size = {
			width: Math.max(BoardWindow.minWidth, value.width | 0),
			height: Math.max(BoardWindow.minHeight, value.height | 0)
		};
		this.win.style.width = `${this.size.width}px`;
		!this.settings.ignoreHeight && (this.win.style.height = `${this.size.height}px`);
	}

	constructor(options: IBoardWindowOptions) {
		super(options);
		this.size = this.settings.size;
		let
			that = this as BoardWindow;
		aEL(this.win, "mouseenter", (e: MouseEvent) => that.onMouseEnter.call(that, e), false);
		aEL(this.win, "mouseleave", (e: MouseEvent) => that.onMouseLeave.call(that, e), false);
	}

	public onMouseEnter(e: MouseEvent) { }

	public onMouseLeave(e: MouseEvent) { }
	
	public setVisible(value: boolean): BoardWindow {
		return super.setVisible(value).visible ? removeClass(this.win, "hide") : addClass(this.win, "hide"), this
	}
	
	public move(x: number, y: number): BoardWindow {
		super.move(x, y);
		css(this.win, {
			top: `${this.y}px`,
			left: `${this.x}px`
		});
		return this
	}

	public dispose() {
		//release hook handlers, ...
	}

	public propertyDefaults(): IBoardWindowOptions {
		return extend(super.propertyDefaults(), {
			size: <ISize>{
				width: 120,
				height: 150
			},
		})
	}

}