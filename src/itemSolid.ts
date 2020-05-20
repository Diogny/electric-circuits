import ItemBoard from "./itemsBoard";
import { IItemSolidOptions, IItemSolidProperties, IPoint } from "./interfaces";
import ItemBase from "./itemsBase";
import { round } from "./dab";
import Rect from "./rect";
import Size from "./size";
import Point from "./point";

//ItemBoard->ItemSolid->EC
export default abstract class ItemSolid extends ItemBoard {

	protected settings: IItemSolidProperties;

	constructor(options: IItemSolidOptions) {
		super(options);
		//I've to set new properties always, because super just copy defaults()
		this.settings.rotation = this.validateRotation(options.rotation);
	}

	get rotation(): number { return this.settings.rotation }

	//this one returns NULL if select property could not be done
	//  otherwise returns "this" for object chaining
	public rotate(value: number): ItemBase {
		if (this.settings.rotation != (value = this.validateRotation(value))) {
			//set new value
			this.settings.rotation = value;

			//trigger property changed if applicable
			this.onProp && this.onProp({
				id: `#${this.id}`,
				value: this.rotation,
				prop: "rotate",
				where: 1				//signals it was a change inside the object
			});
		}
		return this;	//for object chaining
	}

	private validateRotation(val: number): number {
		return (val = (val | 0) % 360, (val < 0) && (val += 360), val);
	}

	/**
	 * @description rotate (x,y) through center (x,y) by an angle
	 * @param {number} cx center x
	 * @param {number} cy center y
	 * @param {number} x coordinate x to rotate
	 * @param {number} y coordinate y to rotate
	 * @param {number} angle angle to rotate
	 */
	public rotateBy(cx: number, cy: number, x: number, y: number, angle: number): IPoint {
		var radians = (Math.PI / 180) * angle,
			cos = Math.cos(radians),
			sin = Math.sin(radians),
			nx = (cos * (x - cx)) + (sin * (y - cy)) + cx,
			ny = (cos * (y - cy)) - (sin * (x - cx)) + cy;
		return { x: round(nx, 3), y: round(ny, 3) };
	}

	public rect(): Rect {
		let
			size = Size.create(this.box),
			p = this.p;
		if (this.rotation) {
			//rotate (0,0) (width,0) (width,height) (0,height) and get the boundaries respectivelly to the location (x,y)
			let
				origin = this.origin,
				angle = -this.rotation,
				points = [[0, 0], [size.width, 0], [0, size.height], [size.width, size.height]]
					.map(p => this.rotateBy(origin.x, origin.y, p[0], p[1], angle)),
				x = Math.min.apply(Math, points.map(a => a.x)),
				y = Math.min.apply(Math, points.map(a => a.y)),
				w = Math.max.apply(Math, points.map(a => a.x)),
				h = Math.max.apply(Math, points.map(a => a.y));
			return new Rect(new Point(Math.round(p.x + x), Math.round(p.y + y)), new Size(Math.round(w - x), Math.round(h - y)))
		}
		return new Rect(p, size)
	}

}