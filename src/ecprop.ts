import ItemBoard from "./itemsBoard";
import Unit from "./units";
import { html } from "./utils";


export default class EcProp {

	prop: { value: string, label?: boolean, editable?: boolean, combo?: string[] } | string;
	unit?: Unit;
	readonly editable: boolean;
	readonly valueObject: boolean;
	html: HTMLElement;
	onChange: Function;

	get value(): string {
		return this.valueObject ? (this.editable ? <string>this.unit?.toString() : (<any>this.prop).value) : <string>this.prop
	}

	constructor(public ec: ItemBoard, public name: string, addTitle: boolean, onChange?: Function) {
		if (!(this.prop = ec.prop(name)))
			throw `invalid ec: ${ec.id}, prop: ${name}`;

		//valueObject is when not an string, and
		//editable when it's a valueObject with editable property == true
		if (this.editable = (this.valueObject = typeof this.prop != "string") && (<boolean>this.prop.editable == true)) {
			this.unit = new Unit((<any>this.prop).value);
		}
		let
			htmlProp: HTMLElement;
		//create html
		if (this.editable) {
			if ((<any>this.prop).combo) {
				//combo
				let
					options = [].map.call((<any>this.prop).combo, (element: string) => {
						return `<option value="${element}">${element}</option>`
					}).join('');
				htmlProp = <HTMLElement>html(`<select class="ec-prop">${options}</select>`)
			} else {
				//input
				htmlProp = <HTMLElement>html(`<input class="ec-prop" value="${this.value}">`)
			}
			//hook onchange event if editable
			let
				that = this as EcProp;
			onChange && (this.onChange = onChange, htmlProp.addEventListener('change', function () {
				//create new value
				if (that.editable) {
					if (htmlProp.nodeName == "INPUT") {
						that.prop = (<HTMLInputElement>htmlProp).value
					} else {
						//SELECT
						that.prop = (<HTMLSelectElement>htmlProp).selectedOptions[0].value
					}
					//create unit
					that.unit = new Unit(that.prop);
				} else {
					//check for valueObject here


					
					that.prop = htmlProp.innerText;
				}
				that.onChange.call(that, that.value);
			}));
		} else {
			//span
			htmlProp = <HTMLElement>html(`<span class="ec-prop">${this.value}</span>`)
		}
		//
		if (addTitle) {
			this.html = <HTMLSpanElement>html(`<span><label class="ec-prop-title">${name}</label></span>`);
			this.html.appendChild(htmlProp);
		} else {
			this.html = htmlProp;
		}
	}

}

/*
"properties" : {
		"capacitance" : {
			"editable" : true,
			"label" : true,
			"value" : "0.1mF"
		},
		"voltage": "50V",
		"tolerance": "2%",
		"description": "Generic capacitor",
		"voltage" : {
			"label" : true,
			"value" : "5V"
		},
		"current": "2500mA",
		"description" : "Generic LED diode",
		"notes": "color combo [green, blue, red, yellow, clear]. size combo [1.5mm, 3mm, 5mm]",
		"size" : {
			"editable" : true,
			"label" : true,
			"combo": [ "1.5", "3", "5" ],
			"value" : "3mm"
		}
},

*/