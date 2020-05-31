import { ipcRenderer } from "electron";
import { templatesDOM, qSA, qS } from "./src/utils"
import * as fs from 'fs';
import {
	IComponentOptions, IApplicationOptions,
	StateType as State, ActionType as Action, IMachineState, IMouseState, IItemNode
} from "./src/interfaces";
import Comp from "./src/components";
import { MyApp } from "./src/myapp";
import { attr, aEL, removeClass, toggleClass, addClass, getParentAttr } from "./src/dab";
import Point from "./src/point";
import Wire from "./src/wire";
import StateMachine from "./src/stateMachine";
import { Type } from "./src/types";
import { ItemBoard } from "./src/itemsBoard";
import Size from "src/size";

let
	app: MyApp = <any>void 0;

//https://www.electronjs.org/docs/tutorial/security

function selectedTool(): string {
	let
		ui = qS(".bar-item[tool].selected");
	return !ui ? "" : attr(ui, "tool");
}

function noToolSelectedOr(toolName: string) {
	let
		tool = selectedTool();
	return !tool || tool == toolName;
}

function enableDisableTools() {
	if (selectedTool()) {
		//disable
		attr(app.prop("comp_option").html, {
			disabled: true
		})
	} else {
		//enable
		app.prop("comp_option").html?.removeAttribute("disabled");
	}
}

function hookEvents() {
	//ZOOM controls
	qSA('.bar-item[data-scale]').forEach((item: any) => {
		aEL(item, "click", (e: MouseEvent) => {
			let
				scaleTarget = getParentAttr(<HTMLElement>e.target, "data-scale"),
				o = attr(scaleTarget, "data-scale"),
				m = parseFloat(o);
			if (app.multiplier == m)
				return;
			app.setViewBox(m);
			//remove all selected class
			qSA('.bar-item[data-scale].selected').forEach((item: any) => {
				removeClass(item, "selected");
			});
			toggleClass(scaleTarget, "selected");
		}, false);
	});
	//Rotations
	aEL(qS('.bar-item[rot-dir="left"]'), "click", () => app.rotateEC(-45), false);
	aEL(qS('.bar-item[rot-dir="right"]'), "click", () => app.rotateEC(45), false);
	//wire editing
	aEL(qS('.bar-item[tool="wire-edit"]'), "click", (e: MouseEvent) => {
		if (!noToolSelectedOr("wire-edit")) {
			return;		//there's a selected tool
		}
		let
			wire: Wire = app.wire,
			transition: Action,
			fn = (b: any) => b ? "ON" : "OFF",
			toolTarget = getParentAttr(<HTMLElement>e.target, "tool");
		if (!wire)
			return;
		if (wire.editMode = !wire.editMode) {
			addClass(toolTarget, "selected");
			transition = Action.START;
		}
		else {
			removeClass(toolTarget, "selected");
			transition = Action.STOP;
		}
		//change tooltip title
		attr(e.target, { title: `Wire edit is ${fn(wire.editMode)}` });
		enableDisableTools();
		app.execute(Action.UNSELECT_ALL, "");
		app.state.transition(State.WIRE_EDIT, transition, void 0);
	}, false);
	//HtmlWindow
	/*aEL(qS('.bar-item[tool="ec-props"]'), "click", (e: MouseEvent) => {
		app.winProps.setVisible(!app.winProps.visible);
	}, false);*/
	//add component
	aEL(qS('.bar-item[action="comp-create"]'), "click", () => app.addComponent(<string>app.prop("comp_option").value), false);
}

