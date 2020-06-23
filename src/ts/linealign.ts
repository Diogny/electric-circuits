import Wire from "./wire";
import Point from "./point";
import { tag } from "./utils";
import { addClass, attr, removeClass } from "./dab";
import { IItemNode } from "./interfaces";
import { MyApp } from "./myapp";

export default class LinesAligner {

	g: SVGSVGElement;
	private line0: SVGLineElement;
	private line1: SVGLineElement;
	wire: Wire;
	node: number;
	p: Point;
	match: boolean;

	constructor(public app: MyApp) {
		let
			create = (id: string) => <SVGLineElement>tag("line", id, {
				class: "dash hide",
				x1: 0, y1: 0, x2: 0, y2: 0,
				"stroke-dasharray": "3, 3"
			});
		this.g = <SVGSVGElement>tag("g", "", {});
		this.g.appendChild(this.line0 = create("line0"));
		this.g.appendChild(this.line1 = create("line1"));
	}

	public hide() {
		addClass(this.line0, "hide");
		addClass(this.line1, "hide");
	}

	private calculate(line: SVGLineElement, nodePoint: Point, otherNodePoint: IItemNode): number {
		if (!otherNodePoint)
			return 0;
		let
			ofs = Point.minus(otherNodePoint, nodePoint);
		if (Math.abs(ofs.x) < 3) {
			attr(line, {
				x1: nodePoint.x = otherNodePoint.x,
				y1: 0,
				x2: nodePoint.x,
				y2: this.app.viewBox.height
			});
			return 1;			//vertical
		} else if (Math.abs(ofs.y) < 3) {
			attr(line, {
				x1: 0,
				y1: nodePoint.y = otherNodePoint.y,
				x2: this.app.viewBox.width,
				y2: nodePoint.y
			});
			return -1;			//horizontal
		}
		return 0
	}

	public matchWireLine(wire: Wire, line: number): boolean {
		this.hide();
		this.p = Point.create(wire.getNode(this.node = line));	//line is 1-based
		if (this.calculate(this.line0, this.p, wire.getNode(line + 1)) ||
			(this.p = Point.create(wire.getNode(this.node = --line)),
				this.calculate(this.line0, this.p, wire.getNode(--line)))
		) {
			this.wire = wire;
			removeClass(this.line0, "hide");
			return this.match = true
		}
		return false;
	}

	public matchWireNode(wire: Wire, node: number): boolean {
		this.hide();
		this.p = Point.create(wire.getNode(node));
		let
			before = this.calculate(this.line0, this.p, wire.getNode(node - 1)),
			after = this.calculate(this.line1, this.p, wire.getNode(node + 1));
		if (before | after) {
			this.wire = wire;
			this.node = node;
			before && removeClass(this.line0, "hide");
			after && removeClass(this.line1, "hide");
			return this.match = true
		}
		return this.match = false
	}

}