import { ipcRenderer } from "electron";
import { templatesDOM, qSA, qS } from "./src/utils"
import * as fs from 'fs';
import {
	IComponentOptions, IApplicationOptions, IItemSolidOptions, IItemWireOptions, IPoint,
	StateType as State, ActionType as Action, IMachineState, IMouseState, IItemNode
} from "./src/interfaces";
import Comp from "./src/components";
import { MyApp } from "./src/myapp";
import { isNumeric, attr, aEL, removeClass, toggleClass, addClass } from "./src/dab";
import Point from "./src/point";
import ItemSolid from "./src/itemSolid";
import EcProp from "./src/ecprop";
import EC from "./src/ec";
import Wire from "./src/wire";
import StateMachine from "./src/stateMachine";
import { Type } from "./src/types";
import ItemBoard from "./src/itemsBoard";

let
	app: MyApp = <any>void 0;

//https://www.electronjs.org/docs/tutorial/security

function onEcPropChange(value: any) {
	console.log(this, value)
}

function createComponent(name: string | null): ItemSolid {
	!name && (name = <string>app.prop("comp_option").value);
	let
		comp: EC = new EC(<IItemSolidOptions><unknown>{
			name: name,
			x: app.pos.x,
			y: app.pos.y,
			color: app.prop("comp_color").value,
			onProp: function (e: any) {
				//this happens when this component is created
			}
		});
	app.ec && (app.ec.disconnect(), app.ec.remove());
	//add it to SVG DOM
	app.svgBoard.insertBefore(comp.g, app.tooltip.g);

	//create properties
	app.winProps.clear();
	comp.properties().forEach((name: string) => {

		//still needs to assign value to select

		app.winProps.appendPropChild(new EcProp(comp, name, true, onEcPropChange), true);
	})
	return comp;
}

function updateRotation() {
	app.prop("rot_lbl").value = ` ${<string><unknown>((<ItemSolid>app.ec).rotation)}°`;
}

