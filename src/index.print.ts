import { ipcRenderer } from "electron"
import { qS, templatesDOM } from "./ts/utils"
import Rect from "./ts/rect";
import { aEL, attr } from "./ts/dab";
import { DialogWindow } from "./ts/dialog-windows";
import { Templates } from "./ts/templates";

let
	div = <HTMLDivElement>qS('#board'),
	controls = <HTMLDivElement>qS('#board-controls'),
	svg: SVGElement = <any>void 0,
	rects: { zoom: string, rect: Rect }[] = <any>void 0,
	isPrinting = false,
	printSVG = () => {
		controls.classList.add("hide");
		isPrinting = true;
		ipcRenderer.sendSync("print-svg");
	},
	msgBox: DialogWindow,
	clickHandler = (e: MouseEvent) => {
		let
			target = e.target as HTMLInputElement,
			index = parseInt(<string>target.getAttribute("data-index"));
		(<any>document.activeElement).blur();
		if (target.value == "Print") {
			printSVG();
		} else {
			setViewBox(index);
		}
	},
	setViewBox = (index: number) => {
		if (!rects || !svg)
			return;
		let
			item = rects[index],
			input = <HTMLInputElement>controls.children[index],
			selected = <HTMLInputElement>Array.from(controls.children)
				.find((item: HTMLInputElement) => item.classList.contains("selected"))
		selected && selected.classList.remove("selected");
		input.classList.add("selected");
		attr(svg, { "viewBox": `${item.rect.x} ${item.rect.y} ${item.rect.width} ${item.rect.height}` });
	};

ipcRenderer.on("after-print", (event, arg) => {
	controls.classList.remove("hide");
	isPrinting = false;
	if (arg.failureReason)
		msgBox.showMessage("Print Information", arg.failureReason);
});

templatesDOM("dialogWin01")
	.then(tmpls => {
		Templates.register(tmpls);
		msgBox = new DialogWindow(<any>{
			id: "win-dialog",
		});
		qS('body').append(msgBox.win);
		(<any>window).dialog = msgBox;
		let
			answer = ipcRenderer.sendSync("get-svg");
		if (answer.svg) {
			document.addEventListener("keydown", (ev: KeyboardEvent) => {
				if (ev.ctrlKey && ev.code == "KeyP") {
					printSVG();
				}
				else if (ev.code == 'Escape') {
					ipcRenderer.sendSync("close-print-win")
				}
			}, false);
			rects = answer.rects;
			controls.innerHTML = rects.map((o, ndx) => {
				return `<input type="button" value="${o.zoom}" data-index="${ndx}">`
			})
				.concat(['<input type="button" value="Print">'])
				.join('');
			Array.from(controls.children)
				.forEach((item: HTMLElement) => aEL(item, "click", clickHandler, false));
			div.innerHTML = answer.svg;
			svg = <SVGElement>div.querySelector("svg");
			setViewBox(rects.length - 1);
		} else {
			msgBox.showMessage("Print Information", answer.message);
		}
	})
