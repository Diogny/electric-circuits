import { IPoint, IRect } from "./interfaces";

export default class Rect implements IRect {

	constructor(public x: number, public y: number, public width: number, public height: number) { }

	get empty(): boolean { return this.width < 0 || this.height < 0 }

	public inside(p: IPoint): boolean {
		return p.x >= this.x && p.y >= this.y && p.x <= (this.x + this.width) && p.y <= (this.y + this.height)
		// Point.inside(Point.minus(p, this.location), this.size)
	}

	public intersect(r: Rect): boolean {
		let
			nx = Math.max(this.x, r.x),
			ny = Math.max(this.y, r.y);
		r.width = Math.min((this.x + this.width), (r.x + r.width)) - nx;
		r.height = Math.min((this.y + this.height), (r.y + r.height)) - ny;
		r.x = nx;
		r.y = ny;
		return !r.empty
	}

	public static create(r: IRect) { return new Rect(r.x, r.y, r.width, r.height) }

	public static empty() { return new Rect(0, 0, 0, 0) }
}