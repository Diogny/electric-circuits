import { extend, aEL, removeClass, addClass, rEL } from "./dab"
import BaseWindow from "./base-window"
import { IBaseWindowOptions } from "./interfaces"

export default class DialogWindow extends BaseWindow {

	readonly titleHTML: HTMLHeadingElement;
	readonly messageHTML: HTMLHeadingElement;
	readonly contentHTML: HTMLDivElement;

	constructor(options: IBaseWindowOptions) {
		super(options);
		this.titleHTML = <HTMLHeadingElement>this.win.querySelector("div>h4");
		this.messageHTML = <HTMLHeadingElement>this.win.querySelector("div>h5");
		this.contentHTML = <HTMLDivElement>this.win.querySelector("div>div>div");
	}

	public showDialog(title: string, message: string, buttons: string[]): Promise<number> {
		let
			self = this as DialogWindow;
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
						option = parseInt(<any>(e.target as HTMLElement).getAttribute("dialog-option"));
					console.log(option);
					if (isNaN(option))
						return;
					cleanUp();
					resolve(option);
				},
				keyHandler = (ev: KeyboardEvent) => {
					if (ev.code == 'Escape') {
						cleanUp();
						resolve(cancelIndex);
					}
				};
			self.titleHTML.innerText = title;
			self.messageHTML.innerText = message;
			self.contentHTML.innerHTML =
				buttons.map((text: string, index: number) => {
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
			class: "win dialog no-select hide",
			templateName: "dialogWin01",
		})
	}

}