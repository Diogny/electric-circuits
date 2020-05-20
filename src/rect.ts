
import Point from "./point";
import { IPoint, ISize } from "./interfaces";

export default class Rect {

	constructor(public location: IPoint, public size: ISize) { }

	public get x(): number { return this.location.x }

	public get y(): number { return this.location.y }

	public get width(): number { return this.size.width }

	public get height(): number { return this.size.height }

	public get w(): number { return this.location.x + this.size.width }

	public get h(): number { return this.location.y + this.size.height }

	public inside(p: IPoint): boolean { return Point.inside(Point.minus(p, this.location), this.size) }
}