function createStateMachine() {
	let
		actionDefaultCopyNewState = function (newCtx: IMouseState) {
			app.state.ctx = newCtx;		//for now just copy data
		},
		actionOutOfTool = function (newCtx: IMouseState) {
			if (!app.insideBoard(newCtx.offset)) {
				//this means to hide node and tooltip ONLY if going out of the board
				app.state.send(Action.HIDE_NODE, newCtx);
				app.topBarLeft.innerHTML = "&nbsp;";
				//app.state.ctx == newCtx;		//save new context
			}
		};
	app.state.register(<IMachineState>{
		key: State.IDLE,
		overType: "forward",
		actions: {
			//transitions
			RESUME: function (newCtx: IMouseState) { }
		}
	});
	app.state.register(<IMachineState>{
		key: State.BOARD,
		overType: "forward",
		actions: {
			MOVE: function (newCtx: IMouseState) {
			},
			OUT: actionOutOfTool,
			DOWN: actionDefaultCopyNewState,
			UP: function (newCtx: IMouseState) {
				actionDefaultCopyNewState(newCtx);
				if (newCtx.button == 0)
					app.execute(Action.UNSELECT_ALL, 'board::board::board');
				app.rightClick.setVisible(false);
			},
			//transitions
			START: function (newCtx: IMouseState) {
				//uses machine current state
				app.state.send(Action.HIDE_NODE, (this as StateMachine).ctx);
				(this as StateMachine).ctx = newCtx;		//save new context
			}
		}
	});
	app.state.register(<IMachineState>{
		key: State.EC_NODE,
		overType: "forward",
		actions: {
			MOVE: function (newCtx: IMouseState) {
				(this as StateMachine).ctx = newCtx;		//copy data
				let
					p = Point.translateBy((this as StateMachine).ctx.offset, 20);
				app.tooltip.move(p.x, p.y);
			},
			OUT: actionOutOfTool,
			UP: function (newCtx: IMouseState) {
				(this as StateMachine).ctx = newCtx;		//save new context
				//check Ctrl-Click
				if ((this as StateMachine).ctx.ctrlKey) {
					//console.log(`Ctrl+Click on EC node, start wiring`);
				}
			},
			//transitions
			START: function (newCtx: IMouseState) {
				(this as StateMachine).ctx = newCtx;		//save new context
				app.state.send(Action.SHOW_NODE_TOOLTIP, (this as StateMachine).ctx);
			}
		}
	});
	app.state.register(<IMachineState>{
		key: State.EC_DRAG,
		overType: "deny",
		actions: {
			MOVE: function (newCtx: IMouseState) {
				//newCtx.offset has the updated offset, don't save anything here
				(this as StateMachine).ctx.dragging.forEach(comp => {
					let
						p = Point.minus(newCtx.offset, comp.offset);
					comp.ec.move(p.x, p.y);
				});
				(app.ec?.id == app.winProps.compId) && app.winProps.property("p")?.refresh();
			},
			OUT: function () {
				//has to be empty so dragging is not STOP when passing over another component
				//console.log("ec_dragging.OUT");
			},
			DEFAULT: function (newCtx: IMouseState) {
				//this catches the UP action too,  stops dragging
				removeClass(app.svgBoard, (this as StateMachine).ctx.className);
				app.state.transition(State.EC_BODY, Action.START, newCtx);
			},
			//transitions
			START: function (newCtx: IMouseState) {
				let
					self = this as StateMachine;
				self.ctx = newCtx;		//save new context
				//show mouse cursor
				addClass(app.svgBoard, self.ctx.className = "dragging");
				//add to context vector
				!app.selectedComponents.some(comp => comp.id == newCtx.it.id) &&
					(app.execute(Action.SELECT, `${newCtx.it.id}::${newCtx.it.name}::body`));
				//new way for multiple drag
				self.ctx.dragging =
					app.selectedComponents.map(comp => ({
						ec: comp,
						offset: Point.minus(newCtx.offset, comp.p)
					}));
				app.state.send(Action.HIDE_NODE, newCtx);
			}
		}
	});
	app.state.register(<IMachineState>{
		key: State.EC_BODY,
		overType: "forward",
		actions: {
			MOVE: function (newCtx: IMouseState) {
				if ((this as StateMachine).ctx.event == "down"
					&& (this as StateMachine).ctx.button == 0) {
					app.state.transition(State.EC_DRAG, Action.START, newCtx);
					return;
				}
				(this as StateMachine).ctx = newCtx;		//save new context
				let
					p = Point.translateBy((this as StateMachine).ctx.offset, 20);
				app.tooltip.move(p.x, p.y);
			},
			OUT: actionOutOfTool,
			DOWN: actionDefaultCopyNewState,
			UP: function (newCtx: IMouseState) {	//up after down should be show properties, not now
				actionDefaultCopyNewState(newCtx);
				//must exists an ec
				newCtx.it && (newCtx.button == 0)
					&& app.execute(
						newCtx.ctrlKey ?
							Action.TOGGLE_SELECT :  // Ctrl+click	=> toggle select
							Action.SELECT,  		// click		=> select one
						[newCtx.it.id, newCtx.it.name, "body"].join('::'));
			},
			//transitions
			START: function (newCtx: IMouseState) {
				//uses machine current state
				app.state.send(Action.HIDE_NODE, (this as StateMachine).ctx);
				(this as StateMachine).ctx = newCtx;		//save new context
				app.state.send(Action.SHOW_BODY_TOOLTIP, (this as StateMachine).ctx);
			},
			/*AFTER_DRAG: function (newCtx: IMouseState) {
				app.state.send(Action.SHOW_BODY_TOOLTIP, newCtx);
			}*/
		}
	});
	app.state.register(<IMachineState>{
		key: State.WIRE_LINE,
		overType: "forward",
		actions: {
			MOVE: function (newCtx: IMouseState) {
				if (!newCtx.it) {
					//console.log('NO Component');
					return
				}
				let
					p = Point.translateBy(newCtx.offset, 20);
				app.tooltip.setVisible(true)
					.move(p.x, p.y)
					.setFontSize(app.tooltipFontSize())
					.setText(newCtx.it.id);
			},
			UP: function (newCtx: IMouseState) {	//up after down should be show properties, not now
				actionDefaultCopyNewState(newCtx);
				//must exists an ec
				newCtx.it && (newCtx.button == 0)
					&& app.execute(
						newCtx.ctrlKey ?
							Action.TOGGLE_SELECT :  // Ctrl+click	 => toggle select
							Action.SELECT,  		// click		 => select one
						[newCtx.it.id, newCtx.it.name, "line"].join('::'));
			},
			OUT: actionOutOfTool,
			DEFAULT: actionDefaultCopyNewState,	//state must be saved so MOVE can capture prev
			//transitions
			START: function (newCtx: IMouseState) {
				app.state.send(Action.HIDE_NODE, (this as StateMachine).ctx);	//hides previous node tooltip if any
			}
		}
	});
	app.state.register(<IMachineState>{
		key: State.WIRE_EDIT,
		overType: "function",
		actions: {
			OVER: function (newCtx: IMouseState) {
				//gets here when over any component: board, EC, Wire,...
				if (newCtx.it) {
					//real component, EC or Wire
					switch (newCtx.over.type) {
						case "node":
							//only node from a Wire in editMode allowed for now
							if ((<Wire>newCtx.it).editMode) {
								//console.log("WIRE_EDIT.OVER -> WIRE_EDIT_NODE.OVER");
								app.state.transition(State.WIRE_EDIT_NODE, Action.START, newCtx);
							}
							break;
						case "body":
							app.state.transition(State.WIRE_EDIT_EC, Action.START, newCtx);
						default:
							//"line"
							//console.log(`WIRE_EDIT over ${newCtx.over.type} of: ${newCtx.it.id}`)
							break;
					}
				}
			},
			MOVE: function (newCtx: IMouseState) {
				let
					self = this as StateMachine;
				if (!newCtx.it || !(<Wire>newCtx.it).editMode) {
					//console.log("MOVE on wire_edit -not over wire in edit mode!");
					return;
				}
				if (self.ctx.event == "down") {
					//can't drag first or last line if bonded
					let
						ln = self.ctx.over.line;
					if ((ln == 1 && self.ctx.it.nodeBonds(0))
						|| (ln == (<Wire>self.ctx.it).lastLine && self.ctx.it.nodeBonds((<Wire>self.ctx.it).last))) {
						//console.log("cannot drag bonded wire line");
					} else {
						//console.log("start wire line dragging");
						app.state.transition(State.WIRE_EDIT_LINE_DRAG, Action.START, newCtx);
					}
					return;
				}
				//editMode = true
				actionDefaultCopyNewState(newCtx);
				//check if mouse is close enough to a wire node
				let
					node = self.ctx.it.overNode(self.ctx.offset, self.ctx.over.line);
				if (node != -1 && (newCtx.ctrlKey || self.ctx.it.nodeHighlightable(node))) {
					self.ctx.it.showNode(node);
				} else {
					self.ctx.it.hideNode();
				}
			},
			DEFAULT: actionDefaultCopyNewState,	//state must be saved so MOVE can capture prev
			OUT: actionOutOfTool,
			UP: function (newCtx: IMouseState) {
				(this as StateMachine).ctx = newCtx;		//save new context
				app.rightClick.setVisible(false);
				//check Ctrl-Click
				if ((this as StateMachine).ctx.ctrlKey) {
					//console.log(`Ctrl+Click on Wire line`);
				}
			},
			//transitions
			RESUME: function (newCtx: IMouseState) {
				//gets here from WIRE_EDIT_NODE
				app.state.send(Action.HIDE_NODE, (this as StateMachine).ctx);
				//don't call action "Move" because then it's called two times
				//app.state.send("MOVE", newCtx);
				//console.log("wire_edit.RESUME transition ");
			},
			START: function () {
				//console.log("wire_edit.START transition - start wiring editing");
			},
			STOP: function () {
				//console.log("WIRE_EDIT.STOP transition - stop wiring editing");
				app.state.transition(State.IDLE, Action.DEFAULT, void 0);	//go idle
			}
		}
	});
	app.state.register(<IMachineState>{
		key: State.WIRE_EDIT_NODE,
		overType: "deny",
		actions: {
			OUT: function (newCtx: IMouseState) {
				app.state.transition(State.WIRE_EDIT, Action.RESUME, newCtx);
			},
			MOVE: function (newCtx: IMouseState) {
				if ((this as StateMachine).ctx.event == "down") {
					app.state.transition(State.WIRE_EDIT_NODE_DRAG, Action.START, newCtx);
				}
			},
			DOWN: function (newCtx: IMouseState) {
				(this as StateMachine).ctx = newCtx;		//save new context
			},
			UP: function (newCtx: IMouseState) {
				(this as StateMachine).ctx = newCtx;		//save new context
				//check Ctrl-Click
				if ((this as StateMachine).ctx.ctrlKey) {
					//console.log(`Ctrl+Click on Wire node`);
				}
			},
			//transitions
			START: function (newCtx: IMouseState) {
				//we get here from wire_edit, so far do nothing
				//console.log("WIRE_EDIT_NODE.OVER transition");
			}
		}
	});
	app.state.register(<IMachineState>{
		key: State.WIRE_EDIT_NODE_DRAG,
		overType: "deny",
		actions: {
			MOVE: function (newCtx: IMouseState) {
				let
					self = this as StateMachine;
				//newCtx.offset has the updated offset, don't save anything here
				//update wire node location
				if (self.ctx.it && self.ctx.it.type == Type.WIRE) {
					//for some reason it's trying to setNode on an EC
					self.ctx.it.setNode(self.ctx.over.nodeNumber, newCtx.offset);
					//update highlighted wire node location
					self.ctx.it.showNode(self.ctx.over.nodeNumber);

					if (self.ctx.isEdgeNode) {
						let
							bond: { ec: ItemBoard, node: number } = <any>void 0;
						//tests if over an EC node
						Comp.each((ec) => {
							if (bond || ec.type != Type.EC)
								return;
							if (ec.rect().inside(newCtx.offset)) {
								let
									node = ec.overNode(newCtx.offset, 1);
								if (node != -1) {
									bond = {
										ec: ec,
										node: node
									};
									////console.log(`inside: ${ec.id}:[${node}]`)
								}
							}
						});
						//deselect previous ec if any
						self.ctx.bond && self.ctx.bond.ec.select(false);
						//persists bond data
						self.ctx.bond = bond;
						//select new matched ec node if any
						bond && bond.ec.select(true);
					}
				}
			},
			UP: function (newCtx: IMouseState) {
				let
					self = this as StateMachine;
				removeClass(app.svgBoard, <string>self.ctx.className);
				//released over an EC node
				if (self.ctx.bond) {
					//deselect matched ec node
					self.ctx.bond.ec.select(false);
					//bond components
					self.ctx.it?.bond(self.ctx.nodeNumber,
						self.ctx.bond.ec, self.ctx.bond.node);
					//console.log(`inside: ${self.ctx.bond.ec.id}:[${self.ctx.bond.node}]`);
					app.state.transition(State.WIRE_EDIT, Action.RESUME, newCtx);
				} else {
					app.state.transition(State.WIRE_EDIT_NODE, Action.START, newCtx);
				}
			},
			OUT: function () {
				//has to be empty so dragging is not STOP when passing over another component
				//console.log("ec_dragging.OUT");
			},
			DEFAULT: function (newCtx: IMouseState) {
				//this catches the UP action too
				//stops dragging, hide mouse cursor
				removeClass(app.svgBoard, <string>(this as StateMachine).ctx.className);
				app.state.transition(State.WIRE_EDIT_NODE, Action.START, newCtx);
			},
			//transitions
			START: function (newCtx: IMouseState) {
				let
					self = this as StateMachine;
				//save new context only here, because what changes is only position
				self.ctx = newCtx;
				self.ctx.nodeNumber = self.ctx.over.nodeNumber;
				self.ctx.isEdgeNode = self.ctx.nodeNumber == 0 || self.ctx.nodeNumber == (<Wire>self.ctx.it)?.last;
				let
					bonds = newCtx.it.nodeBonds(self.ctx.nodeNumber);
				bonds?.to.forEach(element => {
					newCtx.it.unbond(self.ctx.nodeNumber, element.id);
				});
				addClass(app.svgBoard, self.ctx.className = "drag-node");
			}
		}
	});
	app.state.register(<IMachineState>{
		key: State.WIRE_EDIT_LINE_DRAG,
		overType: "deny",
		actions: {
			MOVE: function (newCtx: IMouseState) {
				//newCtx.offset has the updated offset, don't save anything here
				let
					self = this as StateMachine,
					ln = self.ctx.over.line;

				self.ctx.it?.setNode(ln - 1, Point.minus(newCtx.offset, self.ctx.A));
				self.ctx.it?.setNode(ln, Point.minus(newCtx.offset, self.ctx.B));
			},
			OUT: function () {
				//has to be empty so dragging is not STOP when passing over another component
				//console.log("ec_dragging.OUT");
			},
			DEFAULT: function (newCtx: IMouseState) {
				//this catches the UP action too
				removeClass(app.svgBoard, (this as StateMachine).ctx.className);
				app.state.transition(State.WIRE_EDIT, Action.RESUME, newCtx);
			},
			//transitions
			START: function (newCtx: IMouseState) {
				let
					self = this as StateMachine;
				//hide previous wire node if any selected
				app.state.send(Action.HIDE_NODE, self.ctx);
				//save new context only here, because what changes is only position
				self.ctx = newCtx;
				self.ctx.className = "drag-node";
				//show mouse cursor
				addClass(app.svgBoard, "drag-node");
				//add to context vector
				let
					ln = self.ctx.over.line;
				self.ctx.A =
					Point.minus(self.ctx.offset, <IItemNode>self.ctx.it?.getNode(ln - 1));
				self.ctx.B =
					Point.minus(self.ctx.offset, <IItemNode>self.ctx.it?.getNode(ln));
			}
		}
	});
	app.state.register(<IMachineState>{
		key: State.WIRE_EDIT_EC,
		overType: "function",
		actions: {
			OVER: function (newCtx: IMouseState) {
				app.state.transition(State.WIRE_EDIT, Action.RESUME, newCtx);
			},
			MOVE: function (newCtx: IMouseState) {
				if ((this as StateMachine).ctx.event == "down"
					&& (this as StateMachine).ctx.button == 0) {
					app.state.transition(State.WIRE_EDIT_EC_DRAG, Action.START, newCtx);
				}
			},
			OUT: actionOutOfTool,
			DOWN: actionDefaultCopyNewState,
			//transitions
			START: function (newCtx: IMouseState) {
				(this as StateMachine).ctx = newCtx;	//save new context
			}
		}
	});
	app.state.register(<IMachineState>{
		key: State.WIRE_EDIT_EC_DRAG,
		overType: "deny",
		actions: {
			MOVE: function (newCtx: IMouseState) {
				//newCtx.offset has the updated offset, don't save anything here
				(this as StateMachine).ctx.dragging.forEach(comp => {
					let
						p = Point.minus(newCtx.offset, comp.offset);
					comp.ec.move(p.x, p.y);
				});
				(newCtx.it.id == app.winProps.compId) && app.winProps.property("p")?.refresh();
			},
			OUT: function () {
				//has to be empty so dragging is not STOP when passing over another component
				//console.log("ec_dragging.OUT");
			},
			DEFAULT: function (newCtx: IMouseState) {
				//this catches the UP action too, stops dragging
				removeClass(app.svgBoard, (this as StateMachine).ctx.className);
				app.state.transition(State.WIRE_EDIT_EC, Action.START, newCtx);
			},
			//transitions
			START: function (newCtx: IMouseState) {
				let
					self = this as StateMachine;
				self.ctx = newCtx;						//save new context
				addClass(app.svgBoard, self.ctx.className = "dragging");		//show mouse cursor
				//we've just one component here,  new way for multiple drag
				self.ctx.dragging = [{
					ec: newCtx.it,
					offset: Point.minus(newCtx.offset, newCtx.it.p)
				}]
			}
		}
	});
}

