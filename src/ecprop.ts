import ItemBoard from "./itemsBoard";
import Unit from "./units";
import { html } from "./utils";
import { ComponentPropertyType, IComponentProperty } from "./interfaces";

//...still in progress ...
export default class EcProp {

	//holds value no matter if prop is an object or just an string
	propValue: string;
	//holds the unit value if it's a unit prop
	unit?: Unit;

	readonly editable: boolean;
	//true if property is an object
	readonly valueObject: boolean;
	html: HTMLElement;
	onChange: Function;

	get value(): string {
		return this.unit ?
			this.unit.toString() :
			this.propValue
	}

	public refresh() { }

	constructor(public ec: ItemBoard, public name: string, addTitle: boolean, onChange?: Function) {
		let
			prop: ComponentPropertyType = ec.prop(name);

		if (!prop)
			throw `invalid ec: ${ec.id}, prop: ${name}`;

		//valueObject is when not an string, and
		//editable when it's a valueObject with readonly property == false
		if (this.editable = (this.valueObject = typeof prop != "string") && !(<boolean>prop.readonly)) {
			//set Unit only if defined
			((<IComponentProperty>prop).type == "unit")
				&& (this.unit = new Unit((<IComponentProperty>prop).value));
		}
		let
			htmlProp: HTMLElement,
			that = this as EcProp;

		//hack to capture inside variables, not exposed outside
		this.refresh = function () {
			//get value from component property
			that.propValue = (<IComponentProperty>prop).value;
			//set it's UI value, so far only for INPUT
			(htmlProp.nodeName == "INPUT") && ((<HTMLInputElement>htmlProp).value = that.propValue);
		}

		//create html
		if (this.editable) {
			this.propValue = (<IComponentProperty>prop).value;
			if ((<IComponentProperty>prop).combo) {
				let
					options = [].map.call((<IComponentProperty>prop).combo, (element: string) => {
						return `<option value="${element}"${(this.propValue == element ? " selected" : "")}>${element}</option>`
					}).join('');
				htmlProp = <HTMLElement>html(`<select class="ec-prop">${options}</select>`)
			} else {
				htmlProp = <HTMLElement>html(`<input class="ec-prop" value="${this.value}">`)
			}
			//hook onchange event if editable
			onChange && (this.onChange = onChange, htmlProp.addEventListener('change', function () {
				//save new value
				if (htmlProp.nodeName == "INPUT") {
					that.propValue = (<HTMLInputElement>htmlProp).value
				} else {
					that.propValue = (<HTMLSelectElement>htmlProp).selectedOptions[0].value
				}
				//create unit if defined
				that.unit && (that.unit = new Unit(that.propValue));
				//set new value
				if ((<IComponentProperty>prop).type == "property") {
					//we need feed back that it was successfully set
					//  only for INPUT for now
					!(<IComponentProperty>prop).setValue(that.propValue)
						&& that.refresh();
				} else
					(<IComponentProperty>prop).value = that.propValue;
				(<any>document.activeElement).blur();
				//call onchange event if any
				that.onChange.call(that, that.value);
			}));
		} else {
			this.propValue = this.valueObject ? (<IComponentProperty>prop).value : <string>prop;
			let
				readonlySpan = this.valueObject && (<any>prop).readonly;
			htmlProp = <HTMLElement>html(`<span class="ec-prop${readonlySpan ? " readonly" : ""}">${this.propValue}</span>`)
		}
		if (addTitle) {
			//wrap title
			this.html = <HTMLSpanElement>html(`<span><label class="ec-prop-title">${(<IComponentProperty>prop).title || name}</label></span>`);
			this.html.appendChild(htmlProp);
		} else {
			this.html = htmlProp;
		}
	}

}