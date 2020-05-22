import { ISize, IItemBaseOptions } from "./interfaces";
import Point from "./point";
import { Color, Colors } from "./colors";
import { obj, copy } from "./dab";
import { TypedClass } from "./types";

export default abstract class Item extends TypedClass {

	//thi's until we can get real private variables
	protected settings: IItemBaseOptions;

	get name(): string { return this.settings.name }
	get id(): string { return this.settings.id }
	get x(): number { return this.settings.x }
	get y(): number { return this.settings.y }
	get p(): Point { return new Point(this.x, this.y) }
	get class(): string { return this.settings.class }
	get color(): string { return this.settings.color }
	get visible(): boolean { return this.settings.visible; }

	abstract get ClientRect(): ISize;
	abstract get box(): any;

	constructor(options: IItemBaseOptions) {
		super();
		//merge defaults and deep copy
		this.settings = obj(copy(this.propertyDefaults(), options));
		//set default if not defined
		this.settings.x = this.settings.x || 0;
		this.settings.y = this.settings.y || 0;
	}

	public setVisible(value: boolean): Item {
		this.settings.visible = !!value;
		return this;
	}

	public move(x: number, y: number): Item {
		this.settings.x = x | 0;
		this.settings.y = y | 0;
		//for object chaining
		return this;
	}

	public movePoint(p: Point): Item {
		return this.move(p.x, p.y)
	}

	public translate(dx: number, dy: number): Item {
		//for object chaining
		return this.move(this.x + (dx | 0), this.y + (dy | 0));
	}

	public propertyDefaults(): IItemBaseOptions {
		return <IItemBaseOptions>{
			id: "",										//have to be here so it's copied
			name: "",									//have to be here so it's copied
			x: 0,
			y: 0,
			color: Color.getcolor("", Colors.green),	//have to be here so it's copied
			class: "",									//have to be here so it's copied
			visible: true,		//defaults is visible
		}
	}
}