import { extend, removeClass, addClass, aEL, toggleClass, clamp } from "./dab";
import { IAppWindowProperties, IAppWindowOptions, StateType, ActionType } from "./interfaces";
import { html } from "./utils";
import Point from "./point";
import EcProp from "./ecprop";
import { ItemBoard } from "./itemsBoard";
import BoardWindow from "./board-window";
import ActionManager from "./action-manager";

export default class AppWindow extends BoardWindow {

	//extend
	protected settings: IAppWindowProperties;

	get compId(): string { return this.settings.compId }

	//title/header
	titleHTML: HTMLDivElement;
	titleButtons: HTMLDivElement;
	public setTitle(value: string): AppWindow {
		return this.titleHTML.innerText = super.setTitle(value).title, this
	}

	//main/content
	get main(): HTMLElement { return this.settings.main }

	get text(): string { return this.settings.content }
	public setText(value: string): AppWindow {
		return (<any>this.main).innerText = (this.settings.content = value), this
	}
	public setTextHtml(value: string): AppWindow {
		return (this.main.innerHTML = value, this)
	}

	//bottom-bar/footer
	barTitle: HTMLSpanElement;
	barButtons: HTMLDivElement;
	get bar(): string { return this.settings.bar }
	public setBar(value: string): AppWindow {
		return this.barTitle.innerText = (this.settings.bar = value), this
	}

	constructor(options: IAppWindowOptions) {
		super(options);
		let
			header = <HTMLElement>this.win.querySelector("header"),
			footer = <HTMLElement>this.win.querySelector("footer");
		this.titleHTML = <HTMLDivElement>header.children[0];
		this.titleButtons = <HTMLDivElement>header.children[1];
		this.settings.main = <HTMLElement>this.win.querySelector("main");
		this.barTitle = <HTMLSpanElement>footer.children[0];
		this.barButtons = <HTMLDivElement>footer.children[1];
		this.setTitle(this.settings.title);
		this.setText(this.settings.content);
		this.setBar(this.settings.bar);
		(<any>this.win).__win = this;
		let
			that = this as AppWindow;
		//header buttons
		aEL(<HTMLElement>this.titleButtons.querySelector('img:nth-of-type(1)'), "click", function (e: MouseEvent) {
			e.stopPropagation();
			toggleClass(that.win, "collapsed");
			that.setVisible(true);
		}, false);
		aEL(<HTMLElement>this.titleButtons.querySelector('img:nth-of-type(2)'), "click", function (e: MouseEvent) {
			e.stopPropagation();
			that.setVisible(false);
		}, false);
		//footer buttons
		/*aEL(<HTMLElement>this.barButtons.querySelector('img:nth-of-type(1)'), "click", function (e: MouseEvent) {
			e.stopPropagation();
			that.setText("")
		}, false);*/
		//register handlers
		dragWindow(this);
	}

	public onMouseEnter(e: MouseEvent) {
		ActionManager.$.transition(StateType.WINDOW, ActionType.START);
		this.settings.offset && (this.settings.offset = new Point(e.offsetX, e.offsetY));
		//console.log('IN app window', e.eventPhase, (e.target as HTMLElement).id);
	}

	public onMouseLeave(e: MouseEvent) {
		ActionManager.$.transition(StateType.BOARD, ActionType.RESUME);
		this.renderBar("");
		//console.log('OUT of app window', e.eventPhase, (e.target as HTMLElement).id);
	}

	public setVisible(value: boolean): AppWindow {
		if (super.setVisible(value).visible) {
			let
				{ x, y } = checkPosition(this, this.x, this.y);
			this.move(x, y);
		}
		return this
	}

	public renderBar(text: string) {
		//this's temporary
		this.setBar(`(${this.x}, ${this.y}) ` + text)
	}

	public clear(): AppWindow {
		//don't call base.clear because it clears all innerHTML
		this.setTextHtml("");
		this.settings.compId = "";
		this.settings.properties = [];
		this.setVisible(false);
		return this;
	}

	/**
	 * @description appends to main content window an html markup text
	 * @param htmlContent html markup text
	 */
	public appendStringChild(htmlContent: string): AppWindow {
		this.main.appendChild(html(htmlContent));
		return this;
	}

	/**
	 * @description appends a Html element to the main content. Useful to control from outside display iniside window
	 * @param el Html element to be inserted in DOM
	 */
	public appendHtmlChild(el: HTMLElement): AppWindow {
		el && this.main.appendChild(el);
		return this
	}

	public load(comp: ItemBoard): boolean {
		if (!comp)
			return false;
		this.clear();
		this.settings.compId = comp.id;
		comp.properties().forEach((name: string) => {
			this.appendPropChild(new EcProp(<ItemBoard>comp, name,
				function onEcPropChange(value: any) {
					ActionManager.$.app.circuit.modified = true;
					ActionManager.$.app.updateCircuitLabel();
				}, true));
		});
		this.setVisible(true);
		return true;
	}

	public refresh() {
		if (!this.compId)
			return;
		this.settings.properties.forEach(p => p.refresh())
	}

	public appendPropChild(el: EcProp): AppWindow {
		return el && (this.main.appendChild(el.html), this.settings.properties.push(el)), this
	}

	public property(name: string): EcProp | undefined {
		return this.settings.properties.find(p => p.name == name)
	}

	public propertyDefaults(): IAppWindowProperties {
		return extend(super.propertyDefaults(), {
			class: "win props no-select",
			templateName: "propWin01",
			title: "Window",
			content: "",
			bar: "",
			selected: false,
			properties: [],
			compId: "",
		})
	}

}

function checkPosition(win: AppWindow, x: number, y: number): { x: number, y: number } {
	return {
		x: clamp(x, 0, ActionManager.$.app.size.width - win.win.offsetWidth),
		y: clamp(y, 0, ActionManager.$.app.contentHeight - win.win.offsetHeight)
	}
}

function dragWindow(win: AppWindow) {
	var
		ofsx = 0,
		ofsy = 0;

	win.titleHTML.addEventListener("mousedown", dragMouseDown, false);

	function dragMouseDown(e: MouseEvent) {
		e = e || window.event;
		e.preventDefault();
		ofsx = e.offsetX;
		ofsy = e.offsetY;
		document.addEventListener("mouseup", closeDragElement, false);
		document.addEventListener("mousemove", elementDrag, false);
		addClass(win.titleHTML, "dragging")
	}

	function elementDrag(e: MouseEvent) {
		e = e || window.event;
		e.preventDefault();
		let
			{ x, y } = checkPosition(win,
				e.clientX - ofsx - ActionManager.$.app.boardOffsetLeft,
				e.clientY - ofsy - ActionManager.$.app.boardOffsetTop);
		win.move(x, y);
	}

	function closeDragElement() {
		document.removeEventListener("mouseup", closeDragElement, false);
		document.removeEventListener("mousemove", elementDrag, false);
		removeClass(win.titleHTML, "dragging")
	}
}
