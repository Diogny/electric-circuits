
import { IHighlightable } from "./interfaces";
import Point from "./point";
import { tag } from "./utils";
import { attr } from "./dab";

export default class BoardCircle implements IHighlightable {

	protected settings: IHighlightable;

	get visible(): boolean { return this.settings.visible }
	get p(): Point { return this.settings.p }
	get nodeName(): string { return this.settings.nodeName }
	get nodeValue(): number { return this.settings.nodeValue }
	get radius(): number { return this.settings.radius }
	get g(): SVGCircleElement { return this.settings.g }

	constructor(nodeName: string) {
		//set initial default values
		this.settings = <IHighlightable>{
			nodeName: nodeName || "node",
			nodeValue: -1,
			visible: false,
			radius: 5,
			p: Point.origin
		}
		//create SVG DOM Element
		let
			tagAttrs: any = this.getObjectSettings();
		//set svg-type and nodeName value for 'node'
		tagAttrs["svg-type"] = this.nodeName;
		tagAttrs[this.nodeName] = this.nodeValue;
		//create SVG
		this.settings.g = <SVGCircleElement>tag("circle", "", tagAttrs);
	}

	public getDomRadius(): number {
		return parseInt(attr(this.g, "r"))
	}

	move(x: number, y: number): BoardCircle {
		this.settings.p = new Point(x, y);
		return this;
	}

	public setRadius(value: number): BoardCircle {
		this.settings.radius = value <= 0 ? 5 : value;
		return this.refresh();
	}

	public hide(): BoardCircle {
		this.settings.visible = false;
		this.settings.p = Point.origin;
		this.settings.nodeValue = -1;
		return this.refresh();
	}

	public show(nodeValue: number): BoardCircle {
		this.settings.visible = true;
		// this.p  moved first
		this.settings.nodeValue = nodeValue;
		return this.refresh();
	}

	private getObjectSettings(): any {
		let
			o: any = {
				cx: this.p.x,
				cy: this.p.y,
				r: this.radius,
				class: this.visible ? "" : "hide"
			};
		(<any>o)[this.nodeName] = this.nodeValue;
		return o;
	}

	public refresh(): BoardCircle {
		return (attr(this.g, this.getObjectSettings()), this)
	}

}