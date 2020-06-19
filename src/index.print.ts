import { ipcRenderer } from "electron"
import { qS } from "./utils"

document.addEventListener("keydown", (ev: KeyboardEvent) => {
	if (ev.ctrlKey && ev.code == "KeyP") {
		ipcRenderer.sendSync("print-svg")
	}
	else if (ev.code == 'Escape') {
		ipcRenderer.sendSync("close-print-win")
	}
}, false);

let
	div = <HTMLDivElement>qS('#board'),
	answer = ipcRenderer.sendSync("get-svg");

if (answer.svg) {
	div.innerHTML = answer.svg;
}