function readJson(path: string): any {
	//load default circuit library
	var data = fs.readFileSync(path);
	//console.log(data);
	let
		json = JSON.parse(data.toString().replace(/[\t\r\n]*/g, ""));
	return json
}

window.addEventListener("DOMContentLoaded", () => {

	//load DOM script HTML templates
	templatesDOM("viewBox01|size01|point01|baseWin01|ctxWin01|ctxItem01|propWin01")
		.then(async (templates: Object) => {

			const d = await ipcRenderer.invoke('shared', 'app');
			console.log("global.app =", d)

			//load default circuit library
			let
				json = readJson('./dist/data/library-circuits.v2.json');
			//register components
			json.forEach((element: IComponentOptions) => {
				Comp.register(element);
			});
			//read context menu data
			json = readJson('./dist/data/context-menu.json');

			app = new MyApp(<IApplicationOptions>{
				templates: templates,
				includePropsInThis: true,
				props: {
					rot_lbl: {
						tag: "#rot-lbl"
					},
					comp_option: {
						tag: "#comp-option",
						onChange: function (value: number | string | string[], where: number) {
							if (where != 1)		// 1 == "ui"
								return;
							//create and save
							//(<any>window).ec = app.ec = createComponent(<string>value);
							//new component has rotation == 0
							//updateRotation();
						}
					}
				},
				list: json
			});

			//set SVG viewBox values
			updateViewBox(ipcRenderer.sendSync('get-win-size', ''));

			//add HtmlWindow to board
			app.board.appendChild(app.winProps.win);
			//add right-click window
			app.board.appendChild(app.rightClick.win);

			//this's the top SVG element and all other are inserted before, so it's always ON TOP z-index max
			//add text tooltip to SVG DOM
			app.svgBoard.append(app.tooltip.g);

			hookEvents();
			createStateMachine();

			//enable state machine to accept commands
			app.state.enabled = true;


			//////////////////// TESTINGS /////////////////

			//create default EC first
			app.addComponent(<string>app.prop("comp_option").value);

			(<any>window).wire = app.addComponent("wire");

			//testings
			//to debug faster
			//(<any>window).win = app.winProps;
			//(<any>window).combo = app.prop("comp_option");
			//(<any>window).board = app.board;
			(<any>window).tooltip = app.tooltip;
			(<any>window).rc = app.rightClick;
			//(<any>window).compColor = app.prop("comp_color");

			//(<any>window).Colors = Colors;
			//(<any>window).Unit = Unit;
			//var u = new Unit("2.5mV");	//console testings k = new unit.constructor("3mW");
			//(<any>window).Prop = Prop;
			//(<any>window).EcProp = EcProp;
			//var p = new Prop({ tag: "#inp02", onChange : function(e) { console.log(e) } })

			(<any>window).MyApp = app;

			const replaceText = (selector: string, text: string) => {
				const element = document.getElementById(selector);
				if (element) {
					element.innerText = text;
				}
			};

			for (const type of ["chrome", "node", "electron"]) {
				replaceText(`${type}-version`, (process.versions as any)[type]);
			}

			//////////////////// TESTINGS /////////////////

		})
		.catch((ex: any) => {
			console.log(ex)
		});
});

function updateViewBox(arg: any) {
	//set body height
	qS("body").style.height = arg.height + "px";
	//expand main content height
	let
		mainHeight = qS("body").offsetHeight - qS("body>header").offsetHeight - qS("body>footer").offsetHeight;
	qS("body>main").style.height = mainHeight + "px";
	//update svg board height
	app.svgBoard.style.height = mainHeight + "px";
	//set app reference size
	app.size = new Size(arg.width, arg.height);
	//set SVG viewBox values
	app.setViewBox(<any>undefined);
	//console.log(event, arg)
}

//this's a proof of concept of how to communicate with main process, the recommended NEW way...
//	function updateViewBox(arg: any) built this way

ipcRenderer.on("win-resize", (event, arg) => {
	updateViewBox(arg)
});

console.log(ipcRenderer.sendSync('synchronous-message', 'ping')) // prints "pong"

ipcRenderer.on('asynchronous-reply', (event, arg) => {
	console.log(arg) // prints "pong"
})
ipcRenderer.send('asynchronous-message', 'ping')
//remote.getGlobal('sharedObj')	will be deprecated soon