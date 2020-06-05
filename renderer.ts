import { ipcRenderer } from "electron";
import { templatesDOM, qSA, qS, tag } from "./src/utils"
import * as fs from 'fs';
import {
	IComponentOptions, IApplicationOptions, StateType as State, ActionType as Action,
	IMachineState, IMouseState, IItemNode, IItemWireOptions, IPoint, IItemSolidOptions
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
import EC from "src/ec";
import LinesAligner from "src/linealign";

let
	app: MyApp = <any>void 0,
	dash: LinesAligner;

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

function createEC(name: string): EC {
	return new EC(<IItemSolidOptions><unknown>{
		name: name,
		x: app.center.x,
		y: app.center.y,
		onProp: function (e: any) {
			//this happens when this component is created
		}
	})
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
			transition: Action,
			fn = (b: any) => b ? "ON" : "OFF",
			toolTarget = getParentAttr(<HTMLElement>e.target, "tool"),
			status = parseInt(attr(toolTarget, "data-status"));

		if (status = (status + 1) & 1) {	//wire.editMode = !wire.editMode
			addClass(toolTarget, "selected");
			transition = Action.START;
		}
		else {
			removeClass(toolTarget, "selected");
			transition = Action.STOP;
		}

		attr(toolTarget, {
			"data-status": status
		});

		//change tooltip title
		attr(e.target, { title: `Wire edit is ${fn(status)}` });
		enableDisableTools();
		app.execute(Action.UNSELECT_ALL, "");
		app.sm.transition(State.WIRING, transition, void 0);
	}, false);
	//HtmlWindow
	/*aEL(qS('.bar-item[tool="ec-props"]'), "click", (e: MouseEvent) => {
		app.winProps.setVisible(!app.winProps.visible);
	}, false);*/
	//add component
	aEL(qS('.bar-item[action="comp-create"]'), "click", () =>
		!selectedTool() &&
		app.addComponent(createEC(<string>app.prop("comp_option").value)), false);
}

