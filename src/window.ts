import { extend, removeClass, addClass, obj, css, aEL, pojo, toggleClass, clamp, nano } from "./dab";
import { ISize, IWindowProperties, IWindowOptions } from "./interfaces";
import { Type } from "./types";
import Item from "./item";
import { html } from "./utils";
import Point from "./point";
import { Application } from "./app";
import EcProp from "./ecprop";
import { MyApp } from "./myapp";

export default class HtmlWindow extends Item {

	protected settings: IWindowProperties;

	public static minWidth = 200;
	public static minHeight = 100;

	get type(): Type { return Type.WIN }

	get app(): Application { return this.settings.app }
	get win(): HTMLElement { return this.settings.win }


	get header(): HTMLElement { return this.settings.header; }
	headerTitle: HTMLDivElement;
	headerButtons: HTMLDivElement;

	get title(): string { return this.settings.title }
	public setTitle(value: string): HtmlWindow {
		return this.headerTitle.innerText = (this.settings.title = value), this
	}


	get main(): HTMLElement { return this.settings.main }

	get text(): string { return this.settings.content }
	public setText(value: string): HtmlWindow {
		return ((<any>this.main).innerText = (this.settings.content = value), this)
	}

	public setTextHtml(value: string): HtmlWindow {
		return (this.main.innerHTML = value, this)
	}


	get footer(): Element { return this.settings.footer }
	footerBar: HTMLSpanElement;
	footerButtons: HTMLDivElement;

