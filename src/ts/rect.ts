import { IPoint, IRect } from "./interfaces";

export default class Rect implements IRect {

	constructor(public x: number, public y: number, public width: number, public height: number) { }

	get empty(): boolean { return this.width < 0 || this.height < 0 }

	public inside(p: IPoint): boolean {
		return p.x >= this.x && p.y >= this.y && p.x <= (this.x + this.width) && p.y <= (this.y + this.height)
		// Point.inside(Point.minus(p, this.location), this.size)
	}

	//later reverse this, so this is modified, not r
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

	public clone(): Rect { return Rect.create(this) }

	public contains(r: Rect): boolean {
		return r.x >= this.x
			&& r.y >= this.y
			&& (r.x + r.width <= this.x + this.width)
			&& (r.y + r.height <= this.y + this.height)
	}

	public add(r: Rect) {
		let
			nx = Math.min(this.x, r.x),
			ny = Math.min(this.y, r.y);
		this.x = nx;
		this.y = ny;
		this.width = Math.max(this.x + this.width, r.x + r.width) - nx;
		this.height = Math.max(this.y + this.height, r.y + r.height) - ny;
	}

	public move(x: number, y: number) {
		this.x = x | 0;
		this.y = y | 0;
	}

	public grow(dx: number, dy: number) {
		this.x -= (dx = dx | 0);
		this.y -= (dy = dy | 0);
		this.width += dx * 2;
		this.height += dy * 2;
	}

	public static create(r: IRect) { return new Rect(r.x, r.y, r.width, r.height) }

	public static empty() { return new Rect(0, 0, 0, 0) }
}