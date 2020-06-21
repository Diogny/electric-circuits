import { IBaseWindowOptions } from "./interfaces";
import { extend, addClass, removeClass, empty, nano } from "./dab";
import { CircuitProperty } from "./circuit";
import DialogBase from "./dialog-base";

export class DialogWindow extends DialogBase {

	readonly contentHTML: HTMLHeadingElement;

	constructor(options: IBaseWindowOptions) {
		super(options);
		this.contentHTML = <HTMLHeadingElement>this.win.querySelector("div>h5");
	}

	public showDialog(title: string, message: string, buttons: string[]): Promise<number> {
		return this.promise(title, function () {
			(this as DialogWindow).contentHTML.innerText = message;
		}, buttons)
	}

	public showMessage(title: string, message: string): Promise<void> {
		return this.showDialog(title, message, ["OK"])
			.then(choice => {
				return Promise.resolve()
			})
			.catch(reason => {
				return Promise.resolve()
			})
	}

	public propertyDefaults(): IBaseWindowOptions {
		return extend(super.propertyDefaults(), {
			class: "win dialog box no-select hide",
			templateName: "dialogWin01",
		})
	}

}

export class FormWindow extends DialogBase {

	readonly contentHTML: HTMLFormElement;

	constructor(options: IBaseWindowOptions) {
		super(options);
		this.contentHTML = <HTMLFormElement>this.win.querySelector("div>form>fieldset");
	}

	public showDialog(title: string, formItems: CircuitProperty[]): Promise<number> {
		return this.promise(title, function () {
			(this as DialogWindow).contentHTML.innerHTML = formItems.map((item, index) => {
				let
					o: CircuitProperty = Object.create(item);
				!o.placeHolder && (o.placeHolder = o.label);
				(<any>o).index = index;
				(<any>o).class = item.visible ? "" : "hide";
				return nano((this as DialogWindow).app.templates[item.readonly ? "formFieldWinSpan" : "formFieldWinInput"], o)
			})
				.join('')
		}, ["Save", "Cancel"], function (choice: number) {
			let
				isRequired = (s: string, ndx: number) => (empty(s) && formItems[ndx].required);
			if (choice == 0
				&& (Array.from((this as DialogWindow).contentHTML.querySelectorAll("div>input"))
					.filter((elem: HTMLInputElement) => {
						let
							index = parseInt(<any>elem.getAttribute("index")),
							item = formItems[index];
						if (item
							&& !item.readonly
							&& isRequired(item.value = elem.value, index)
						) {
							(<any>elem.nextElementSibling).innerText = "required";
							removeClass(<any>elem.nextElementSibling, "hide");
							return true;
						}
						(<any>elem.nextElementSibling).innerText = "*";
						addClass(<any>elem.nextElementSibling, "hide");
					})).length
			)
				return false;
			return true
		})
	}

	public propertyDefaults(): IBaseWindowOptions {
		return extend(super.propertyDefaults(), {
			class: "win dialog form no-select hide",
			templateName: "formWin01",
		})
	}

}