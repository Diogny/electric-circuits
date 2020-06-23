import { ItemBoard, PropertyInjector } from "./itemsBoard";
import { IItemSolidOptions, IItemSolidProperties, ComponentPropertyType } from "./interfaces";
import ItemBase from "./itemsBase";
import Rect from "./rect";
import Size from "./size";
import Point from "./point";
import { Circuit } from "./circuit";

export class RotationInjector extends PropertyInjector {

	get type(): string { return "rotation" }

	get value(): string { return `${this.ec[this.name]}°` }

	setValue(val: string): boolean {
		return false;
	}

	constructor(ec: ItemBoard, name: string) {
		super(ec, name, true);
	}
}

//ItemBoard->ItemSolid->EC
export abstract class ItemSolid extends ItemBoard {

	protected settings: IItemSolidProperties;

	constructor(circuit: Circuit, options: IItemSolidOptions) {
		super(circuit, options);
		//I've to set new properties always, because super just copy defaults()
		//later override method propertyDefaults()
		this.settings.rotation = Point.validateRotation(options.rotation);
	}

	public windowProperties(): string[] { return super.windowProperties().concat(["rotation"]) }

	public prop(propName: string): ComponentPropertyType {
		//inject available properties if called
		switch (propName) {
			case "rotation":
				return new RotationInjector(this, propName)
		}
		return super.prop(propName)
	}

	get rotation(): number { return this.settings.rotation }

	public rotate(value: number): ItemBase {
		if (this.settings.rotation != (value = Point.validateRotation(value))) {
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
		return this;
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
					.map(p => new Point(p[0], p[1]).rotateBy(origin.x, origin.y, angle)),
				x = Math.min.apply(Math, points.map(a => a.x)),
				y = Math.min.apply(Math, points.map(a => a.y)),
				w = Math.max.apply(Math, points.map(a => a.x)),
				h = Math.max.apply(Math, points.map(a => a.y));
			return new Rect(Math.round(p.x + x), Math.round(p.y + y), Math.round(w - x), Math.round(h - y))
		}
		return new Rect(p.x, p.y, size.width, size.height)
	}

}