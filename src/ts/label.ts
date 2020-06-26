import ItemBase from "./itemsBase";
import { Type } from "./types";
import { ITooltipSettings, ISize, ILabelText } from "./interfaces";
import { obj, aCld, attr, extend } from "./dab";
import { tag } from "./utils";

export class Label extends ItemBase {

	get type(): Type { return Type.LABEL }

	protected settings: ITooltipSettings;
	protected t: SVGTextElement;
	public text: string;

	get size(): ISize {
		let b = this.t.getBBox();
		return obj({
			width: Math.round(b.width),
			height: Math.round(b.height)
		})
	}

	get fontSize(): number { return this.settings.fontSize }

	constructor(options: ILabelText) {
		options.visible = false;
		super(options);
		this.text = '';
		this.t = <SVGTextElement>tag("text", "", {});
		aCld(this.g, this.t);
	}

	public move(x: number, y: number): Label {
		super.move(x, y);
		attr(this.g, { transform: "translate(" + this.x + " " + this.y + ")" });
		return this;
	}

	public setFontSize(value: number): Label {
		this.settings.fontSize = value;
		return this.build()
	}

	protected build(): Label {
		attr(this.t, {
			"font-size": this.fontSize,
			x: 0,
			y: 0
		});
		return this;
	}

	public setText(value: string): Label {
		this.t.innerHTML = this.text = value;
		return this.build()
	}

	public propertyDefaults(): ILabelText {
		return extend(super.propertyDefaults(), {
			name: "label",
			class: "label",
			fontSize: 50
		})
	}

}