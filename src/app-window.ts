import { extend, removeClass, addClass, aEL, toggleClass, clamp } from "./dab";
import { IAppWindowProperties, IAppWindowOptions } from "./interfaces";
import BaseWindow from "./base-window";
import { html } from "./utils";
import Point from "./point";
import EcProp from "./ecprop";
import { MyApp } from "./myapp";

export default class AppWindow extends BaseWindow {

	//extend
	protected settings: IAppWindowProperties;

	get selected(): boolean {
		return this.settings.selected
	}

	public select(value: boolean): AppWindow {
		if ((this.settings.selected = !!value)) {
			addClass(this.win, "selected");
		} else {
			removeClass(this.win, "selected");
		}
		return this;
	}

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
		options.templateName = "propWin01";
		//extend with specific class
		options.class = (options.class || "") + " props";
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
		//selectable
		this.select(this.selected);
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
		aEL(<HTMLElement>this.barButtons.querySelector('img:nth-of-type(1)'), "click", function (e: MouseEvent) {
			e.stopPropagation();
			that.setText("")
		}, false);
		//register handlers
		aEL(this.titleHTML, "mousedown", function (e: MouseEvent) {
			e.stopPropagation();
			//
			that.settings.dragging = false;
			that.settings.offset = new Point(e.offsetX, e.offsetY); // Point.minus(win.p, offset);
			//console.log(`mousedown, eventPhase: ${e.eventPhase} tag: ${(<Element>e.target).tagName}`);
			//console.log('offset', offset, 'win.p', win.p, 'dragging', win.settings.dragging, e);
		}, false);
		//
		aEL(this.titleHTML, "mousemove", function (e: MouseEvent) {
			//console.log(`mousemove, eventPhase: ${e.eventPhase} tag: ${(<Element>e.target).tagName}`);
			e.stopPropagation();
			if (!that.settings.dragging) {
				if (that.settings.offset) {
					//this's the start of dragging
					that.settings.dragging = true;
					addClass(header, "dragging");
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
				removeClass(header, "dragging");
				//that.bar = `...`;
			};
		aEL(this.titleHTML, "mouseup", function (e: MouseEvent) {
			//console.log(`mouseup, eventPhase: ${e.eventPhase} tag: ${(<Element>e.target).tagName}`);
			if (!that.settings.dragging) {
				that.select(!that.selected);	//click, toggle
				//console.log(`win: ${that.selected}`);
			} else {
				//console.log("stop dragging");
			}
			stopDragging(e);
		}, false);
		aEL(this.titleHTML, "mouseout", function (e: MouseEvent) {
			if (that.settings.dragging)
				return;
			stopDragging(e);
			//console.log(`mouseout, eventPhase: ${e.eventPhase} tag: ${(<Element>e.target).tagName}`);
			that.renderBar("")
		}, false);
	}

	public onMouseOver(e: MouseEvent) {
		(this.app as MyApp).topBarLeft.innerHTML = "&nbsp;";
		this.settings.offset && (this.settings.offset = new Point(e.offsetX, e.offsetY));
	}

	public renderBar(text: string) {
		//this's temporary
		this.setBar(`(${this.x}, ${this.y}) ` + text)
	}

	public clear(): AppWindow {
		//don't call base.clear because it clears all innerHTML
		this.setTextHtml("");
		this.settings.properties = [];
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

	public appendPropChild(el: EcProp, wrap?: boolean): AppWindow {
		if (el) {
			let
				root = this.main;
			wrap && (root = root.appendChild(document.createElement("div")), root.classList.add("ec-wrap"));
			root.appendChild(el.html);
			this.settings.properties.push(el);
		}
		return this
	}

	public property(name: string): EcProp | undefined {
		return this.settings.properties.find(p => p.name == name)
	}

	//public propertyDefaults = (): IItemBaseProperties => {
	public propertyDefaults(): IAppWindowProperties {
		return extend(super.propertyDefaults(), {
			title: "Window",
			content: "",
			bar: "",
			//dragging: false,
			selected: false,
			properties: []
		})
	}

}