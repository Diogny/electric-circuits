import ItemBase from "./itemsBase";
import { Type } from "./types";
import { IHighlighNodeSettings } from "./interfaces";
import { extend, attr } from "./dab";
import { tag } from "./utils";
import Point from "./point";

export default class HighlightNode extends ItemBase {

	protected settings: IHighlighNodeSettings;
	protected mainNode: SVGCircleElement;

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
		this.mainNode = <SVGCircleElement>tag("circle", "", {
			"svg-type": "node",	// "node-x",
			r: this.radius
		});
		this.g.append(this.mainNode);
	}

	public setRadius(value: number): HighlightNode {
		this.mainNode.setAttribute("r", <any>(this.settings.radius = value <= 0 ? 5 : value));
		return this;
	}

	public hide(): HighlightNode {
		this.g.classList.add("hide");
		this.mainNode.classList.remove("hide");
		this.g.innerHTML = "";
		this.g.append(this.mainNode);
		return this;
	}

	public show(x: number, y: number, id: string, node: number): HighlightNode {
		this.move(x, y);
		attr(this.mainNode, {
			cx: this.x,
			cy: this.y,
			//"node-x": <any>node,
			"node": <any>(this.settings.selectedNode = node)
		});
		this.settings.selectedId = id;
		this.g.classList.remove("hide");
		return this;
	}

	public showConnections(nodes: Point[]): HighlightNode {
		this.mainNode.classList.add("hide");
		this.g.classList.remove("hide");
		nodes.forEach(p => {
			let
				circle = <SVGCircleElement>tag("circle", "", {
					cx: p.x,
					cy: p.y,
					r: this.radius,
					class: "node",
				});
			this.g.append(circle)
		})
		return this
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