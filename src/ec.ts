//ec.ts
import { attr, obj } from './dab';
import { svg, each } from './utils';
import { Type } from './types';
import Comp from './components';
import Bond from './bonds';
import Point from './point';
import { IItemSolidOptions, IPoint, IItemNode } from './interfaces';
import ItemSolid from './itemSolid';
import Rect from './rect';
import Size from './size';
import { Label } from './label';

export default class EC extends ItemSolid {

	label: Label;

	get type(): Type { return Type.EC }

	get count(): number {
		return this.base.meta.nodes.length
	}

	constructor(options: IItemSolidOptions) {
		//set defaults
		options.class = "ec";
		options.highlightNodeName = "node";
		super(options);
		//this ensures all path, rect, circles are inserted before the highlight circle node
		//_.svg is used because _.html doesn't work for SVG
		[].slice.call(svg(`<g>${this.base.data}</g>`).children).forEach(
			(n: any) => {
				this.g.insertBefore(n, this.highlight.g);
			});
		//create label if defined
		if (this.base.meta.labelId) {
			this.label = new Label(<any>{
				fontSize: 15,
				x: this.base.meta.labelId.x,
				y: this.base.meta.labelId.y
			});
			this.label.setText(this.id);
		}
		//this shows dragx, dragy, and rotate
		this.refresh();
		//signal component creation
		this.onProp && this.onProp({
			id: `#${this.id}`,
			args: {
				id: this.id,
				name: this.name,
				x: this.x,
				y: this.y,
				color: this.color,
				rotation: this.rotation
			},
			method: 'create',
			where: 1			//signals it was a change inside the object
		});
		//
		Comp.save(this);
	}

	public rotate(value: number): EC {
		super.rotate(value);
		//refresh properties and object chaining
		return this.refresh();
	}

	public move(x: number, y: number): EC {
		super.move(x, y);
		//refresh properties and object chaining
		return this.refresh();
	}

	public refresh(): EC {
		let
			attrs: any = {
				dragx: this.x,
				dragy: this.y,
				transform: `translate(${this.x} ${this.y})`
			},
			center = this.origin;
		if (this.rotation) {
			attrs.transform += ` rotate(${this.rotation} ${center.x} ${center.y})`
		}
		//update SVG DOM attributes
		attr(this.g, attrs);
		//refreshBonds
		each(this.bonds, (b: Bond, key: any) => {
			this.nodeRefresh(key);
		});
		//update label if any
		if (this.label) {
			let
				pos = Point.plus(this.p, this.label.p);
			attrs = {
				transform: `translate(${pos.x} ${pos.y})`
			};
			this.rotation && (
				center = Point.minus(Point.plus(this.p, center), pos),
				attrs.transform += ` rotate(${this.rotation} ${center.x} ${center.y})`
			);
			attr(this.label.g, attrs)
		}
		return this;
	}

	public nodeRefresh(node: number): EC {
		let
			bond = this.nodeBonds(node),
			pos = this.getNode(node);
		bond && bond.to.forEach((d) => {
			let
				ic = Comp.item(d.id),
				p = Point.plus(this.p, this.rotation ? pos.rot : pos).round();
			ic && ic.setNode(d.ndx, p)	//no transform
		});
		return this;
	}

	//this returns (x, y) relative to the EC location
	public getNode(pinNode: number): IItemNode {
		let
			pin: IItemNode = <IItemNode>this.base.meta.nodes.list[pinNode],
			rotate = (obj: Point, rotation: number, center: Point): Point => {
				if (!rotation)
					return obj;
				let
					rot = obj.rotateBy(center.x, center.y, -rotation);
				return new Point(rot.x, rot.y)
			};
		if (!pin)
			return <any>null;
		pin.rot = rotate(new Point(pin.x, pin.y), this.rotation, this.origin);
		//
		return obj(pin);
	}

	public overNode(p: IPoint, ln: number): number {
		let
			px = (p.x - this.x) - 5,
			py = (p.y - this.y) - 5,
			rect = new Rect(new Point(px, py), new Size(10, 10));
		for (let i = 0, len = this.count; i < len; i++) {
			let
				pin = this.getNode(i);
			if (this.rotation) {
				pin.x = Math.round(pin.rot.x);
				pin.y = Math.round(pin.rot.y);
			}
			if (rect.inside(new Point(pin.x, pin.y))) {
				return i;
			}
		}
		return -1;
	}

	public setNode(node: number, p: IPoint): EC {
		throw 'somebody called me, not good!';
	}

	public valid(node: number): boolean {
		return !!this.getNode(node)
	}

	public nodeHighlightable(name: number): boolean {
		return this.valid(name)	//for now all valid nodes are highlightables
	}

	public setVisible(value: boolean): EC {
		super.setVisible(value);
		this.label && this.label.setVisible(value);
		return this;
	}

	public remove() {
		//delete label if any first
		this.label && this.g.parentNode?.removeChild(this.label.g);
		super.remove();
	}

	public afterDOMinserted() {
		this.label && (this.g.insertAdjacentElement("afterend", this.label.g), this.label.setVisible(true))
	}
}