	get bar(): string { return this.settings.bar }
	public setBar(value: string): HtmlWindow {
		return this.footerBar.innerText = (this.settings.bar = value), this
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

	get visible(): boolean {
		return this.settings.visible
	}

	set visible(value: boolean) {
		(this.settings.visible = !!value) ? removeClass(this.win, "hide") : addClass(this.win, "hide")
	}

	get selected(): boolean {
		return this.settings.selected
	}

	public select(value: boolean): HtmlWindow {
		if ((this.settings.selected = !!value)) {
			addClass(this.win, "selected");
		} else {
			removeClass(this.win, "selected");
		}
		return this;
	}

	get size(): ISize { return this.settings.size }

	set size(value: ISize) {
		if (!pojo(value)) {
			return; //value = this.propertyDefaults().size;
		}
		this.settings.size = {
			width: Math.max(HtmlWindow.minWidth, value.width | 0),
			height: Math.max(HtmlWindow.minHeight, value.height | 0)
		};
		css(this.win, {
			width: `${this.size.width}px`,
			height: `${this.size.height}px`
		});
	}

	constructor(options: IWindowOptions) {
		super(options);
		//create HTML main win template
		this.settings.win = <HTMLElement>html(nano(this.app.templates.propWin01, {
			id: options.id,
			class: 'win'//this.settings.class
		}));
		this.settings.header = <HTMLElement>this.win.querySelector("header");
		this.headerTitle = <HTMLDivElement>this.header.children[0];
		this.headerButtons = <HTMLDivElement>this.header.children[1];
		this.settings.main = <HTMLElement>this.win.querySelector("main");
		this.settings.footer = <HTMLElement>this.win.querySelector("footer");
		this.footerBar = <HTMLSpanElement>this.footer.children[0];
		this.footerButtons = <HTMLDivElement>this.footer.children[1];
		//
		this.visible = !(this.settings.visible = !this.settings.visible);
		//set title, content, and bottom bar
		this.setTitle(this.settings.title);
		this.setText(this.settings.content);
		this.setBar(this.settings.bar);
		//move to location
		this.move(this.x, this.y);
		//size accordingly
		this.size = options.size;
		//selectable
		this.select(this.selected);
		//register this to this.win
		(<any>this.win).__win = this;
		let
			that = this as HtmlWindow;
		//header buttons
		aEL(<HTMLElement>this.headerButtons.querySelector('img:nth-of-type(1)'), "click", function (e: MouseEvent) {
			e.stopPropagation();
			toggleClass(that.win, "collapsed");
		}, false);
		aEL(<HTMLElement>this.headerButtons.querySelector('img:nth-of-type(2)'), "click", function (e: MouseEvent) {
			e.stopPropagation();
			that.visible = false;
		}, false);
		//footer buttons
		aEL(<HTMLElement>this.footerButtons.querySelector('img:nth-of-type(1)'), "click", function (e: MouseEvent) {
			e.stopPropagation();
			that.setText("")
		}, false);
		//register handlers
		aEL(this.headerTitle, "mousedown", function (e: MouseEvent) {
			e.stopPropagation();
			//
			that.settings.dragging = false;
			that.settings.offset = new Point(e.offsetX, e.offsetY); // Point.minus(win.p, offset);
			//console.log(`mousedown, eventPhase: ${e.eventPhase} tag: ${(<Element>e.target).tagName}`);
			//console.log('offset', offset, 'win.p', win.p, 'dragging', win.settings.dragging, e);
		}, false);
		//
		aEL(this.headerTitle, "mousemove", function (e: MouseEvent) {
			//console.log(`mousemove, eventPhase: ${e.eventPhase} tag: ${(<Element>e.target).tagName}`);
			e.stopPropagation();
			if (!that.settings.dragging) {
				if (that.settings.offset) {
					//this's the start of dragging
					that.settings.dragging = true;
					addClass(that.header, "dragging");
					//console.log("dragging started");
				}
			}
			let
				client = new Point(e.clientX, e.clientY),
				offset = new Point((<any>that.win).parentNode.offsetLeft, (<any>that.win).parentNode.offsetTop),
				dispP = Point.minus(client, offset),
				maxX = (<any>that.win).parentNode.offsetWidth - (<any>that.win).offsetWidth,
				maxY = (<any>that.win).parentNode.offsetHeight - (<any>that.win).offsetHeight;

			if (that.settings.dragging) {
				let
					p = Point.minus(dispP, that.settings.offset);
				//fix p
				p = new Point(clamp(p.x, 0, maxX), clamp(p.y, 0, maxY));

				that.move(p.x, p.y);
				//console.log('offset', offset, 'win.p', win.p, 'p', p, e);
				//console.log("dragging");

			} else {
				//console.log("mousemove");
			}
			that.renderBar(`(${dispP.x}, ${dispP.y})`);
		}, false);
		let
			stopDragging = function (e: MouseEvent) {
				//e.preventDefault();
				e.stopPropagation();
				//delete dragging flags
				that.settings.dragging = false;
				delete that.settings.offset;
				//remove dragging class
				removeClass(that.header, "dragging");
				//that.bar = `...`;
			};
		aEL(this.headerTitle, "mouseup", function (e: MouseEvent) {
			//console.log(`mouseup, eventPhase: ${e.eventPhase} tag: ${(<Element>e.target).tagName}`);
			if (!that.settings.dragging) {
				that.select(!that.selected);	//click, toggle
				//console.log(`win: ${that.selected}`);
			} else {
				//console.log("stop dragging");
			}
			stopDragging(e);
		}, false);
		aEL(this.headerTitle, "mouseout", function (e: MouseEvent) {
			if (that.settings.dragging)
				return;
			stopDragging(e);
			//console.log(`mouseout, eventPhase: ${e.eventPhase} tag: ${(<Element>e.target).tagName}`);
			that.renderBar("")
		}, false);
		aEL(this.win, "mouseover", function (e: MouseEvent) {
			(that.app as MyApp).topBarLeft.innerHTML = "&nbsp;";
			that.settings.offset && (that.settings.offset = new Point(e.offsetX, e.offsetY));
		}, false);
	}

	public renderBar(text: string) {
		//this's temporary
		this.setBar(`(${this.x}, ${this.y}) ` + text)
	}

	public move(x: number, y: number): HtmlWindow {
		super.move(x, y);
		css(this.win, {
			top: `${this.y}px`,
			left: `${this.x}px`
		});
		return this
	}

	public clear(): HtmlWindow {
		this.setTextHtml("");
		return this;
	}

	/**
	 * @description appends to main content window an html markup text
	 * @param htmlContent html markup text
	 */
	public appendStringChild(htmlContent: string): HtmlWindow {
		this.main.appendChild(html(htmlContent));
		return this;
	}

	/**
	 * @description appends a Html element to the main content. Useful to control from outside display iniside window
	 * @param el Html element to be inserted in DOM
	 */
	public appendHtmlChild(el: HTMLElement): HtmlWindow {
		el && this.main.appendChild(el);
		return this
	}

	public appendPropChild(el: EcProp, wrap?: boolean): HtmlWindow {
		if (el) {
			let
				root = this.main;
			wrap && (root = root.appendChild(document.createElement("div")), root.classList.add("ec-wrap"));
			root.appendChild(el.html)
		}
		return this
	}

	public dispose() {
		//release hook handlers
	}

	//public propertyDefaults = (): IItemBaseProperties => {
	public propertyDefaults(): IWindowProperties {
		return extend(super.propertyDefaults(), {
			app: void 0,
			title: "Window",
			content: "",
			bar: "",
			//dragging: false,
			selected: false,
			size: <ISize>{
				width: 120,
				height: 150
			}
		})
	}

}