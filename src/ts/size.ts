import { ISize } from './interfaces';
import { round } from './dab';

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

	public toString(options?: number): string {
		let
			noVars: boolean = ((options = <any>options | 0) & 4) != 0,
			noPars: boolean = (options & 2) != 0;
		return `${noPars ? "" : "("}${noVars ? "" : "w: "}${round(this.width, 1)}, ${noVars ? "" : "h: "}${round(this.height, 1)}${noPars ? "" : ")"}`
	}
}