function updateCompLocation() {
	//format
	app.pos = app.ec.p;
	app.prop("comp_pos").value = app.ec.p.toString(0x06); // no vars and no parenthesis `${app.ec.x}, ${app.ec.y}`;
}

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
	let
		getParent = function (p: HTMLElement, attr: string) {
			while (p && !p.hasAttribute(attr))
				p = <HTMLElement>p.parentElement;
			return p;
		}
	//ZOOM controls
	qSA('.bar-item[data-scale]').forEach((item: any) => {
		aEL(item, "click", (e: MouseEvent) => {
			let
				scaleTarget = getParent(<HTMLElement>e.target, "data-scale"),
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
	aEL(qS('.bar-item[rot-dir="left"]'), "click", (e: MouseEvent) => {
		app.ec.rotate(app.ec.rotation - 45);
		updateRotation();
	}, false);
	aEL(qS('.bar-item[rot-dir="right"]'), "click", (e: MouseEvent) => {
		app.ec.rotate(app.ec.rotation + 45);
		updateRotation();
	}, false);
	//wire editing
	aEL(qS('.bar-item[tool="wire-edit"]'), "click", (e: MouseEvent) => {
		if (!noToolSelectedOr("wire-edit")) {
			return;		//there's a selected tool
		}
		let
			wire: Wire = app.wire,
			transition: Action,
			fn = (b: any) => b ? "ON" : "OFF",
			toolTarget = getParent(<HTMLElement>e.target, "tool");
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
		app.state.transition(State.WIRE_EDIT, transition, void 0);
		//change tooltip title
		attr(e.target, { title: `Wire edit is ${fn(wire.editMode)}` });
		enableDisableTools();
	}, false);
	//HtmlWindow
	aEL(qS('.bar-item[tool="ec-props"]'), "click", (e: MouseEvent) => {
		app.winProps.visible = !app.winProps.visible;
	}, false);
}

function createStateMachine() {
	let
		actionDefaultCopyNewState = function (newCtx: IMouseState) {
			app.state.ctx = newCtx;		//for now just copy data
		},
		actionOutOfTool = function (newCtx: IMouseState) {
			if (!app.insideBoard(newCtx.offset)) {	// newCtx.over.type == "board" ||
				//this means to hide node and tooltip ONLY if going out of the board
				//actionOutOfComponent(newCtx);
				app.state.send(Action.HIDE_NODE, newCtx);
				app.topBarLeft.innerHTML = "&nbsp;";
				//save new context
				//app.state.ctx == newCtx;
				//let	text = app.topBarRight.innerText.split('|');
				//console.log(newCtx)
				//app.topBarRight.innerText = `${text[0]}|${newCtx.offset.toString()}`
			}
		};

	//register states
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
			//transitions
			START: function (newCtx: IMouseState) {
				//uses machine current state
				app.state.send(Action.HIDE_NODE, (this as StateMachine).ctx);
				//save new context
				(this as StateMachine).ctx = newCtx;
			}
		}
	});
	app.state.register(<IMachineState>{
		key: State.EC_NODE,
		overType: "forward",
		actions: {
			MOVE: function (newCtx: IMouseState) {
				//for now just copy data
				(this as StateMachine).ctx = newCtx;
				let
					p = Point.translateBy((this as StateMachine).ctx.offset, 20);
				app.tooltip.move(p.x, p.y);
			},
			OUT: actionOutOfTool,
			UP: function (newCtx: IMouseState) {
				//save new context, before show be a DOWN event
				(this as StateMachine).ctx = newCtx;
				//check Ctrl-Click
				if ((this as StateMachine).ctx.ctrlKey) {
					//console.log(`Ctrl+Click on EC node, start wiring`);
				}
			},
			//transitions
			START: function (newCtx: IMouseState) {
				//save new context
				(this as StateMachine).ctx = newCtx;
				//uses machine current state
				app.state.send(Action.SHOW_NODE_TOOLTIP, (this as StateMachine).ctx);
			}
		}
	});
	app.state.register(<IMachineState>{
		key: State.EC_DRAG,
		overType: "deny",
		actions: {
			MOVE: function (newCtx: IMouseState) {
				//updates component position
				//newCtx.offset has the updated offset, don't save anything here
				let
					p = Point.minus(newCtx.offset, <Point>(this as StateMachine).ctx.vector);
				//moves EC to new location
				(this as StateMachine).ctx.it?.move(p.x, p.y);
				updateCompLocation()
			},
			OUT: function () {
				//has to be empty so dragging is not STOP when passing over another component
				//console.log("ec_dragging.OUT");
			},
			DEFAULT: function (newCtx: IMouseState) {
				//this catches the UP action too
				//stops dragging, hide mouse cursor
				removeClass(app.svgBoard, (this as StateMachine).ctx.className);
				//go back to ec_body state
				app.state.transition(State.EC_BODY, Action.START, newCtx);
			},
			//transitions
			START: function (newCtx: IMouseState) {
				//save new context
				(this as StateMachine).ctx = newCtx;
				(this as StateMachine).ctx.className = "dragging";
				//show mouse cursor
				addClass(app.svgBoard, "dragging");
				//add to context vector
				(this as StateMachine).ctx.vector =
					Point.minus((this as StateMachine).ctx.offset, (this as StateMachine).ctx.it.p);
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
				//save new context
				(this as StateMachine).ctx = newCtx;
				let
					p = Point.translateBy((this as StateMachine).ctx.offset, 20);
				app.tooltip.move(p.x, p.y);
			},
			OUT: actionOutOfTool,   //actionOutOfComponent
			DOWN: function (newCtx: IMouseState) {
				//save new context
				(this as StateMachine).ctx = newCtx;
			},
			UP: actionDefaultCopyNewState,	//up after down should be show properties, not now
			//transitions
			START: function (newCtx: IMouseState) {
				//uses machine current state
				app.state.send(Action.HIDE_NODE, (this as StateMachine).ctx);
				//save new context
				(this as StateMachine).ctx = newCtx;
				//show body tooltip
				app.state.send(Action.SHOW_BODY_TOOLTIP, (this as StateMachine).ctx);
			},
			AFTER_DRAG: function (newCtx: IMouseState) {
				//show body tooltip
				app.state.send(Action.SHOW_BODY_TOOLTIP, newCtx);
			}
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
			OUT: actionOutOfTool,
			DEFAULT: actionDefaultCopyNewState,	//state must be saved so MOVE can capture prev
			//transitions
			START: function (newCtx: IMouseState) {
				//uses machine current state
				app.state.send(Action.HIDE_NODE, (this as StateMachine).ctx);	//hides previous node tooltip if any
			}
		}
	});
	app.state.register(<IMachineState>{
		key: State.WIRE_EDIT,
		overType: "function",
		actions: {
			OVER: function (newCtx: IMouseState) {
				//gets here when over any component, EC, board, Wire,...
				if (!newCtx.it || !(<Wire>newCtx.it).editMode) {
					//console.log("MOVE on wire_edit -not over wire in edit mode!");
					return;
				}
				//check if it's over a wire node and transition
				if (newCtx.over.type == "node") {
					//console.log("wire_edit.OVER -> wire_node.OVER");
					app.state.transition(State.WIRE_NODE, Action.START, newCtx);
					return;
				}
				//console.log("wire_edit.OVER action");
			},
			MOVE: function (newCtx: IMouseState) {
				let
					self = this as StateMachine;
				if (!newCtx.it || !(<Wire>newCtx.it).editMode) {
					//console.log("MOVE on wire_edit -not over wire in edit mode!");
					return;
				}
				if (self.ctx.event == "down") {
					//can't drag first or last line is bonded
					let
						ln = self.ctx.over.line;
					if ((ln == 1 && self.ctx.it.nodeBonds(0))
						|| (ln == (<Wire>self.ctx.it).lastLine && self.ctx.it.nodeBonds((<Wire>self.ctx.it).last))) {
						//console.log("cannot drag bonded wire line");
					} else {
						//console.log("start wire line dragging");
						app.state.transition(State.WIRE_LINE_DRAG, Action.START, newCtx);
					}
					return;
				}
				//editMode = true
				actionDefaultCopyNewState(newCtx);
				//check if mouse is close enough to a wire node
				let
					node = self.ctx.it.overNode(self.ctx.offset, self.ctx.over.line);
				if (node != -1 && self.ctx.it.nodeHighlightable(node)) {
					//will hide node if it's not highlightable
					self.ctx.it.showNode(node);
					////console.log(`over wire line node: ${node}`);
				} else {
					//implement here a Ctrl to unbond wire and reconnect it with dragging


					self.ctx.it.hideNode();
				}
			},
			DEFAULT: actionDefaultCopyNewState,	//state must be saved so MOVE can capture prev
			OUT: actionOutOfTool,
			UP: function (newCtx: IMouseState) {
				//save new context, before show be a DOWN event
				(this as StateMachine).ctx = newCtx;
				//check Ctrl-Click
				if ((this as StateMachine).ctx.ctrlKey) {
					//console.log(`Ctrl+Click on Wire line`);
				}
			},
			//transitions
			RESUME: function (newCtx: IMouseState) {
				//gets here from wire_node
				//uses machine current state
				app.state.send(Action.HIDE_NODE, (this as StateMachine).ctx);	//hides previous node tooltip if any
				//don't call action "Move" because then it's called two times
				//app.state.send("MOVE", newCtx);
				//console.log("wire_edit.RESUME transition ");
			},
			START: function () {
				//starts Wire editing
				//console.log("wire_edit.START transition - start wiring editing");
			},
			STOP: function () {
				//end Wire editing
				//console.log("wire_edit.STOP transition - stop wiring editing");
				//go idle
				app.state.transition(State.IDLE, Action.DEFAULT, void 0);	// "idle"
			}
		}
	});
	app.state.register(<IMachineState>{
		key: State.WIRE_NODE,
		overType: "deny",
		actions: {
			OUT: function (newCtx: IMouseState) {
				//go back to wire_edit
				app.state.transition(State.WIRE_EDIT, Action.RESUME, newCtx);
			},
			MOVE: function (newCtx: IMouseState) {
				if ((this as StateMachine).ctx.event == "down") {
					app.state.transition(State.WIRE_NODE_DRAG, Action.START, newCtx);
				}
			},
			DOWN: function (newCtx: IMouseState) {
				//save new context
				(this as StateMachine).ctx = newCtx;
			},
			UP: function (newCtx: IMouseState) {
				//save new context, before show be a DOWN event
				(this as StateMachine).ctx = newCtx;
				//check Ctrl-Click
				if ((this as StateMachine).ctx.ctrlKey) {
					//console.log(`Ctrl+Click on Wire node`);
				}
			},
			//transitions
			START: function (newCtx: IMouseState) {
				//we get here from wire_edit, so far do nothis
				//console.log("wire_node.OVER transition");
			}
		}
	});
	app.state.register(<IMachineState>{
		key: State.WIRE_NODE_DRAG,
		overType: "deny",
		actions: {
			MOVE: function (newCtx: IMouseState) {
				let
					self = this as StateMachine;
				//newCtx.offset has the updated offset, don't save anything here
				//update wire node location
				self.ctx.it?.setNode(self.ctx.over.nodeNumber, newCtx.offset);
				//update highlighted wire node location
				self.ctx.it?.showNode(self.ctx.over.nodeNumber);

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
					//presists bond data
					self.ctx.bond = bond;
					//select new matched ec node if any
					bond && bond.ec.select(true);
				}
			},
			UP: function (newCtx: IMouseState) {
				let
					self = this as StateMachine;
				//stops dragging, hide mouse cursor
				removeClass(app.svgBoard, <string>self.ctx.className);
				//released over an EC node

				if (self.ctx.bond) {
					//deselect matched ec node
					self.ctx.bond.ec.select(false);
					//bond components
					self.ctx.it?.bond(self.ctx.nodeNumber,
						self.ctx.bond.ec, self.ctx.bond.node);
					//console.log(`inside: ${self.ctx.bond.ec.id}:[${self.ctx.bond.node}]`);
					//resume on WIRE_EDIT state
					app.state.transition(State.WIRE_EDIT, Action.RESUME, newCtx);
				} else {
					//go back to WIRE_NODE state
					app.state.transition(State.WIRE_NODE, Action.START, newCtx);
				}
			},
			OUT: function () {
				//has to be empty so dragging is not STOP when passing over another component
				//console.log("ec_dragging.OUT");
			},
			DEFAULT: function (newCtx: IMouseState) {
				//actionEcDraggingStop  //this catches the UP action too

				//stops dragging, hide mouse cursor
				removeClass(app.svgBoard, <string>(this as StateMachine).ctx.className);
				//go back to wire_node state
				app.state.transition(State.WIRE_NODE, Action.START, newCtx);
			},
			//transitions
			START: function (newCtx: IMouseState) {
				let
					self = this as StateMachine;
				//save new context only here, because what changes is only position
				self.ctx = newCtx;
				//new temporary state data
				self.ctx.className = "drag-node";
				self.ctx.nodeNumber = self.ctx.over.nodeNumber;
				self.ctx.isEdgeNode = self.ctx.nodeNumber == 0 || self.ctx.nodeNumber == (<Wire>self.ctx.it)?.last;
				//show mouse cursor
				addClass(app.svgBoard, "drag-node");
			}
		}
	});
	app.state.register(<IMachineState>{
		key: State.WIRE_LINE_DRAG,
		overType: "deny",
		actions: {
			MOVE: function (newCtx: IMouseState) {
				//newCtx.offset has the updated offset, don't save anything here
				//update wire line location
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
				//actionEcDraggingStop,  //this catches the UP action too

				//stops dragging, hide mouse cursor
				removeClass(app.svgBoard, (this as StateMachine).ctx.className);
				//go back to wire_edit state
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
}

// It has the same sandbox as a Chrome extension.
window.addEventListener("DOMContentLoaded", () => {

	//load DOM script HTML templates
	templatesDOM("viewBox01|propWin01")
		.then(async (templates: Object) => {

			const d = await ipcRenderer.invoke('shared', 'app');
			console.log("global.app =", d)

			//load default circuit library
			var data = fs.readFileSync('./dist/data/library-circuits.v2.json');
			//console.log(data);
			let
				json = JSON.parse(data.toString());
			//register components
			json.forEach((element: IComponentOptions) => {
				Comp.register(element);
			});

			app = new MyApp(<IApplicationOptions>{
				templates: templates,
				includePropsInThis: true,
				props: {
					rot_lbl: {
						tag: "#rot-lbl"
					},
					comp_color: {
						tag: "#comp-color",
						onChange: function (value: number | string | string[], where: number) {
							if (where != 1)		// 1 == "ui"
								return;
							app.ec && (app.ec.setColor(<string>value));
						}
					},
					comp_option: {
						tag: "#comp-option",
						onChange: function (value: number | string | string[], where: number) {
							if (where != 1)		// 1 == "ui"
								return;
							//create and save
							(<any>window).ec = app.ec = createComponent(<string>value);
							//new component has rotation == 0
							updateRotation();
						}
					},
					comp_pos: {
						tag: "#comp-pos",
						onChange: function (value: number | string | string[], where: number) {
							if (where != 1)		// 1 == "ui"
								return;
							let
								arr = (<string>value).split(",");
							if (arr.length == 2 && isNumeric(arr[0]) && isNumeric(arr[1])) {
								app.pos = new Point(parseInt(arr[0]), parseInt(arr[1]));
								app.ec.move(app.pos.x, app.pos.y);
							}
							updateCompLocation();
						}
					}
				},
				onDomLoaded: function () {

				}
			});

			//set SVG viewBox values
			app.setViewBox(<any>undefined);

			//add HtmlWindow to board
			app.board.appendChild(app.winProps.win);

			//this's the top SVG element and all other are inserted before, so it's always ON TOP z-index max
			//add text tooltip to SVG DOM
			app.svgBoard.append(app.tooltip.g);


			//////////////////// TESTINGS /////////////////

			//create default EC first
			app.ec = createComponent(null);

			//Wire
			//wire.setPoints([{x:50,y:100}, {x:200,y:100}, {x:200, y:25}, {x:250,y:25}])
			app.wire = new Wire((<IItemWireOptions>{
				points: <IPoint[]>[
					{ x: 25, y: 50 },
					{ x: 25, y: 100 },
					{ x: 200, y: 100 },
					{ x: 200, y: 25 },
					{ x: 250, y: 25 }]
			}));
			//add it to SVG DOM before insertion point
			app.svgBoard.insertBefore(app.wire.g, app.tooltip.g);

			//testings
			//to debug faster
			//(<any>window).win = app.winProps;
			//(<any>window).combo = app.prop("comp_option");
			//(<any>window).board = app.board;
			(<any>window).ec = app.ec;
			(<any>window).tooltip = app.tooltip;
			(<any>window).wire = app.wire;
			//(<any>window).compColor = app.prop("comp_color");

			//(<any>window).Colors = Colors;
			//(<any>window).Unit = Unit;
			//var u = new Unit("2.5mV");	//console testings k = new unit.constructor("3mW");
			//(<any>window).Prop = Prop;
			//(<any>window).EcProp = EcProp;
			//var p = new Prop({ tag: "#inp02", onChange : function(e) { console.log(e) } })

			(<any>window).MyApp = app;

			//////////////////// TESTINGS /////////////////

			hookEvents();
			createStateMachine();

			//enable state machine to accept commands
			app.state.enabled = true;

			const replaceText = (selector: string, text: string) => {
				const element = document.getElementById(selector);
				if (element) {
					element.innerText = text;
				}
			};

			for (const type of ["chrome", "node", "electron"]) {
				replaceText(`${type}-version`, (process.versions as any)[type]);
			}

		})
		.catch((ex: any) => {
			console.log(ex)
		});
});

console.log(ipcRenderer.sendSync('synchronous-message', 'ping')) // prints "pong"

ipcRenderer.on('asynchronous-reply', (event, arg) => {
	console.log(arg) // prints "pong"
})
ipcRenderer.send('asynchronous-message', 'ping')
//remote.getGlobal('sharedObj')