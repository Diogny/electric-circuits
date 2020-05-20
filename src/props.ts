//props.ts

import { attr, isFn, dP, typeOf, isInt, splat, isElement, isStr, isNumeric } from './dab';
import { IPropertyOptions, IPropertySettings, IPropertyCallback, IProperty } from './interfaces';
import { qS } from './utils';

export default class Prop implements IProperty {

	protected settings: IPropertySettings;

	get id(): string { return this.settings.id }
	get type(): string { return this.settings.type }
	get name(): string { return this.settings.name }
	get tag(): string | Element { return this.settings.tag }
	get html(): HTMLElement { return this.settings.html }
	get editable(): boolean { return this.settings.editable }

	get nodeName(): string { return this.html.nodeName.toLowerCase() }

	get onChange(): IPropertyCallback | undefined { return this.settings.onChange }

	set onChange(fn: IPropertyCallback | undefined) {
		isFn(fn) && (this.settings.onChange = fn)
	}

	get value(): number | string | string[] {
		let
			val = (<any>this.html)[this.settings.getter];	//select.selectedOptions
		if (!this.settings.htmlSelect) {
			switch (this.type) {
				case "integer":
					return isNaN(val = parseInt(val)) ? 0 : val
				case "number":
					return isNaN(val = parseFloat(val)) ? 0 : val
			}
			return val
		} else if (this.settings.selectMultiple) {
			return [].map.call(val, (option: HTMLOptionElement) => option.value)
		} else
			return (<HTMLSelectElement>this.html).options[val].value
	}

	set value(val: number | string | string[]) {
		if (!this.settings.htmlSelect) {
			let
				valtype = typeOf(val);

			if ((this.type == "text" && valtype == "string") ||
				(this.type == "boolean" && valtype == "boolean") ||
				(this.type == "integer" && isInt(val)) ||
				(this.type == "number" && isNumeric(val))
			)
				(<any>this.html)[this.settings.getter] = val;
		}
		else {
			//this.getsetSelect(<HTMLSelectElement>this.html, 'selectedIndex', splat(val));
			if (this.settings.selectMultiple) {
				let
					values = splat(val).map((num: any) => num + '');

				[].forEach.call((<any>this.html).options, (option: HTMLOptionElement) => {
					(values.indexOf(option.value) >= 0) && (option.selected = true)
				})
			} else {
				if (isStr(this.value)) {
					val = [].findIndex.call((<any>this.html).options,
						(option: HTMLOptionElement) => option.value == val
					)
				}
				(<HTMLSelectElement>this.html).selectedIndex = <number>val | 0
			}
		}
		//trigger the property change event
		this.selectionUiChanged(null);
	}

	constructor(options: IPropertyOptions) {
		//set default values
		this.settings = <IPropertySettings><unknown>{
			type: "text",
			selected: false,
			editable: false,
			getter: "value",
			htmlSelect: false,
			selectCount: 1,
			selectMultiple: false
		};
		if (!options
			|| !(this.settings.html = <HTMLElement>(isElement(options.tag) ? (options.tag) : qS(<string>options.tag)))
		)
			throw 'wrong options';
		//set event handler if any, this uses setter for type checking
		this.onChange = options.onChange;
		//copy toString function
		this.settings.toStringFn = options.toStringFn;
		//self contain inside the html dom object for onchange event
		(<any>this.html).dab = this;
		//set properties
		this.settings.tag = options.tag;
		this.settings.name = <string>this.html.getAttribute("name");
		this.settings.id = this.html.id || attr(this.html, "prop-id") || ('property' + Prop._propId++);

		switch (this.nodeName) {
			case 'input':
				this.settings.type = (<HTMLInputElement>this.html).type.toLowerCase();
				this.settings.editable = true;
				switch (this.type) {
					case 'radio':
					case 'checkbox':
						this.settings.type = "boolean";
						this.settings.getter = 'checked';
						break;
					case 'submit':
					case 'button':
						throw 'HTML input tag type invalid';
					case 'text':
					case 'number':
						//TML5 input types stays the same
						break;
					case 'password':
					case 'hidden':	//prop.type is text
					default:
						//•color	•date	•datetime	•datetime-local	•email	•month	•number	•range	•search
						//•tel	•time	•url	•week
						this.settings.type = 'text';
				}
				break;
			case 'textarea':
				this.settings.type = 'text';
				this.settings.editable = true;
				break;
			case 'select':
				this.settings.htmlSelect = true;
				switch ((<HTMLSelectElement>this.html).type.toLowerCase()) {
					case 'select-one':
						this.settings.getter = "selectedIndex";	//'<any>null';
						break;
					case 'select-multiple':
						this.settings.getter = "selectedOptions";	//'<any>null'
						this.settings.selectMultiple = true;
						break;
				}
				this.settings.type = "integer";
				//define properties for 'SELECT'
				let
					index: number = -1;
				this.settings.selectCount = (<any>this.html).length;
				//later return an array for select multiple
				dP(this, "index", {
					get: () => index,
					set(value: number) {
						(value >= 0 && value < this.settings.selectCount) &&	// this.options.length
							((index != -1) && (this.html.options[index].selected = !1),
								this.html.options[index = value].selected = !0,
								this.selectionUiChanged());
					}
				});

				dP(this, "selectedOption", {
					get: () => (<any>this.html).options[(<any>this.html).selectedIndex]
				});

				break;
			default:
				if (Prop.textOnly.indexOf(this.nodeName) >= 0) {
					this.settings.getter = 'innerText';
				} else
					throw `Unsupported HTML tag: ${this.nodeName}`;
		};
		//later see how can I register change event only for editable properties
		this.html.addEventListener('change', this.selectionUiChanged);
	}

	public toString(): string {
		return this.settings.toStringFn ? this.settings.toStringFn() : `${this.id}: ${this.value}`
	}

	private selectionUiChanged(e: any): void {
		//when comming from UI, this is the DOM Element
		// 	otherwise it's the property
		let
			prop: Prop | null = this instanceof Prop ? this : (<any>this).dab;
		if (prop && prop.onChange)
			prop.onChange(
				prop.value,			//this cache current value
				(e) ? 1 : 2,		// 1 == 'ui' : 2 == 'prop'
				prop,				//not needed, but just in case
				e					//event if UI triggered
			)
	}

	private static textOnly = "a|abbr|acronym|b|bdo|big|cite|code|dfn|em|i|kbd|label|legend|li|q|samp|small|span|strong|sub|sup|td|th|tt|var".split('|');
	private static _propId = 1;

}