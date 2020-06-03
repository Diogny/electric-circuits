import { ipcRenderer } from "electron";
import { templatesDOM, qSA, qS, tag } from "./src/utils"
import * as fs from 'fs';
import {
	IComponentOptions, IApplicationOptions,
	StateType as State, ActionType as Action, IMachineState, IMouseState, IItemNode, IItemWireOptions, IPoint, IItemSolidOptions
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


class LinesAligner {

	line0: SVGLineElement;
	line1: SVGLineElement;
	wire: Wire;
	node: number;
	p: Point;
	match: boolean;

	constructor() {
		let
			create = (id: string) => <SVGLineElement>tag("line", id, {
				class: "dash hide",
				x1: 0,
				y1: 0,
				x2: 0,
				y2: 0,
				"stroke-dasharray": "3, 3"
			})
		this.line0 = create("line0");
		this.line1 = create("line1");
	}

	public hide() {
		addClass(this.line0, "hide");
		addClass(this.line1, "hide");
	}

	private calculate(line: SVGLineElement, nodePoint: Point, otherNodePoint: IItemNode): number {
		if (!otherNodePoint)
			return 0;
		let
			ofs = Point.minus(otherNodePoint, nodePoint);
		if (Math.abs(ofs.x) < 3) {
			attr(line, {
				x1: nodePoint.x = otherNodePoint.x,
				y1: 0,
				x2: nodePoint.x,
				y2: app.viewBox.height
			});
			return 1;			//vertical
		} else if (Math.abs(ofs.y) < 3) {
			attr(line, {
				x1: 0,
				y1: nodePoint.y = otherNodePoint.y,
				x2: app.viewBox.width,
				y2: nodePoint.y
			});
			return -1;			//horizontal
		}
		return 0
	}

	public matchWireLine(wire: Wire, line: number): boolean {
		this.hide();
		this.p = Point.create(wire.getNode(this.node = line));	//line is 1-based
		if (this.calculate(this.line0, this.p, wire.getNode(line + 1)) ||
			(this.p = Point.create(wire.getNode(this.node = --line)),
				this.calculate(this.line0, this.p, wire.getNode(--line)))
		) {
			this.wire = wire;
			removeClass(this.line0, "hide");
			return this.match = true
		}
		return false;
	}

	public matchWireNode(wire: Wire, node: number): boolean {
		this.hide();
		this.p = Point.create(wire.getNode(node));
		let
			before = this.calculate(this.line0, this.p, wire.getNode(node - 1)),
			after = this.calculate(this.line1, this.p, wire.getNode(node + 1));
		if (before | after) {
			this.wire = wire;
			this.node = node;
			before && removeClass(this.line0, "hide");
			after && removeClass(this.line1, "hide");
			return this.match = true
		}
		return this.match = false
	}

}

let
	app: MyApp = <any>void 0,
	dash = new LinesAligner();

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
		app.state.transition(State.WIRING, transition, void 0);
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
			app.state.ctx = newCtx;		//for now just copy data
		};
	//IDLE
	app.state.register(<IMachineState>{
		key: State.IDLE,
		overType: "forward",
		actions: {
			//transitions
			RESUME: function (newCtx: IMouseState) { }
		}
	});
	//BOARD
	app.state.register(<IMachineState>{
		key: State.BOARD,
		overType: "forward",
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
				app.state.send(Action.HIDE_NODE, (this as StateMachine).ctx);
				(this as StateMachine).ctx = newCtx;		//save new context
			}
		}
	});
	//EC_NODE
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
				app.state.send(Action.SHOW_NODE_TOOLTIP, (this as StateMachine).ctx);
			}
		}
	});
	//EC_DRAG
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
			UP: function (newCtx: IMouseState) {
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
					(app.execute(Action.SELECT_ONLY, `${newCtx.it.id}::${newCtx.it.name}::body`));
				//new way for multiple drag
				self.ctx.dragging =
					app.selectedComponents.map(comp => ({
						ec: comp,
						offset: Point.minus(newCtx.offset, comp.p)
					}));
				app.state.send(Action.HIDE_NODE, newCtx);
				app.rightClick.setVisible(false);
			}
		}
	});
	//EC_BODY
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
				app.state.send(Action.HIDE_NODE, (this as StateMachine).ctx);
				(this as StateMachine).ctx = newCtx;		//save new context
				app.state.send(Action.SHOW_BODY_TOOLTIP, (this as StateMachine).ctx);
			},
		}
	});
	//WIRE_LINE
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
			START: function (newCtx: IMouseState) {
				app.state.send(Action.HIDE_NODE, (this as StateMachine).ctx);	//hides previous node tooltip if any
			}
		}
	});
	//WIRING
	app.state.register(<IMachineState>{
		key: State.WIRING,
		overType: "function",
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
									//console.log("WIRING.OVER -> WIRING_WIRE_NODE.OVER");
									app.state.transition(State.WIRING_WIRE_NODE, Action.START, newCtx);
								}
								break;
							case Type.EC:
								app.state.transition(State.WIRING_EC_NODE, Action.START, newCtx);
								//console.log(`WIRING over ${newCtx.over.type} of: ${newCtx.it.id}`)
								break;
						}
						break;
					case "body":
						app.state.transition(State.WIRING_EC_BODY, Action.START, newCtx);
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
							//open up
							//later implement a priority queue to turn editMode for unused of too far wires
							wire.editMode = true;
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
								app.state.transition(State.WIRING_LINE_DRAG, Action.START, newCtx);
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
						break;
				}
				actionDefaultCopyNewState(newCtx);
			},
			DOWN: actionDefaultCopyNewState,	//state must be saved so MOVE can capture prev
			UP: function (newCtx: IMouseState) {
				(this as StateMachine).ctx = newCtx;		//save new context
				app.rightClick.setVisible(false);
			},
			//transitions
			RESUME: function (newCtx: IMouseState) {
				//resume wiring...
			},
			START: function () {
				//console.log("WIRING.START transition - start wiring editing");
				app.rightClick.setVisible(false);
			},
			STOP: function () {
				//console.log("WIRING.STOP transition - stop wiring editing");
				app.compList
					.forEach(c => (c.type == Type.WIRE) && ((c as Wire).editMode = false));
				app.state.transition(State.IDLE, Action.DEFAULT, void 0);	//go idle
			}
		}
	});
	//WIRING_EC_NODE
	app.state.register(<IMachineState>{
		key: State.WIRING_EC_NODE,
		overType: "deny",
		actions: {
			OUT: function (newCtx: IMouseState) {
				//app.state.send(Action.HIDE_NODE, (this as StateMachine).ctx);
				if (!(this as StateMachine).ctx.disableOut) {
					app.state.transition(State.WIRING, Action.RESUME, newCtx);
					(this as StateMachine).ctx.it.hideNode();
				}
				(this as StateMachine).ctx.disableOut = false;
			},
			UP: function (newCtx: IMouseState) {
				if (newCtx.ctrlKey) {
					app.state.transition(State.WIRING_WIRE_NEW, Action.START, newCtx);
				}
			},
			//transitions
			START: function (newCtx: IMouseState) {
				let
					self = this as StateMachine;
				self.ctx = newCtx;						//save new context
				if (!newCtx.it.nodeBonds(newCtx.over.node)) {
					self.ctx.disableOut = true;
					newCtx.it.showNode(newCtx.over.node);
				}
			}
		}
	});
	//WIRING_LINE_DRAG
	app.state.register(<IMachineState>{
		key: State.WIRING_LINE_DRAG,
		overType: "deny",
		actions: {
			MOVE: function (newCtx: IMouseState) {
				//newCtx.offset has the updated offset, don't save anything here
				let
					self = this as StateMachine,
					ln = self.ctx.over.line;

				self.ctx.it?.setNode(ln - 1, Point.minus(newCtx.offset, self.ctx.A));
				self.ctx.it?.setNode(ln, Point.minus(newCtx.offset, self.ctx.B));

				dash.matchWireLine(self.ctx.it as Wire, self.ctx.over.line)
			},
			UP: function (newCtx: IMouseState) {
				//this catches the UP action too
				removeClass(app.svgBoard, (this as StateMachine).ctx.className);
				dash.hide();
				if (dash.match) {
					let
						ln = (this as StateMachine).ctx.over.line,
						vector = Point.minus(dash.p, dash.wire.getNode(dash.node));
					dash.wire.setNode(ln - 1, Point.plus(dash.wire.getNode(ln - 1), vector));
					dash.wire.setNode(ln, Point.plus(dash.wire.getNode(ln), vector));
				}
				app.state.transition(State.WIRING, Action.START, newCtx);
			},
			OUT: function () {
				//has to be empty so dragging is not STOP when passing over another component
				//console.log("ec_dragging.OUT");
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
	//WIRING_EC_BODY
	app.state.register(<IMachineState>{
		key: State.WIRING_EC_BODY,
		overType: "deny",
		actions: {
			OUT: function (newCtx: IMouseState) {
				app.state.transition(State.WIRING, Action.RESUME, newCtx);
			},
			MOVE: function (newCtx: IMouseState) {
				if ((this as StateMachine).ctx.event == "down"
					&& (this as StateMachine).ctx.button == 0) {
					app.state.transition(State.WIRING_EC_BODY_DRAG, Action.START, newCtx);
					return;
				}
			},
			UP: actionDefaultCopyNewState,
			DOWN: actionDefaultCopyNewState,
			//transitions
			START: function (newCtx: IMouseState) {
				(this as StateMachine).ctx = newCtx;	//save new context
			}
		}
	});
	//WIRING_EC_BODY_DRAG
	app.state.register(<IMachineState>{
		key: State.WIRING_EC_BODY_DRAG,
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
			UP: function (newCtx: IMouseState) {
				//this catches the UP action too, stops dragging
				removeClass(app.svgBoard, (this as StateMachine).ctx.className);
				app.state.transition(State.WIRING_EC_BODY, Action.START, newCtx);
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
	//WIRING_WIRE_NODE
	app.state.register(<IMachineState>{
		key: State.WIRING_WIRE_NODE,
		overType: "deny",
		actions: {
			OUT: function (newCtx: IMouseState) {
				app.state.send(Action.HIDE_NODE, (this as StateMachine).ctx);
				app.state.transition(State.WIRING, Action.RESUME, newCtx);
			},
			MOVE: function (newCtx: IMouseState) {
				if ((this as StateMachine).ctx.event == "down") {
					app.state.transition(State.WIRING_WIRE_NODE_DRAG, Action.START, newCtx);
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
				//we get here from WIRING, so far do nothing
				//console.log("WIRING_WIRE_NODE.OVER transition");
			}
		}
	});
	//WIRING_WIRE_NODE_DRAG
	app.state.register(<IMachineState>{
		key: State.WIRING_WIRE_NODE_DRAG,
		overType: "deny",
		actions: {
			MOVE: function (newCtx: IMouseState) {
				let
					self = this as StateMachine;
				//newCtx.offset has the updated offset, don't save anything here
				//update wire node location
				if (self.ctx.it && self.ctx.it.type == Type.WIRE) {
					//for some reason it's trying to setNode on an EC
					self.ctx.it.setNode(self.ctx.over.node, newCtx.offset);
					//update highlighted wire node location
					self.ctx.it.showNode(self.ctx.over.node);

					dash.matchWireNode(self.ctx.it as Wire, self.ctx.over.node);

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
				dash.hide();
				//released over an EC node
				if (self.ctx.bond) {
					//deselect matched ec node
					self.ctx.bond.ec.select(false);
					//bond components
					self.ctx.it?.bond(self.ctx.nodeNumber,
						self.ctx.bond.ec, self.ctx.bond.node);
					//console.log(`inside: ${self.ctx.bond.ec.id}:[${self.ctx.bond.node}]`);
					app.state.transition(State.WIRING, Action.RESUME, newCtx);
				} else {
					dash.match && (dash.wire.setNode(dash.node, dash.p), dash.wire.showNode(dash.node));
					app.state.transition(State.WIRING_WIRE_NODE, Action.START, newCtx);
				}
			},
			OUT: function () {
				//has to be empty so dragging is not STOP when passing over another component
				//console.log("ec_dragging.OUT");
			},
			//transitions
			START: function (newCtx: IMouseState) {
				let
					self = this as StateMachine;
				//save new context only here, because what changes is only position
				self.ctx = newCtx;
				self.ctx.nodeNumber = self.ctx.over.node;
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
	//WIRING_WIRE_NEW
	app.state.register(<IMachineState>{
		key: State.WIRING_WIRE_NEW,
		overType: "deny",
		actions: {
			ENTER: function (newCtx: IMouseState) {
				//cannot save new context, erases wiring status
				console.log('ENTER board, continue wiring...')
			},
			KEY: function (code: any) {
				if (code == "Escape") {
					delete app.state.ctx.wiring;
					app.state.transition(State.WIRING, Action.RESUME, (this as StateMachine).ctx);
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

				if (newCtx.over.type == "node" && newCtx.it.highlighted) {
					self.ctx.wiring.wire.bond(self.ctx.wiring.wire.last, newCtx.it, newCtx.over.node);
					delete app.state.ctx.wiring;
					app.state.transition(State.WIRING, Action.RESUME, (this as StateMachine).ctx);
					newCtx.it.hideNode();
				} else {
					//correct last node
					self.ctx.wiring.wire.setNode(self.ctx.wiring.wire.last, newCtx.offset);
					self.ctx.wiring.wire.appendNode(newCtx.offset);
				}
				//(newCtx.over.type == "node") && console.log(`click on: ${newCtx.it.id} node: ${newCtx.over.node}`)
			},
			MOVE: function (newCtx: IMouseState) {
				let
					self = this as StateMachine,
					prevNodePos = self.ctx.wiring.wire.getNode(self.ctx.wiring.wire.last - 1),
					r = 7,
					angle = Math.atan2(newCtx.offset.y - prevNodePos.y, newCtx.offset.x - prevNodePos.x),
					p = new Point((newCtx.offset.x - r * Math.cos(angle)) | 0,
						(newCtx.offset.y - r * Math.sin(angle)) | 0);
				self.ctx.wiring.wire.setNode(self.ctx.wiring.wire.last, p);

				(newCtx.over.type == "node")
					&& !newCtx.it.highlighted
					&& !((newCtx.over.node == self.ctx.wiring.start.node) && (newCtx.it.id == self.ctx.wiring.start.ec.id))
					&& (self.ctx.disableOut = true, newCtx.it.showNode(newCtx.over.node));

				//(newCtx.over.type == "node") && console.log(`move over: ${newCtx.it.id} node: ${newCtx.over.node}`);
			},
			AFTER_DELETE: function (deletedId: any) {
				if ((this as StateMachine).ctx.wiring.wire.id == deletedId) {
					//cancel all, components are already disconnected
					delete (this as StateMachine).ctx.wiring;
					app.state.transition(State.WIRING, Action.RESUME, (this as StateMachine).ctx);
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
				self.ctx.wiring = {
					wire: new Wire(<IItemWireOptions>{
						points: <IPoint[]>[
							p,
							p]
					}),
					start: {
						ec: self.ctx.it,
						node: newCtx.over.node
					}
				};
				app.addComponent(self.ctx.wiring.wire);
				//bond components
				self.ctx.it.bond(self.ctx.over.node, self.ctx.wiring.wire, 0);
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
						onChange: function (value: string, where: number) {
							if (where != 1)		// 1 == "ui"
								return;
							//"value" has the string name of the selected component
						}
					},
					cons_log: {
						tag: "#cons-log",
						onChange: function (value: boolean, where: number) {
							app.state.log = value;
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

			app.svgBoard.append(dash.line0);
			app.svgBoard.append(dash.line1);

			hookEvents();
			createStateMachine();

			//enable state machine to accept commands
			app.state.enabled = true;


			//////////////////// TESTINGS /////////////////

			//create default EC first
			app.addComponent(createEC(<string>app.prop("comp_option").value));

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
	//set body height
	qS("body").style.height = arg.height + "px";
	//expand main content height
	let
		mainHeight = qS("body").offsetHeight - qS("body>header").offsetHeight - qS("body>footer").offsetHeight;
	qS("body>main").style.height = mainHeight + "px";
	//update svg board height
	app.board.style.height = mainHeight + "px";
	//set app reference size
	app.size = new Size(arg.width, arg.height);
	app.contentHeight = mainHeight; //console.log(mainHeight);
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