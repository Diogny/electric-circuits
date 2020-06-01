import { attr, obj, isStr, pojo, extend } from './dab';
import { tag, map, filter } from './utils';
import { Type } from "./types";
import { ITooltipText, ISize, ITooltipSettings } from "./interfaces";
import { Label } from './label';

export default class Tooltip extends Label {

	protected settings: ITooltipSettings;
	private svgRect: SVGRectElement;
	private gap: number;
	get type(): Type { return Type.TOOLTIP }

	get borderRadius(): number { return this.settings.borderRadius }

	/*	DOESN'T WORK
	set visible(value: boolean) {
		//weird way to access an ancestor property  super.visible doesn't work
		super["visible"] = value;
	}
	*/

	get size(): ISize {
		let b = this.t.getBBox();
		return obj({
			width: Math.round(b.width) + 10, //this.gap,
			height: Math.round(b.height) + this.gap
		})
	}

	constructor(options: ITooltipText) {
		super(options);
		this.svgRect = <SVGRectElement>tag("rect", "", {
			x: 0,
			y: 0,
			rx: this.borderRadius
		});
		this.g.insertBefore(this.svgRect, this.t);
	}

	public setVisible(value: boolean): Label {
		super.setVisible(value);
		//clear values
		//because Firefox give DOM not loaded on g.getBox() because it's not visible yet
		// so I've to display tooltip in DOM and then continue setting text, move, font-size,...
		this.text = this.t.innerHTML = '';
		return this;
	}

	public setBorderRadius(value: number): Tooltip {
		this.settings.borderRadius = value | 0;
		return this.build()
	}

	protected build(): Tooltip {
		this.gap = Math.round(this.fontSize / 2) + 1;
		attr(this.t, {
			"font-size": this.fontSize,
			x: Math.round(this.gap / 2), //+ 2, // + 1,
			y: this.fontSize //+ 8
		});
		let
			s = this.size;
		attr(this.svgRect, {
			width: s.width,
			height: s.height,
			rx: this.borderRadius
		});
		return this
	}

	public setText(value: string | any[]): Tooltip {
		let
			arr = isStr(value) ?
				(<string>value).split(/\r?\n/) :
				<[]>value,
			txtArray: string[] = [];
		//catch UI error here
		//if (!Array.isArray(arr)) {
		//	console.log("ooooh")
		//}
		this.t.innerHTML = arr.map((value: string | any[], ndx) => {
			let txt: string = '',
				attrs: string = '';
			if (isStr(value)) {
				txt = <string>value;
			} else if (pojo(value)) {
				txt = (<any>value).text;
				attrs = map(
					filter(value, (val: any, key: string) => key != 'text'),
					(v: string, k: string) => `${k}="${v}"`).join('');
			}
			txtArray.push(txt);
			return `<tspan x="5" dy="${ndx}.1em"${attrs}>${txt}</tspan>`
		}).join('');
		//set text
		this.text = txtArray.join('\r\n');
		return this.build()
	}

	public propertyDefaults(): ITooltipText {
		return extend(super.propertyDefaults(), {
			name: "tooltip",
			class: "tooltip",
			borderRadius: 4
		})
	}

}
//tooltip.move(200,50).setText("One line").visible = true;
//tooltip.move(200,50).setText("One line\r\nTwo lines and").visible = true;
//tooltip.move(200,50).setText([{ text : "One line" }, { text: "Two line and more..." } ]).visible = true;
//tooltip.move(200,50).setText([{ text : "One line" }, { text: "Two line and more...", fill: "blue"  } ]).visible = true;