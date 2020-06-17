import BaseWindow from "./base-window";
import { IBaseWindowOptions } from "./interfaces";
import { extend, rEL, addClass, aEL, removeClass } from "./dab";

export default class FormWindow extends BaseWindow {

	readonly titleHTML: HTMLHeadingElement;
	readonly formHTML: HTMLFormElement;
	readonly contentHTML: HTMLDivElement;

	constructor(options: IBaseWindowOptions) {
		super(options);
		this.titleHTML = <HTMLHeadingElement>this.win.querySelector("div>h4");
		this.formHTML = <HTMLFormElement>this.win.querySelector("div>form>fieldset");
		this.contentHTML = <HTMLDivElement>this.win.querySelector("div>div>div");
	}

	public showDialog(title: string,
		formItems: { label: string, value: string | number, placeHolder?: string, required?: boolean }[]
	): Promise<number> {
		let
			self = this as FormWindow;
		return new Promise(function (resolve, reject) {
			let
				cancelIndex = -1,
				cleanUp = () => {
					document.removeEventListener("keydown", keyHandler, false);
					rEL(self.contentHTML, "click", clickHandler, false);
					self.setVisible(false);
					addClass(self.win, "hide");
				},
				clickHandler = (e: MouseEvent) => {
					let
						choice = parseInt(<any>(e.target as HTMLElement).getAttribute("dialog-option"));
					if (isNaN(choice))
						return;
					if (choice == 0) {
						if ((Array.from(self.formHTML.querySelectorAll("div>input"))
							.filter((item: HTMLInputElement, index) => {
								if (!(formItems[index].value = item.value) && formItems[index].required) {
									removeClass(<any>item.nextElementSibling, "hide");
									return true;
								} else
									addClass(<any>item.nextElementSibling, "hide");
							})).length
						) {
							return;
						}
					}
					cleanUp();
					resolve(choice);
				},
				keyHandler = (ev: KeyboardEvent) => {
					if (ev.code == 'Escape') {
						cleanUp();
						resolve(cancelIndex);
					}
				};
			self.titleHTML.innerText = title;
			//form
			self.formHTML.innerHTML = formItems.map((item, index) => {
				let
					label = `<label for="dialog-form-${index}">${item.label}</label>`,
					placeHolder = item.placeHolder ? ` placeholder="${item.placeHolder}"` : "",
					input = `<input type="text" id="dialog-form-${index}"${placeHolder} />`,
					required = `<span class="hide"> *</span>`;
				return '<div class="pure-control-group">' + label + input + required + '</div>'
			})
				.join('')
			self.contentHTML.innerHTML =
				["Save", "Cancel"].map((text: string, index: number) => {
					if (text.toUpperCase() == "CANCEL")
						cancelIndex = index;
					return `<button dialog-option="${index}">${text}</button>`;
				})
					.join('');
			document.addEventListener("keydown", keyHandler, false);
			aEL(self.contentHTML, "click", clickHandler, false);
			self.setVisible(true);
			removeClass(self.win, "hide");
		});
	}

	public propertyDefaults(): IBaseWindowOptions {
		return extend(super.propertyDefaults(), {
			class: "win dialog form no-select hide",
			templateName: "formWin01",
		})
	}

}