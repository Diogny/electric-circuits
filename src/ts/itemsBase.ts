import { obj, addClass, removeClass, isStr } from './dab';
import { tag } from './utils';
import { IItemBaseProperties, IItemBaseOptions, ISize } from './interfaces';
import Item from './item';
import Rect from './rect';
import Point from './point';

export default abstract class ItemBase extends Item {

	protected settings: IItemBaseProperties;

	get g(): SVGElement { return this.settings.g }

	get ClientRect(): ISize {
		let b = this.g.getBoundingClientRect();
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
		!this.settings.visible && (classArr.push("hide"));
		this.settings.g = tag("g", this.settings.id, {
			class: (this.settings.class = classArr.join(' '))
		});
	}

	public remove() {
		this.g.parentNode?.removeChild(this.g);
	}

	public afterDOMinserted() { }
}