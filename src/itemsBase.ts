import { obj, addClass, removeClass, isStr } from './dab';
import { tag } from './utils';
import { Color } from './colors';
import { IItemBaseProperties, IItemBaseOptions, ISize } from './interfaces';
import Item from './item';
import Rect from './rect';
import Point from './point';

export default abstract class ItemBase extends Item {

	protected settings: IItemBaseProperties;	//this extends the base class Item property

	get g(): SVGElement { return this.settings.g }

	get ClientRect(): ISize {
		let b = this.g.getBoundingClientRect();//gives the DOM screen info
		return obj({
			width: b.width | 0,
			height: b.height | 0
		})
	}

	get box(): any { return (<any>this.g).getBBox() }

	get origin(): Point {
		let
			b = this.box;
		return new Point((b.x + b.width / 2) | 0, (b.y + b.height / 2) | 0);
	}

	public rect(): Rect {
		return new Rect(this.p.x, this.p.y, this.box.width, this.box.height)
	}

	public setVisible(value: boolean): ItemBase {
		super.setVisible(value);
		this.visible ? removeClass(this.g, "hide") : addClass(this.g, "hide")
		return this;
	}

	constructor(options: IItemBaseOptions) {
		super(options);
		let
			classArr = isStr(this.class) ? this.class.split(' ') : [];
		//prepare class names
		!this.settings.visible && (classArr.push("hide"));
		//create main container
		this.settings.g = tag("g", this.settings.id, {
			class: (this.settings.class = classArr.join(' '))
		});
		addClass(this.g, this.color);
	}

	//ec.setColor("red").rotate(45).select(true).highlight.setRadius(15).highlight.show(5)
	//ec.setColor("red").rotate(45).select(true).setNodeRadius(15).showNode(5)
	public setColor(value: string): ItemBase {
		let
			newColor = Color.getcolor(value);
		//remove color class
		removeClass(this.g, this.color);
		//set new color	
		this.settings.color = newColor;
		//add new color class
		addClass(this.g, newColor);
		//for object chaining
		return this;
	}

	public remove() {
		this.g.parentNode?.removeChild(this.g);
	}

	public afterDOMinserted() { }
}