import { addClass, removeClass, attr, isArr, extend } from './dab';
import { tag } from './utils';
import { Type } from './types';
import { IItemWireOptions, IItemNode, IPoint, IWireProperties, ComponentPropertyType } from './interfaces';
import { ItemBoard } from './itemsBoard';
import Comp from './components';
import Point from './point';
import Rect from './rect';

export default class Wire extends ItemBoard {

	protected settings: IWireProperties;

	get type(): Type { return Type.WIRE }

	get count(): number { return this.settings.points.length }

	get last(): number { return this.settings.points.length - 1 }

	get lastLine(): number { return this.editMode ? this.settings.lines.length : 0 }

	get isOpen(): boolean { return !this.nodeBonds(0) || !this.nodeBonds(this.last) }

	public rect(): Rect { return Rect.create(this.box) }

	//edit-mode
	get editMode(): boolean { return this.settings.edit }

	set editMode(value: boolean) {
		if (this.editMode == value)		//avoid duplicated
			return;
		//if editMode == true
		if (this.editMode) {
			//	will change to false
			//		.destroy lines
			this.settings.lines = this.settings.lines.filter(ln => {
				this.g.removeChild(ln);
				return false
			});
			//		.recreate polyline
			this.refresh();
			//		.show polyline
			removeClass(this.settings.polyline, "hide")
		} else {
			//if editMode == false
			//	will change to true
			//		.hide polyline
			addClass(this.settings.polyline, "hide");
			//		.create lines
			for (let i = 0, a = this.settings.points[0], cnt = this.last; i < cnt; i++) {
				let
					b = this.settings.points[i + 1],
					ln = tag("line", "", {
						"svg-type": "line",
						line: (i + 1),
						x1: a.x,
						y1: a.y,
						x2: b.x,
						y2: b.y
					});
				this.settings.lines.push(ln);
				this.g.insertBefore(ln, this.settings.polyline);
				a = b;
			}
		}
		this.settings.edit = value
	}

	constructor(options: IItemWireOptions) {
		super(options);
		this.settings.polyline = tag("polyline", "", {
			"svg-type": "line",
			line: "0",
			points: "",
		});
		this.g.append(this.settings.polyline);

		//set new points in polyline
		this.setPoints(options.points);

		//bond wire ends if any
		if (options.start) {
			//...
		}

		if (options.end) {
			//...
		}

		//place it
		this.move(this.settings.points[0].x, this.settings.points[0].y);
		//signal component creation
		this.onProp && this.onProp({
			id: `#${this.id}`,
			args: {
				id: this.id,
				name: this.name,
				x: this.x,
				y: this.y,
				color: this.color,
				points: this.settings.points,
				bonds: '[' + this.bonds.map((b) => b.link).join(', ') + ']'
			},
			method: 'create',
			where: 1			//signals it was a change inside the object
		});
		Comp.save(this);
	}

	public refresh(): Wire {
		//set new points
		attr(this.settings.polyline, {
			points: this.settings.points.map(p => `${p.x}, ${p.y}`).join(' ')
		});
		return this;
	}

	public nodeRefresh(node: number): Wire {
		if (this.editMode) {
			//update lines  only if in edit mode
			let
				ln: SVGElement,
				p = this.settings.points[node];

			(ln = this.settings.lines[node - 1]) && attr(ln, { x2: p.x, y2: p.y }); //line where i(p) is second point
			(ln = this.settings.lines[node]) && attr(ln, { x1: p.x, y1: p.y }); //line where i(p) is first point
		} else {
			//full refresh because polyline
			this.refresh();
		}
		if (!(node == 0 || node == this.last)) {
			let
				bond = this.nodeBonds(node),
				p = this.settings.points[node];
			bond && bond.to.forEach(b => {
				Comp.item(b.id)?.setNode(b.ndx, p)
			})
		}
		return this;
	}

	/**
	 * @description returns true if a point is valid
	 * @comment later see how to change this to validNode, conflict in !ic.valid(node)
	 * 		because we don't know if it's a IC or a wire
	 * @param {number} node 0-based point index	it can be -1
	 * @returns {boolean} true if point is valid
	 */
	public valid(node: number): boolean {
		//(i) => ((i = i | 0) >= 0 && i < points.length);
		//return (node = <any>node | 0) >= -1 && node < this.points.length;	// NOW ACCEPTS  -1
		//	-1  0  ... last  	   -> true
		//	"-1"  "0"  ... "last"  -> true
		//	""  "  "  "1."  "1a"   -> false
		return node >= -1   //String(Number(node)) == node
			&& node <= this.last;	// NOW ACCEPTS  -1
	}

