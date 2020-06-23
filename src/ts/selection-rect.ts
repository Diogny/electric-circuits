import Point from "./point";
import Rect from "./rect";
import { MyApp } from "./myapp";
import { tag } from "./utils";
import { attr } from "./dab";

export class SelectionRect {
	start: Point;
	g: SVGRectElement;
	rect: Rect;

	constructor(public app: MyApp) {
		this.g = <SVGRectElement>tag("rect", "selection-rect", {
			class: "dash",
			x: 0, y: 0, width: 0, height: 0,
			"stroke-dasharray": "3, 3"
		});
		this.hide();
	}

	public show(start: Point): SelectionRect {
		this.start = start;
		this.rect = new Rect(start.x, start.y, 0, 0);
		return this.g.classList.remove("hide"), this
	}

	public hide(): SelectionRect {
		this.start = new Point(0, 0);
		this.rect = new Rect(0, 0, 0, 0);
		return this.g.classList.add("hide"), this.refresh()
	}

	public refresh(): SelectionRect {
		attr(this.g, {
			x: this.rect.x,
			y: this.rect.y,
			width: this.rect.width,
			height: this.rect.height
		});
		return this;
	}

	public calculate(p: Point): SelectionRect {
		let
			startX = Math.min(this.start.x, p.x),
			startY = Math.min(this.start.y, p.y),
			endX = Math.max(this.start.x, p.x),
			endY = Math.max(this.start.y, p.y);

		this.rect.x = startX;
		this.rect.y = startY;
		this.rect.width = endX - startX;
		this.rect.height = endY - startY;

		return this.refresh()
	}

}