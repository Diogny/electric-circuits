import { ISize, IItemBaseOptions } from "./interfaces";
import Point from "./point";
import { obj, copy, unique } from "./dab";
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
	get visible(): boolean { return this.settings.visible; }

	abstract get ClientRect(): ISize;
	abstract get box(): any;

	constructor(options: IItemBaseOptions) {
		super();
		//merge defaults and deep copy
		//all default properties must be refrenced from this or this.settings
		// options is for custom options only
		let
			optionsClass = options.class || "";
		//delete class from options so it doesn't override default settings
		delete options.class;
		this.settings = obj(copy(this.propertyDefaults(), options));
		//update this.settings.class with unique values
		this.settings.class = unique((this.class + " " + optionsClass).split(' ')).join(' ');
		//fix (x,y) coordinates if wrongly initially provided
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
		return this;
	}

	public movePoint(p: Point): Item {
		return this.move(p.x, p.y)
	}

	public translate(dx: number, dy: number): Item {
		return this.move(this.x + (dx | 0), this.y + (dy | 0));
	}

	public propertyDefaults(): IItemBaseOptions {
		return <IItemBaseOptions>{
			id: "",
			name: "",
			x: 0,
			y: 0,
			class: "",
			visible: true,		//defaults is visible
			base: <any>void 0,
			label: ""
		}
	}
}