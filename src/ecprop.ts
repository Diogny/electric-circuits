import { ItemBoard } from "./itemsBoard";
import Unit from "./units";
import { html } from "./utils";
import { ComponentPropertyType, IComponentProperty } from "./interfaces";
import { aEL } from "./dab";

//...still in progress ...
export default class EcProp {

	propValue: string;	//holds value no matter if prop is an object or just an string
	unit: Unit;
	readonly editable: boolean;
	readonly valueObject: boolean;	//true if property is an object
	html: HTMLDivElement;

	get value(): string {
		return this.unit ?
			this.unit.toString() :
			this.propValue
	}

	public refresh() { }	//placeholder

	constructor(public ec: ItemBoard, public name: string, public onChange?: Function, addLabel?: boolean) {
		let
			prop: ComponentPropertyType = ec.prop(name);

		if (!prop)
			throw `invalid ec: ${ec.id}, prop: ${name}`;

		//valueObject is when not an string, and
		//editable when it's a valueObject with readonly property == false
		if (this.editable = (this.valueObject = typeof prop == "object") && !(<boolean>prop.readonly)) {
			//set Unit only if defined
			((<IComponentProperty>prop).valueType == "unit")
				&& (this.unit = new Unit((<IComponentProperty>prop).value));
		}
		let
			htmlProp: HTMLElement,
			propObj = (this.valueObject ? prop : void 0) as IComponentProperty,
			that = this as EcProp;

		//hack to capture inside variables, not exposed outside
		this.refresh = function () {
			//get value from component property
			if (!propObj || !propObj.value) {		//to debug, catch error
				console.log('hhhmmmm');
			}
			that.propValue = propObj.value;
			//set it's UI value, so far only for INPUT, SPAN
			switch (htmlProp.nodeName) {
				case "INPUT":
					(<HTMLInputElement>htmlProp).value = that.propValue;
					break;
				case "SPAN":
					(<HTMLSpanElement>htmlProp).innerText = that.propValue
					break;
			}
		}
		//create html
		if (this.editable) {
			//prop is an object
			this.propValue = propObj.value;
			switch (propObj.type) {
				case "select":
					let
						options = [].map.call(propObj.options, (element: string) => {
							return `<option value="${element}"${(this.propValue == element ? " selected" : "")}>${element}</option>`
						}).join('');
					htmlProp = <HTMLElement>html(`<select class="prop">${options}</select>`);
					break;
				default:
					// "input", "point"
					htmlProp = <HTMLElement>html(`<input class="prop" value="${this.value}">`);
					break;
			}
			//hook onchange event if editable
			this.onChange && htmlProp.addEventListener('change', function () {
				//save new value
				if (htmlProp.nodeName == "INPUT") {
					that.propValue = (<HTMLInputElement>htmlProp).value
				} else {
					that.propValue = (<HTMLSelectElement>htmlProp).selectedOptions[0].value
				}
				//create unit if defined
				that.unit && (that.unit = new Unit(that.propValue));
				//set new value
				if (propObj.isProperty) {
					//we need feed back that it was successfully set
					//  only for INPUT for now
					!propObj.setValue(that.propValue)
						&& that.refresh();
				} else
					propObj.value = that.propValue;
				(<any>document.activeElement).blur();
				//call onchange event if any
				that.onChange?.call(that, that.value);
			});
		} else {
			this.propValue = propObj ? propObj.value : <string>prop;
			let
				classArr = ["prop"];
			(this.valueObject && propObj.readonly) && classArr.push("readonly");
			(this.valueObject && propObj.class) && classArr.push(propObj.class);
			htmlProp = <HTMLElement>html(`<span class="${classArr.join(' ')}">${this.propValue}</span>`)
		}
		//create property container
		this.html = <HTMLDivElement>document.createElement("div");
		this.html.classList.add("ec-container");
		if (addLabel) {
			let
				label = (propObj && propObj.label) ? propObj.label : name;
			this.html.appendChild(<HTMLSpanElement>html(`<span class="label">${label}</span>`));
		}

		if (propObj && propObj.type == "rotation") {
			let
				div = <HTMLDivElement>document.createElement("div");
			div.classList.add("rot");
			div.appendChild(<HTMLImageElement>html(`<img src="img/rot-left-16x16-p2.png" rot-angle="-45" title="Rotate left"/>`));
			div.appendChild(htmlProp);
			div.appendChild(<HTMLImageElement>html(`<img src="img/rot-right-16x16-p2.png" rot-angle="45" title="Rotate right"/>`));
			this.html.appendChild(div);
			//register click events
			div.querySelectorAll(".rot>img").forEach(((elem: HTMLElement) => {
				aEL(elem, "click", (e: MouseEvent) => {
					console.log((<HTMLElement>e.target).getAttribute("rot-angle"))
				}, false)
			}))
		}
		else
			this.html.appendChild(htmlProp);
	}
}