function createStateMachine() {
	let
		actionDefaultCopyNewState = function (newCtx: IMouseState) {
			app.sm.ctx = newCtx;		//for now just copy data
		};
	//IDLE
	app.sm.register(<IMachineState>{
		key: State.IDLE,
		overType: "forward",
		actions: {
			//transitions
			RESUME: function (newCtx: IMouseState) { }
		}
	});
	//BOARD
	app.sm.register(<IMachineState>{
		key: State.BOARD,
		overType: "forward",
		persistData: true,
		data: {
			count: 0,
			label: "hi!"
		},
		actions: {
			MOVE: function (newCtx: IMouseState) {
			},
			//OUT: actionOutOfTool,
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
				app.sm.send(Action.HIDE_NODE, (this as StateMachine).ctx);
				(this as StateMachine).ctx = newCtx;		//save new context

				//console.log((this as StateMachine).data);
			}
		}
	});
	//EC_NODE
	app.sm.register(<IMachineState>{
		key: State.EC_NODE,
		overType: "forward",
		actions: {
			MOVE: function (newCtx: IMouseState) {
				(this as StateMachine).ctx = newCtx;		//copy data
				let
					p = Point.translateBy((this as StateMachine).ctx.offset, 20);
				app.tooltip.move(p.x, p.y);
			},
			//OUT: actionOutOfTool,
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
				app.sm.send(Action.SHOW_NODE_TOOLTIP, (this as StateMachine).ctx);
			}
		}
	});
	//EC_DRAG
	app.sm.register(<IMachineState>{
		key: State.EC_DRAG,
		overType: "deny",
		persistData: true,
		actions: {
			MOVE: function (newCtx: IMouseState) {
				//newCtx.offset has the updated offset, don't save anything here
				(this as StateMachine).data.dragging.forEach((comp: { ec: ItemBoard, offset: Point }) => {
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
			UP: function (newCtx: IMouseState) {
				//this catches the UP action too,  stops dragging
				removeClass(app.svgBoard, (this as StateMachine).data.className);
				app.sm.transition(State.EC_BODY, Action.START, newCtx);
			},
			//transitions
			START: function (newCtx: IMouseState) {
				let
					self = this as StateMachine;
				//add to context vector
				!app.selectedComponents.some(comp => comp.id == newCtx.it.id) &&
					(app.execute(Action.SELECT_ONLY, `${newCtx.it.id}::${newCtx.it.name}::body`));
				self.data = {
					className: "dragging",
					dragging: app.selectedComponents.map(comp => ({
						ec: comp,
						offset: Point.minus(newCtx.offset, comp.p)
					}))
				};
				addClass(app.svgBoard, self.data.className);
				app.sm.send(Action.HIDE_NODE, newCtx);
				app.rightClick.setVisible(false);
			}
		}
	});
	//EC_BODY
	app.sm.register(<IMachineState>{
		key: State.EC_BODY,
		overType: "forward",
		actions: {
			MOVE: function (newCtx: IMouseState) {
				if ((this as StateMachine).ctx.event == "down"
					&& (this as StateMachine).ctx.button == 0) {
					app.sm.transition(State.EC_DRAG, Action.START, newCtx);
					return;
				}
				(this as StateMachine).ctx = newCtx;		//save new context
				let
					p = Point.translateBy((this as StateMachine).ctx.offset, 20);
				app.tooltip.move(p.x, p.y);
			},
			DOWN: actionDefaultCopyNewState,
			UP: function (newCtx: IMouseState) {	//up after down should be show properties, not now
				actionDefaultCopyNewState(newCtx);
				app.rightClick.setVisible(false);
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
				app.sm.send(Action.HIDE_NODE, (this as StateMachine).ctx);
				(this as StateMachine).ctx = newCtx;		// new context must be saved here
				app.sm.send(Action.SHOW_BODY_TOOLTIP, (this as StateMachine).ctx);
			},
		}
	});
	//WIRE_LINE
	app.sm.register(<IMachineState>{
		key: State.WIRE_LINE,
		overType: "forward",
		actions: {
			MOVE: function (newCtx: IMouseState) {
				if (newCtx.it) {
					let
						p = Point.translateBy(newCtx.offset, 20);
					app.tooltip.setVisible(true)
						.move(p.x, p.y)
						.setFontSize(app.tooltipFontSize())
						.setText(newCtx.it.id);
				}
			},
			UP: function (newCtx: IMouseState) {	//up after down should be show properties, not now
				actionDefaultCopyNewState(newCtx);
				app.rightClick.setVisible(false);
				//must exists an ec
				newCtx.it && (newCtx.button == 0)
					&& app.execute(
						newCtx.ctrlKey ?
							Action.TOGGLE_SELECT :  // Ctrl+click	 => toggle select
							Action.SELECT,  		// click		 => select one
						[newCtx.it.id, newCtx.it.name, "line"].join('::'));
			},
			DEFAULT: actionDefaultCopyNewState,	//state must be saved so MOVE can capture prev
			//transitions
			START: function () {
				app.sm.send(Action.HIDE_NODE, (this as StateMachine).ctx);	//hides previous node tooltip if any
			}
		}
	});
	//WIRING
	app.sm.register(<IMachineState>{
		key: State.WIRING,
		overType: "function",
		persistData: true,
		actions: {
			OVER: function (newCtx: IMouseState) {
				actionDefaultCopyNewState(newCtx);
				//gets here when over any component: board, EC, Wire,...
				if (!newCtx.it)
					return
				//real component, EC or Wire
				switch (newCtx.over.type) {
					case "node":
						switch (newCtx.it.type) {
							case Type.WIRE:
								//only node from a Wire in editMode allowed for now
								if ((<Wire>newCtx.it).editMode) {
									console.log(`over: ${newCtx.it.id} node: ${newCtx.over.node} unbond: ${(this as StateMachine).data} State.WIRING_WIRE_NODE`);
									app.sm.transition(State.WIRING_WIRE_NODE, Action.START, newCtx,
										(this as StateMachine).data);
								}
								break;
							case Type.EC:
								app.sm.transition(State.WIRING_EC_NODE, Action.START, newCtx);
								break;
						}
						break;
					case "body":
						app.sm.transition(State.WIRING_EC_BODY, Action.START, newCtx);
					default:
						//console.log(`WIRING over ${newCtx.over.type} of: ${newCtx.it.id}`)
						break;
				}
			},
			MOVE: function (newCtx: IMouseState) {
				let
					self = this as StateMachine;
				switch (newCtx.it?.type) {
					case Type.WIRE:
						let
							wire = newCtx.it as Wire;
						if (!wire.editMode) {
							//later implement a priority queue to turn editMode for unused of too far wires
							wire.editMode = true;	//open up
						}
						if (self.ctx.event == "down") {
							//can't drag first or last line if bonded
							let
								ln = self.ctx.over.line;
							if ((ln == 1 && self.ctx.it.nodeBonds(0))
								|| (ln == (<Wire>self.ctx.it).lastLine && self.ctx.it.nodeBonds((<Wire>self.ctx.it).last))) {
								//console.log("cannot drag bonded wire line");
							} else {
								app.sm.transition(State.WIRING_LINE_DRAG, Action.START, newCtx);
							}
							return;
						}
						actionDefaultCopyNewState(newCtx);
						//check if mouse is close enough to a wire node
						let
							node = wire.overNode(self.ctx.offset, self.ctx.over.line),
							bonds = wire.nodeBonds(node);
						//this highlights the wire node
						if (node != -1 && (
							bonds ? (
								(!self.ctx.ctrlKey && !(node == 0 || node == wire.last)) ||
								(self.data.unbondNode = (self.ctx.ctrlKey && (node == 0 || node == wire.last)))
							) :
								true
							//(self.ctx.unbondNode = (newCtx.ctrlKey && (node == 0 || node == wire.last))) ||	// XOR
							//(!newCtx.ctrlKey && !(node == 0 || node == wire.last))
						)
							//		(self.ctx.it.nodeHighlightable(node) && !self.ctx.it.nodeBonds(node))
						) {
							//unbond only when node selected and drag is after Ctrl->click->move
							console.log(`highlighted: ${wire.id} node: ${node} unbond: ${self.data.unbondNode}`);
							bonds && console.log(`bonds`);
							wire.showNode(node);
						} else {
							wire.hideNode();
						}
						break;
				}
				actionDefaultCopyNewState(newCtx);
			},
			DOWN: actionDefaultCopyNewState,	//state must be saved so MOVE can capture prev
			UP: function (newCtx: IMouseState) {
				(this as StateMachine).ctx = newCtx;
				app.rightClick.setVisible(false);
			},
			//transitions
			RESUME: function (newCtx: IMouseState) {
				//resume wiring...

			},
			START: function (newCtx: IMouseState) {
				//console.log("WIRING.START transition - start wiring editing");
				app.rightClick.setVisible(false);
				(this as StateMachine).ctx = newCtx;
				//initialize state variables
				(this as StateMachine).data = {
					unbondNode: false
				};
			},
			STOP: function () {
				app.compList
					.forEach(c => (c.type == Type.WIRE) && ((c as Wire).editMode = false));
				app.sm.transition(State.IDLE, Action.DEFAULT, void 0);
			}
		}
	});
	//WIRING_EC_NODE fires WIRING_WIRE_NEW
	app.sm.register(<IMachineState>{
		key: State.WIRING_EC_NODE,
		overType: "deny",
		actions: {
			OUT: function (newCtx: IMouseState) {
				//app.sm.send(Action.HIDE_NODE, (this as StateMachine).ctx);
				if (!(this as StateMachine).ctx.disableOut) {
					app.sm.transition(State.WIRING, Action.RESUME, newCtx);
					(this as StateMachine).ctx.it.hideNode();
				}
				(this as StateMachine).ctx.disableOut = false;
			},
			UP: function (newCtx: IMouseState) {
				if (newCtx.ctrlKey) {
					app.sm.transition(State.WIRING_WIRE_NEW, Action.START, newCtx);
				}
			},
			//transitions
			START: function (newCtx: IMouseState) {
				let
					self = this as StateMachine;
				self.ctx = newCtx;
				if (!newCtx.it.nodeBonds(newCtx.over.node)) {
					self.ctx.disableOut = true;
					newCtx.it.showNode(newCtx.over.node);
				}
			}
		}
	});
	//WIRING_LINE_DRAG
	app.sm.register(<IMachineState>{
		key: State.WIRING_LINE_DRAG,
		overType: "deny",
		persistData: true,
		actions: {
			MOVE: function (newCtx: IMouseState) {
				//newCtx.offset has the updated offset, don't save anything here
				let
					self = this as StateMachine,
					ln = self.data.line;

				self.ctx.it?.setNode(ln - 1, Point.minus(newCtx.offset, self.data.A));
				self.ctx.it?.setNode(ln, Point.minus(newCtx.offset, self.data.B));

				dash.matchWireLine(self.ctx.it as Wire, self.ctx.over.line)
			},
			UP: function (newCtx: IMouseState) {
				//this catches the UP action too
				removeClass(app.svgBoard, (this as StateMachine).data.className);
				dash.hide();
				if (dash.match) {
					let
						ln = (this as StateMachine).data.line,
						vector = Point.minus(dash.p, dash.wire.getNode(dash.node));
					dash.wire.setNode(ln - 1, Point.plus(dash.wire.getNode(ln - 1), vector));
					dash.wire.setNode(ln, Point.plus(dash.wire.getNode(ln), vector));
				}
				app.sm.transition(State.WIRING, Action.START, newCtx);
			},
			OUT: function () {
				//has to be empty so dragging is not STOP when passing over another component
				//console.log("ec_dragging.OUT");
			},
			//transitions
			START: function (newCtx: IMouseState) {
				let
					line = newCtx.over.line;
				//hide previous wire node if any selected
				app.sm.send(Action.HIDE_NODE, (this as StateMachine).ctx);
				(this as StateMachine).data = {
					className: "drag-node",
					line: line,
					A: Point.minus(newCtx.offset, <IItemNode>newCtx.it?.getNode(line - 1)),
					B: Point.minus(newCtx.offset, <IItemNode>newCtx.it?.getNode(line))
				};
				//show mouse cursor
				addClass(app.svgBoard, (this as StateMachine).data.className);
			}
		}
	});
	//WIRING_EC_BODY
	app.sm.register(<IMachineState>{
		key: State.WIRING_EC_BODY,
		overType: "deny",
		actions: {
			OUT: function (newCtx: IMouseState) {
				app.sm.transition(State.WIRING, Action.RESUME, newCtx);
			},
			MOVE: function (newCtx: IMouseState) {
				if ((this as StateMachine).ctx.event == "down"
					&& (this as StateMachine).ctx.button == 0) {
					app.sm.transition(State.WIRING_EC_BODY_DRAG, Action.START, newCtx);
					return;
				}
			},
			UP: actionDefaultCopyNewState,
			DOWN: actionDefaultCopyNewState,
			//transitions
			START: function (newCtx: IMouseState) {
				(this as StateMachine).ctx = newCtx;
			}
		}
	});
	//WIRING_EC_BODY_DRAG
	app.sm.register(<IMachineState>{
		key: State.WIRING_EC_BODY_DRAG,
		overType: "deny",
		persistData: true,
		actions: {
			MOVE: function (newCtx: IMouseState) {
				//newCtx.offset has the updated offset, don't save anything here
				(this as StateMachine).data.dragging.forEach((comp: { ec: ItemBoard, offset: Point }) => {
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
			UP: function (newCtx: IMouseState) {
				//this catches the UP action too, stops dragging
				removeClass(app.svgBoard, (this as StateMachine).data.className);
				app.sm.transition(State.WIRING_EC_BODY, Action.START, newCtx);
			},
			//transitions
			START: function (newCtx: IMouseState) {
				(this as StateMachine).data = {
					className: "dragging",
					dragging: [{
						ec: newCtx.it,
						offset: Point.minus(newCtx.offset, newCtx.it.p)
					}]
				};
				addClass(app.svgBoard, (this as StateMachine).data.className);
			}
		}
	});
	//WIRING_WIRE_NODE
	app.sm.register(<IMachineState>{
		key: State.WIRING_WIRE_NODE,
		overType: "deny",
		persistData: true,
		actions: {
			OUT: function (newCtx: IMouseState) {
				app.sm.send(Action.HIDE_NODE, (this as StateMachine).ctx);
				app.sm.transition(State.WIRING, Action.RESUME, newCtx);
			},
			MOVE: function (newCtx: IMouseState) {
				if ((this as StateMachine).ctx.event == "down") {
					//don't save so drag checks Ctrl-key
					app.sm.transition(State.WIRING_WIRE_NODE_DRAG, Action.START, newCtx,
						(this as StateMachine).data);
				}
			},
			DOWN: function (newCtx: IMouseState) {
				(this as StateMachine).ctx = newCtx;
			},
			UP: function (newCtx: IMouseState) {
				(this as StateMachine).ctx = newCtx;
				//check Ctrl-Click
				if ((this as StateMachine).ctx.ctrlKey) {
					//console.log(`Ctrl+Click on Wire node`);
				}
			},
			//transitions
			START: function (newCtx: IMouseState) {
				!(this as StateMachine).data &&
					((this as StateMachine).data = {
						unbondNode: false
					});
			}
		}
	});
	//WIRING_WIRE_NODE_DRAG
	app.sm.register(<IMachineState>{
		key: State.WIRING_WIRE_NODE_DRAG,
		overType: "deny",
		persistData: true,
		actions: {
			MOVE: function (newCtx: IMouseState) {
				let
					self = this as StateMachine;
				//newCtx.offset has the updated offset, don't save anything here
				if (self.ctx.it?.type == Type.WIRE) {
					//for some reason it's trying to setNode on an EC
					self.ctx.it.setNode(self.ctx.over.node, newCtx.offset);
					//update highlighted wire node location
					self.ctx.it.showNode(self.ctx.over.node);
					console.log(`dragging: ${self.ctx.it.id} node: ${self.ctx.over.node}`);
					//self.ctx.it.nodeRefresh(self.ctx.over.node);

					dash.matchWireNode(self.ctx.it as Wire, self.ctx.over.node);

					//this only wires to EC node allow Wire too


					if (self.data.isEdgeNode) {
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
						self.data.bond && self.data.bond.ec.select(false);
						//persists bond data
						self.data.bond = bond;
						//select new matched ec node if any
						bond && bond.ec.select(true);
					}
				}
			},
			UP: function (newCtx: IMouseState) {
				let
					self = this as StateMachine;
				removeClass(app.svgBoard, <string>self.data.className);
				dash.hide();
				//released over an EC node
				if (self.data.bond) {
					self.data.bond.ec.select(false);
					self.ctx.it?.bond(self.data.nodeNumber, self.data.bond.ec, self.data.bond.node);
					//console.log(`inside: ${self.ctx.bond.ec.id}:[${self.ctx.bond.node}]`);

					app.sm.transition(State.WIRING, Action.RESUME, newCtx);
				} else {
					dash.match && (dash.wire.setNode(dash.node, dash.p), dash.wire.showNode(dash.node));
					app.sm.transition(State.WIRING_WIRE_NODE, Action.START, newCtx);
				}
			},
			OUT: function () {
				//has to be empty so dragging is not STOP when passing over another component
				//console.log("ec_dragging.OUT");
			},
			//transitions
			START: function (newCtx: IMouseState) {
				let
					self = this as StateMachine,
					unbondNode = self.data && self.data.unbondNode;
				//save new context only here, because what changes is only position
				self.data = {
					unbondNode: unbondNode,
					nodeNumber: self.ctx.over.node,
					isEdgeNode: self.ctx.over.node == 0 || self.ctx.over.node == (<Wire>self.ctx.it)?.last,
					className: "drag-node",
					bond: void 0 // { ec: ItemBoard, node: number }
				}
				self.ctx = newCtx;
				if (unbondNode) {
					let
						bonds = newCtx.it.nodeBonds(self.data.nodeNumber);
					bonds?.to.forEach(element => {
						newCtx.it.unbond(self.data.nodeNumber, element.id);
					});
					console.log(`unbond: ${newCtx.it.id} node: ${self.data.nodeNumber} ${bonds?.to.length || 0}`)
				} else
					console.log(`no unbond: ${newCtx.it.id} node: ${self.data.nodeNumber}`);
				addClass(app.svgBoard, self.data.className);
			}
		}
	});
	//WIRING_WIRE_NEW
	app.sm.register(<IMachineState>{
		key: State.WIRING_WIRE_NEW,
		overType: "deny",
		persistData: true,
		actions: {
			ENTER: function (newCtx: IMouseState) {
				//cannot save new context, erases wiring status
				console.log('ENTER board, continue wiring...')
			},
			KEY: function (code: any) {
				if (code == "Escape") {
					app.sm.data = undefined;
					app.sm.transition(State.WIRING, Action.RESUME, (this as StateMachine).ctx);
				}
			},
			OUT: function (newCtx: IMouseState) {
				//console.log(`out of: ${newCtx.it?.id || "board"}`);
				if (!(this as StateMachine).ctx.disableOut) {
					(newCtx.over.type == "node") && newCtx.it.highlighted && newCtx.it.hideNode();
				}
				(this as StateMachine).ctx.disableOut = false;
			},
			UP: function (newCtx: IMouseState) {
				let
					self = this as StateMachine;

				switch (newCtx.over.type) {
					case "node":
						//EC | Wire
						if (newCtx.it.highlighted) {
							self.data.wire.bond(self.data.wire.last, newCtx.it, newCtx.over.node);
							app.sm.data = undefined;
							app.sm.transition(State.WIRING, Action.RESUME, (this as StateMachine).ctx);
							newCtx.it.hideNode();
							return;
						}
						break;
					case "line":
						console.log(`click on : ${newCtx.it.id} line: ${newCtx.over.line}`);
						break;
					default:
						//Wire::line | board
						if (!newCtx.it) {
							console.log('click on board')
						} else {
							console.log(`click on: ${newCtx.it.id} node: ${newCtx.over.node}`);
						}
						break;
				}
				//otherwise correct last node
				self.data.wire.setNode(self.data.wire.last, newCtx.offset);
				self.data.wire.appendNode(newCtx.offset);
				//(newCtx.over.type == "node") && console.log(`click on: ${newCtx.it.id} node: ${newCtx.over.node}`)
			},
			MOVE: function (newCtx: IMouseState) {
				let
					self = this as StateMachine,
					prevNodePos = self.data.wire.getNode(self.data.wire.last - 1),
					r = 7,
					angle = Math.atan2(newCtx.offset.y - prevNodePos.y, newCtx.offset.x - prevNodePos.x),
					p = new Point((newCtx.offset.x - r * Math.cos(angle)) | 0,
						(newCtx.offset.y - r * Math.sin(angle)) | 0);
				self.data.wire.setNode(self.data.wire.last, p);

				switch (newCtx.over.type) {
					case "node":
						!newCtx.it.highlighted
							&& !((newCtx.over.node == self.data.start.node)
								&& (newCtx.it.id == self.data.start.ec.id))
							&& (self.ctx.disableOut = true, newCtx.it.showNode(newCtx.over.node));
						break;
					case "line":
						if (!newCtx.it.highlighted && (self.data.wire.id != newCtx.it.id)) {

							if (!(newCtx.it as Wire).editMode) {
								(newCtx.it as Wire).editMode = true;
								console.log(`wire: ${newCtx.it.id} not in editMode on line`)
							}
							let
								node = newCtx.it.overNode(newCtx.offset, newCtx.over.line);
							if (node != -1 && newCtx.it.nodeHighlightable(node)) {
								self.ctx.disableOut = true
								newCtx.it.showNode(node);
							}
						}
						console.log(`move over ${newCtx.it.id} line: ${newCtx.over.line}`)
						break;
				}
				//(newCtx.over.type == "node") && console.log(`move over: ${newCtx.it.id} node: ${newCtx.over.node}`);
			},
			AFTER_DELETE: function (deletedId: any) {
				if ((this as StateMachine).data.wire.id == deletedId) {
					//cancel all, components are already disconnected
					(this as StateMachine).data = undefined;
					app.sm.transition(State.WIRING, Action.RESUME, (this as StateMachine).ctx);
				}
			},
			//transitions
			START: function (newCtx: IMouseState) {
				actionDefaultCopyNewState(newCtx);
				let
					self = this as StateMachine,
					node = self.ctx.it.getNode(newCtx.over.node),
					p = new Point(node && node.x, node && node.y);
				self.ctx.it.hideNode();
				if (!node)
					throw `no node`;
				p = Point.plus(p, self.ctx.it.p);
				//{ wire: Wire, start: { ec: ItemBoard, node: number } }
				self.data = {
					wire: new Wire(<IItemWireOptions>{
						points: <IPoint[]>[p, p]
					}),
					start: {
						ec: self.ctx.it,
						node: newCtx.over.node
					}
				};
				app.addComponent(self.data.wire);
				self.data.wire.bond(0, self.ctx.it, self.ctx.over.node);
			}
		}
	});
}

function readJson(path: string): any {
	var data = fs.readFileSync(path);
	let
		json = JSON.parse(data.toString().replace(/[\t\r\n]*/g, ""));
	return json
}

window.addEventListener("DOMContentLoaded", () => {

	//load DOM script HTML templates
	templatesDOM("viewBox01|size01|point01|baseWin01|ctxWin01|ctxItem01|propWin01")
		.then(async (templates: Object) => {
			const d = await ipcRenderer.invoke('shared', 'app'); console.log("global.app =", d)
			//load default circuit library
			let
				json = readJson('./dist/data/library-circuits.v2.json');
			//register components
			json.forEach((element: IComponentOptions) => {
				Comp.register(element);
			});
			json = readJson('./dist/data/context-menu.json');		//read context menu data

			app = new MyApp(<IApplicationOptions>{
				templates: templates,
				includePropsInThis: true,
				props: {
					rot_lbl: {
						tag: "#rot-lbl"
					},
					comp_option: {
						tag: "#comp-option",
						onChange: function (value: string, where: number) {
							if (where != 1)		// 1 == "ui"
								return;
							//"value" has the string name of the selected component
						}
					},
					cons_log: {
						tag: "#cons-log",
						onChange: function (value: boolean, where: number) {
							app.sm.log = value;
						}
					}
				},
				list: json
			});
			dash = new LinesAligner(app);
			updateViewBox(ipcRenderer.sendSync('get-win-size', ''));	//set SVG viewBox values
			app.board.appendChild(app.winProps.win);					//add HtmlWindow to board
			app.board.appendChild(app.rightClick.win);					//add right-click window
			app.svgBoard.append(app.tooltip.g);							//top z-index SVG 
			app.svgBoard.append(dash.line0);
			app.svgBoard.append(dash.line1);
			hookEvents();
			createStateMachine();
			app.sm.enabled = true;

			//////////////////// TESTINGS /////////////////
			//create default EC first
			//app.addComponent(createEC(<string>app.prop("comp_option").value));

			//this's temporary, until create wire tool works
			//wire.setPoints([{x:50,y:100}, {x:200,y:100}, {x:200, y:25}, {x:250,y:25}])
			/*
			app.addComponent(new Wire((<IItemWireOptions>{
				points: <IPoint[]>[
					{ x: 25, y: 50 },
					{ x: 25, y: 100 },
					{ x: 200, y: 100 },
					{ x: 200, y: 25 },
					{ x: 250, y: 25 }]
			})));
			*/
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
	qS("body").style.height = arg.height + "px";	//set body height, expand main content height
	let
		mainHeight = qS("body").offsetHeight - qS("body>header").offsetHeight - qS("body>footer").offsetHeight;
	qS("body>main").style.height = mainHeight + "px";
	app.board.style.height = mainHeight + "px";	//update svg board height
	app.size = new Size(arg.width, arg.height);	//set app reference size
	app.contentHeight = mainHeight;
	app.setViewBox(<any>undefined);	//set SVG viewBox values
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