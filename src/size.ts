
import { ISize } from './interfaces';

export default class Size implements ISize {
	public width: number;
	public height: number;

	constructor(width: number, height: number) {
		this.width = parseFloat(<any>width);	//ensure it's a number
		this.height = parseFloat(<any>height);
	}

	public clone(): Size { return new Size(this.width, this.height) }

	public round(): Size {
		this.width = Math.round(this.width);
		this.height = Math.round(this.height);
		return this
	}

	static empty = new Size(0, 0);

	static create(size: ISize): Size {
		return new Size(size.width, size.height)
	}
}