import BaseWindow from "./base-window";
import { IBaseWindowOptions } from "./interfaces";
import { aEL, removeClass, rEL, addClass } from "./dab";

export default abstract class DialogBase extends BaseWindow {
	readonly titleHTML: HTMLHeadingElement;
	abstract readonly contentHTML: HTMLElement;
	readonly buttonsHTML: HTMLDivElement;

	constructor(options: IBaseWindowOptions) {
		super(options);
		this.titleHTML = <HTMLHeadingElement>this.win.querySelector("div>h4");
		this.buttonsHTML = <HTMLDivElement>this.win.querySelector("div>div>div");
	}

	protected promise(title: string, setContent: () => void,
		buttons: string[], validator?: (choise: number) => boolean): Promise<number> {
		let
			self = this as DialogBase;
		return new Promise(function (resolve, reject) {
			let
				cancelIndex = -1,
				cleanUp = () => {
					document.removeEventListener("keydown", keyHandler, false);
					rEL(self.buttonsHTML, "click", clickHandler, false);
					self.setVisible(false);
					addClass(self.win, "hide");
				},
				clickHandler = (e: MouseEvent) => {
					let
						choice = parseInt(<any>(e.target as HTMLElement).getAttribute("dialog-option"));
					if (isNaN(choice)
						|| (validator && !validator.call(self, choice)))
						return;
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
			setContent.call(self);
			self.buttonsHTML.innerHTML =
				buttons.map((text: string, index: number) => {
					if (text.toUpperCase() == "CANCEL")
						cancelIndex = index;
					return `<button dialog-option="${index}">${text}</button>`;
				})
					.join('');
			document.addEventListener("keydown", keyHandler, false);
			aEL(self.buttonsHTML, "click", clickHandler, false);
			self.setVisible(true);
			removeClass(self.win, "hide");
		})
	}
}