	public getNode(node: number): IItemNode {
		let
			p: Point = this.settings.points[node];
		p && (p = p.clone());
		return <IItemNode><unknown>p;
	}

	public appendNode(p: Point): boolean {
		return !this.editMode && (this.settings.points.push(p), this.refresh(), true)
	}

	public setNode(node: number, p: IPoint): Wire {
		//because no transformation, p is the same, just save it
		this.settings.points[node].x = p.x | 0;	// remove decimals "trunc"
		this.settings.points[node].y = p.y | 0;
		//this.updateTransformPoint(node, p, false);
		return this.nodeRefresh(node);
	}

	public nodeHighlightable(node: number): boolean {
		//any Wire node and that it is not a start|end bonded node
		return this.valid(node) //&& this.editMode
			&& (!(this.nodeBonds(node) && (node == 0 || node == this.last)))
	}

	public setPoints(points: IPoint[]): Wire {
		if (!isArr(points)
			|| points.length < 2)
			throw 'Poliwire min 2 points';
		//can only be called when editMode == false
		if (!this.editMode) {
			this.settings.points = points.map(p => new Point(p.x | 0, p.y | 0));
			//clean lines and set polyline new points
			this.settings.lines = [];
			this.refresh();
		}
		return this
	}

	public overNode(p: IPoint, ln: number): number {
		let
			endPoint = ln,
			lineCount = this.settings.lines.length,
			isLine = (ln: number) => ln && (ln <= lineCount),
			isAround = (p: IPoint, x: number, y: number) =>
				(x >= p.x - this.settings.pad) &&
				(x <= p.x + this.settings.pad) &&
				(y >= p.y - this.settings.pad) &&
				(y <= p.y + this.settings.pad);

		//if not in editMode, then ln will be 0, so reset to 1, and last point is the last
		!this.editMode && (ln = 1, endPoint = this.last, lineCount = 1);

		if (isLine(ln)) {
			return isAround(this.settings.points[ln - 1], p.x, p.y) ?
				ln - 1 :
				(isAround(this.settings.points[endPoint], p.x, p.y) ? endPoint : -1);
		}
		return -1;
	}

	public findLineNode(p: Point, line: number): number {
		let
			fn = (np: Point) => (Math.pow(p.x - np.x, 2) + Math.pow(p.y - np.y, 2)) <= 25;
		((line <= 0 || line >= this.last) && (line = this.findNode(p), 1))
			|| fn(this.settings.points[line])
			|| fn(this.settings.points[--line])
			|| (line = -1);
		return line;
	}

	//don't care if wire is in editMode or not
	public findNode(p: Point): number {
		for (let i = 0, thisP = this.settings.points[i], len = this.settings.points.length;
			i < len; thisP = this.settings.points[++i]) {
			//radius 5 =>  5^2 = 25
			if ((Math.pow(p.x - thisP.x, 2) + Math.pow(p.y - thisP.y, 2)) <= 25)
				return i;
		}
		return -1;
	}

	/**
	 * @description standarizes a wire node number to 0..points.length
	 * @param {number} node 0-based can be -1:last 0..points.length-1
	 * @returns {number} -1 for wrong node or standarized node number, where -1 == last, otherwise node
	 */
	public standarizeNode(node: number): number {
		if (this.valid(node))
			return node == -1 ? this.last : <any>node;
		return -1;
	}

	public windowProperties(): string[] { return ["id", "bonds"] }

	public prop(propName: string): ComponentPropertyType {
		//a wire discards position property this.p
		if (propName == "p")
			return <any>void 0;
		return super.prop(propName)
	}

	public propertyDefaults(): IWireProperties {
		return extend(super.propertyDefaults(), {
			name: "wire",
			class: "wire",
			highlightNodeName: "node",
			pad: 5,					// radius of the highlight circle
			color: "black",
			edit: false					// initial is false
		})
	}

}