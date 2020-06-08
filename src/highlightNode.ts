import ItemBase from "./itemsBase";
import { Type } from "./types";
import { IHighlighNodeSettings } from "./interfaces";
import { extend, attr } from "./dab";
import { tag } from "./utils";

export default class HighlightNode extends ItemBase {

	protected settings: IHighlighNodeSettings;
	protected circle: SVGCircleElement;

	get type(): Type { return Type.HIGHLIGHT }
	get radius(): number { return this.settings.radius }

	get selectedId(): string { return this.settings.selectedId }
	get selectedNode(): number { return this.settings.selectedNode }

	constructor(options: IHighlighNodeSettings) {
		//override
		options.selectedNode = -1;
		options.selectedId = "";
		options.id = "highlighNode";
		super(options);
		this.g.setAttribute("svg-comp", "h-node");
		//remove color class, not needed yet
		this.g.classList.remove(this.color);
		this.circle = <SVGCircleElement>tag("circle", "", {
			"svg-type": "node",	// "node-x",
			r: this.radius
		});
		this.g.append(this.circle);
	}

	public setRadius(value: number): HighlightNode {
		this.circle.setAttribute("r", <any>(this.settings.radius = value <= 0 ? 5 : value));
		return this;
	}

	public hide(): HighlightNode {
		this.g.classList.add("hide");
		return this;
	}

	public show(x: number, y: number, id: string, node: number): HighlightNode {
		this.move(x, y);
		attr(this.circle, {
			cx: this.x,
			cy: this.y,
			//"node-x": <any>node,
			"node": <any>(this.settings.selectedNode = node)
		});
		this.settings.selectedId = id;
		this.g.classList.remove("hide");
		return this;
	}

	public propertyDefaults(): IHighlighNodeSettings {
		return extend(super.propertyDefaults(), {
			name: "h-node",
			class: "h-node",
			visible: false,
			radius: 5
		})
	}

}