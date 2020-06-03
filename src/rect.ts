
import { IPoint, IRect } from "./interfaces";

export default class Rect implements IRect {

	constructor(public x: number, public y: number, public width: number, public height: number) { }

	public inside(p: IPoint): boolean {

		return p.x >= this.x && p.y >= this.y && p.x <= (this.x + this.width) && p.y <= (this.y + this.height)
		// Point.inside(Point.minus(p, this.location), this.size)
	}

	public static create(r: IRect) { return new Rect(r.x, r.y, r.width, r.height) }

	public static empty() { return new Rect(0, 0, 0, 0) }
}