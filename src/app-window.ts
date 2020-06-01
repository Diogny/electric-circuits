import { extend, removeClass, addClass, aEL, toggleClass, clamp } from "./dab";
import { IAppWindowProperties, IAppWindowOptions } from "./interfaces";
import BaseWindow from "./base-window";
import { html } from "./utils";
import Point from "./point";
import EcProp from "./ecprop";
import { MyApp } from "./myapp";
import { ItemBoard } from "./itemsBoard";

export default class AppWindow extends BaseWindow {

	//extend
	protected settings: IAppWindowProperties;

	public compId: string;

	//title/header
	titleHTML: HTMLDivElement;
	titleButtons: HTMLDivElement;
	get title(): string { return this.settings.title }
	public setTitle(value: string): AppWindow {
		return this.titleHTML.innerText = (this.settings.title = value), this
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
		//
		this.titleHTML = <HTMLDivElement>header.children[0];
		this.titleButtons = <HTMLDivElement>header.children[1];
		this.settings.main = <HTMLElement>this.win.querySelector("main");
		//
		this.barTitle = <HTMLSpanElement>footer.children[0];
		this.barButtons = <HTMLDivElement>footer.children[1];
		//set title, content, and bottom bar
		this.setTitle(this.settings.title);
		this.setText(this.settings.content);
		this.setBar(this.settings.bar);
		//register this to this.win
		(<any>this.win).__win = this;
		let
			that = this as AppWindow;
		//header buttons
		aEL(<HTMLElement>this.titleButtons.querySelector('img:nth-of-type(1)'), "click", function (e: MouseEvent) {
			e.stopPropagation();
			toggleClass(that.win, "collapsed");
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
		(this.app as MyApp).topBarLeft.innerHTML = "&nbsp;";
		this.settings.offset && (this.settings.offset = new Point(e.offsetX, e.offsetY));
		//console.log('IN app window', e.eventPhase, (e.target as HTMLElement).id);
	}

	public onMouseLeave(e: MouseEvent) {
		this.renderBar("")
		//console.log('OUT of app window', e.eventPhase, (e.target as HTMLElement).id);
	}

	public setVisible(value: boolean): AppWindow {
		return super.setVisible(value).visible ? addClass(this.win, "selected") : removeClass(this.win, "selected"), this
	}

	public renderBar(text: string) {
		//this's temporary
		this.setBar(`(${this.x}, ${this.y}) ` + text)
	}

	public clear(): AppWindow {
		//don't call base.clear because it clears all innerHTML
		this.setTextHtml("");
		this.compId = "";
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
		this.compId = comp.id;
		comp.properties().forEach((name: string) => {
			this.appendPropChild(new EcProp(<ItemBoard>comp, name,
				function onEcPropChange(value: any) {
					console.log(this, value)
				}, true));
		});
		this.setVisible(true);
		return true;
	}

	public appendPropChild(el: EcProp): AppWindow {
		return el && (this.main.appendChild(el.html), this.settings.properties.push(el)), this
	}

	public property(name: string): EcProp | undefined {
		return this.settings.properties.find(p => p.name == name)
	}

	public propertyDefaults(): IAppWindowProperties {
		return extend(super.propertyDefaults(), {
			class: "win props",
			templateName: "propWin01",
			title: "Window",
			content: "",
			bar: "",
			selected: false,
			properties: []
		})
	}

}

function dragWindow(win: AppWindow) {
	var
		ofsx = 0,
		ofsy = 0,
		maxX = (win.win.parentNode as HTMLElement).offsetWidth - win.win.offsetWidth,
		maxY = (win.win.parentNode as HTMLElement).offsetHeight - win.win.offsetHeight

	win.titleHTML.onmousedown = dragMouseDown;

	function dragMouseDown(e: MouseEvent) {
		e = e || window.event;
		e.preventDefault();
		ofsx = e.offsetX;
		ofsy = e.offsetY;
		document.onmouseup = closeDragElement;
		document.onmousemove = elementDrag;
		addClass(win.titleHTML, "dragging")
	}

	function elementDrag(e: MouseEvent) {
		e = e || window.event;
		e.preventDefault();
		let
			x = clamp(e.clientX - ofsx - (win.app as MyApp).board.offsetLeft, 0, maxX),
			y = clamp(e.clientY - ofsy - (win.app as MyApp).board.offsetTop, 0, maxY);
		win.move(x, y);
	}

	function closeDragElement() {
		document.onmouseup = null;
		document.onmousemove = null;
		removeClass(win.titleHTML, "dragging")
	}
}
