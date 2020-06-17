import { ipcRenderer } from "electron";
import { templatesDOM, qSA, qS, tag } from "./utils"
import * as fs from 'fs';
import * as xml2js from 'xml2js';
import {
	IComponentOptions, StateType as State, ActionType as Action,
	IMachineState, IMouseState, IPoint, IMyAppOptions
} from "./interfaces";
import Comp from "./components";
import { MyApp } from "./myapp";
import { attr, aEL, removeClass, addClass, getParentAttr, range } from "./dab";
import Point from "./point";
import Wire from "./wire";
import StateMachine from "./stateMachine";
import { Type } from "./types";
import { ItemBoard } from "./itemsBoard";
import Size from "./size";
import EC from "./ec";
import Rect from "./rect";
import { Bond } from "./bonds";

let
	app: MyApp,
	showBodyAndTooltip = (offset: Point, label: string) => {
		let
			p = Point.translateBy(offset, app.tooltipOfs);
		app.tooltip.setVisible(true)
			.move(p.x, p.y)
			.setFontSize(app.tooltipFontSize())
			.setText(label);
	},
	hideNodeTooltip = (it: ItemBoard) => {
		app.highlight.hide();
		app.tooltip.setVisible(false);
	},
	showWireConnections = (wire: Wire) => {
		app.sm.data.showWireConnections = true;
		app.highlight.showConnections(getWireConnections(wire));
	},
	hideWireConnections = () => {
		app.sm.data.showWireConnections = false;
		app.highlight.hide();
	},
	cursorDeltas = {
		ArrowLeft: { x: -1, y: 0 },
		ArrowUp: { x: 0, y: -1 },
		ArrowRight: { x: 1, y: 0 },
		ArrowDown: { x: 0, y: 1 }
	},
	cursorBoardHandler = (code: string): boolean | undefined => {
		app.tooltip.setVisible(false);
		app.highlight.setVisible(false);
		//console.log(`BOARD key code: ${code}`)
		switch (code) {
			case 'CtrlKeyA':
				app.execute(Action.SELECT_ALL, "");
				break;
			case 'CtrlKeyS':
				app.saveCircuit(false);
				break;
			case 'CtrlKeyL':
				app.loadCircuit();
				break;
			case 'CtrlKeyN':
				app.newCircuit();
				break;
			case 'CtrlKeyP':
				ipcRenderer.sendSync('print-circuit');
				break;
			case 'CtrlKeyH':
				ipcRenderer.sendSync('help-circuit');
				break;
			case 'Delete':
				app.execute(Action.DELETE_SELECTED, "");
				break;
			case 'ArrowLeft':
			case 'ArrowUp':
			case 'ArrowRight':
			case 'ArrowDown':
				let
					vector = cursorDeltas[code];
				app.circuit.selectedComponents
					.forEach(comp => comp.move(comp.x + vector.x, comp.y + vector.y));
				app.circuit.modified = true;
				app.updateCircuitLabel();
				break;
		}
		return;
	};

//experimental
let
	ecCircles = {
		g: tag("g", "ec-circles", {
			class: "hide"
		})
	};

function hookEvents() {
	//ZOOM controls
	qSA('.bar-item[data-scale]').forEach((item: any) => {
		aEL(item, "click", (e: MouseEvent) => {
			let
				scaleTarget = getParentAttr(<HTMLElement>e.target, "data-scale"),
				o = attr(scaleTarget, "data-scale"),
				m = parseFloat(o);
			if (app.circuit.zoom != m)
				app.circuit.modified = true;
			app.updateCircuitLabel();
			app.setBoardZoom(app.circuit.zoom = m);
		}, false);
	});
	//Rotations
	aEL(qS('.bar-item[rot-dir="left"]'), "click", () => app.rotateEC(-45), false);
	aEL(qS('.bar-item[rot-dir="right"]'), "click", () => app.rotateEC(45), false);
	//add component
	aEL(qS('.bar-item[action="comp-create"]'), "click", () => {
		let
			comp = app.circuit.add(<any>{
				name: <string>app.prop("comp_option").value,
				x: app.center.x,
				y: app.center.y
			});
		comp && (app.addToDOM(comp), app.updateCircuitLabel());
	}, false);
	//ViewBox Reset
	aEL(qS('.bar-item[tool="vb-focus"]'), "click", () => app.updateViewBox(app.circuit.zoom, 0, 0), false);
	//File Open
	aEL(qS('.bar-item[file="open"]'), "click", () => app.loadCircuit(), false);
	//Save File
	aEL(qS('.bar-item[file="save"]'), "click", () => app.saveCircuit(false), false);
}

function getWireConnections(wire: Wire): Point[] {
	let
		wireCollection: Wire[] = [wire],
		wiresFound: string[] = [],
		points: Point[] = [],
		findComponents = (bond: Bond) => {
			bond.to.forEach(b => {
				let
					w = app.circuit.get(b.id);
				if (!w)
					throw `Invalid bond connections`;			//shouldn't happen, but to catch wrong code
				switch (b.type) {
					case Type.WIRE:
						if (!wiresFound.some(id => id == b.id)) {
							wiresFound.push(w.id);
							wireCollection.push(w as Wire);
							points.push(Point.create(w.getNode(b.ndx)));
						}
						break;
					case Type.EC:
						points.push((w as EC).getNodeRealXY(b.ndx));
						break;
				}
			})
		};
	while (wireCollection.length) {
		let
			w = <Wire>wireCollection.shift();
		wiresFound.push(w.id);
		w.bonds.forEach(findComponents);
	}
	return points
}

function registerBoardState() {
	app.sm.register(<IMachineState>{
		key: State.BOARD,
		overType: "function",	//forward
		persistData: true,
		data: {
		},
		actions: {
			KEY: cursorBoardHandler,
			ENTER: function (newCtx: IMouseState) {
				//console.log('BOARD.ENTER')
				app.sm.data.panningVector = void 0;
				app.sm.data.selection = false;
				app.selection.hide();
				app.sm.data.mouseDown = false;
				removeClass(app.svgBoard, "dragging");
			},
			LEAVE: function (newCtx: IMouseState) {
				app.bottomBarLeft.innerHTML = "&nbsp;";
				//console.log('BOARD.LEAVE', newCtx)
			},
			OUT: function (newCtx: IMouseState) {
				//out of any component in the board
				//console.log('BOARD.OUT', newCtx)
			},
			OVER: function (newCtx: IMouseState) {
				if (!newCtx.it || app.sm.data.panningVector || app.sm.data.selection || !newCtx.it)
					return;
				//
				switch (newCtx.over.type) {
					case "node":
						app.sm.transition(State.EC_NODE, Action.START, newCtx, {
							it: newCtx.it,
							node: newCtx.over.node
						})
						break;
					case "line":
						(newCtx.it as Wire).editMode = true;
						app.sm.transition(State.WIRE_LINE, Action.START, newCtx, {
							it: newCtx.it,
							line: newCtx.over.line
						})
						break;
					case "body":
						app.sm.transition(State.EC_BODY, Action.START, newCtx, {
							it: newCtx.it
						})
						break;
				}
			},
			MOVE: function (newCtx: IMouseState) {
				//Board panning
				if (newCtx.altKey) {
					if (app.sm.data.panningVector) {
						app.updateViewBox(
							app.circuit.zoom,
							newCtx.client.x - app.sm.data.panningVector.x,
							newCtx.client.y - app.sm.data.panningVector.y
						)
					}
					return;
				} else
					app.sm.data.panningVector = void 0;
				//Selection Rect
				if (app.sm.data.mouseDown) {
					if (!app.sm.data.selection) {
						//start new selection
						app.sm.data.selection = true;
						app.selection.show(newCtx.offset);
						//console.log('startig: ', app.selection.rect)
					}
					else
						app.selection.calculate(newCtx.offset);
					return;
				}
				if (!newCtx.it)
					return;
				//
				switch (newCtx.over.type) {
					case "node":
						console.log(`move: ${newCtx.it.id} node: ${newCtx.over.node}`);
						break;
					case "line":
						//wire should be opened here
						//newCtx.over.line is 0 when wire opened up
						app.sm.transition(State.WIRE_LINE, Action.START, newCtx, {
							it: newCtx.it,
							line: newCtx.over.line
						})
						break;
					case "body":
						//  rarely happens	¿?
						console.log('transition on BOARD.MOVE')
						app.sm.transition(State.EC_BODY, Action.START, newCtx, {
							it: newCtx.it
						})
						break;
				}
			},
			DOWN: function (newCtx: IMouseState) {
				//Board pan
				if (newCtx.altKey) {
					addClass(app.svgBoard, "dragging");
					app.sm.data.panningVector = new Point(newCtx.client.x - app.viewBox.x, newCtx.client.y - app.viewBox.y)
				} else {
					//Board item selection box
					app.sm.data.mouseDown = true;
				}
			},
			UP: function (newCtx: IMouseState) {
				app.sm.data.mouseDown = false;
				if (newCtx.button == 0)
					app.execute(Action.UNSELECT_ALL, "");
				app.rightClick.setVisible(false);
				app.sm.data.panningVector && (
					app.sm.data.panningVector = void 0,
					removeClass(app.svgBoard, "dragging")
				)
				if (app.sm.data.selection) {
					app.sm.data.selection = false;
					//console.log('ending: ', app.selection.rect);
					app.circuit.selectRect(app.selection.rect);
					app.selection.hide();
				}
			},
			//transitions
			START: function () {
				throw 'BOARD.START ILLEGAL, to catch lose code'
			},
			RESUME: function () {
				app.sm.data.mouseDown = false;
				app.sm.data.panningVector = void 0;
				app.sm.data.selection = false;
				app.selection.hide();
				app.highlight.hide();
				hideWireConnections();
			}
		}
	});
}
function registerEcBodyState() {
	app.sm.register(<IMachineState>{
		key: State.EC_BODY,
		overType: "deny",
		actions: {
			KEY: cursorBoardHandler,
			MOVE: function (newCtx: IMouseState) {
				if (app.sm.data.mouseDown
					&& app.sm.data.button == 0) {
					app.sm.transition(State.EC_DRAG, Action.START, newCtx, {
						it: app.sm.data.it
					});
				} else {
					let
						ec = (app.sm.data.it as EC),
						node = ec.overNode(newCtx.offset, 0);
					if (node != -1) {
						app.tooltip.setVisible(false);
						app.sm.transition(State.EC_NODE, Action.START, newCtx, {
							it: ec,
							node: node
						})
					} else {
						let
							p = Point.translateBy(newCtx.offset, app.tooltipOfs);
						app.tooltip.move(p.x, p.y);
					}
				}
			},
			OUT: function () {
				app.tooltip.setVisible(false);
				app.sm.transition(State.BOARD, Action.RESUME);
			},
			DOWN: function (newCtx: IMouseState) {
				app.sm.data.mouseDown = true;
				app.sm.data.button = newCtx.button;
			},
			UP: function (newCtx: IMouseState) {
				app.sm.data.mouseDown = false;
				app.rightClick.setVisible(false);
				(newCtx.button == 0) && app.execute(
					newCtx.ctrlKey ?
						Action.TOGGLE_SELECT :  // Ctrl+click	=> toggle select
						Action.SELECT,  		// click		=> select one
					[newCtx.it?.id, newCtx.it?.name, "body"].join('::'));
			},
			//transitions
			START: function (newCtx: IMouseState) {
				showBodyAndTooltip(newCtx.offset, app.sm.data.it.id);
				app.sm.data.mouseDown = false;
				app.sm.data.button = newCtx.button;
			}
		}
	});
}
function registerEcDragState() {
	app.sm.register(<IMachineState>{
		key: State.EC_DRAG,
		overType: "deny",
		actions: {
			MOVE: function (newCtx: IMouseState) {
				(this as StateMachine).data.dragging.forEach((comp: { ec: ItemBoard, offset: Point }) => {
					let
						p = Point.minus(newCtx.offset, comp.offset);
					comp.ec.move(p.x, p.y);
				});
				(app.circuit.ec?.id == app.winProps.compId) && app.winProps.property("p")?.refresh();
			},
			OUT: function () {
				//has to be empty so dragging is not STOP when passing over another component
			},
			UP: function (newCtx: IMouseState) {
				removeClass(app.svgBoard, (this as StateMachine).data.className);
				app.sm.transition(State.EC_BODY, Action.START, newCtx, {
					it: app.sm.data.it
				});
			},
			//transitions
			START: function (newCtx: IMouseState) {
				let
					self = this as StateMachine,
					it = self.data.it,
					newCtxIt = <ItemBoard>newCtx.it;
				if (!newCtxIt)
					throw `EC_DRAG on undefined EC`;
				!app.circuit.selectedComponents.some(comp => comp.id == newCtxIt.id) &&
					(app.execute(Action.SELECT, `${newCtxIt.id}::${newCtxIt.name}::body`));
				self.data = {
					it: it,
					className: "dragging",
					dragging: app.circuit.selectedComponents.map(comp => ({
						ec: comp,
						offset: Point.minus(newCtx.offset, comp.p)
					}))
				};
				app.circuit.modified = true;
				app.updateCircuitLabel();
				addClass(app.svgBoard, self.data.className);
				hideNodeTooltip(newCtxIt);
				app.rightClick.setVisible(false);
			},
		}
	});
}
function registerEcNodeState() {
	app.sm.register(<IMachineState>{
		key: State.EC_NODE,
		overType: "deny",
		actions: {
			KEY: cursorBoardHandler,
			MOVE: function (newCtx: IMouseState) {
				let
					node = app.sm.data.it.overNode(newCtx.offset, 0),
					p = Point.translateBy(newCtx.offset, app.tooltipOfs);
				if (node == -1) {
					app.tooltip.setVisible(false);
					app.sm.transition(State.BOARD, Action.RESUME);
				} else
					app.tooltip.move(p.x, p.y);
			},
			UP: function (newCtx: IMouseState) {
				if (newCtx.ctrlKey) {
					app.tooltip.setVisible(false);
					app.sm.transition(State.NEW_WIRE_FROM_EC, Action.START, newCtx, {
						start: {
							it: app.sm.data.it,
							node: app.sm.data.node
						}
					});
				}
			},
			//transitions
			START: function (newCtx: IMouseState) {
				let
					it = (app.sm.data.it as EC),
					node: number = app.sm.data.node,
					itemNode = it.getNode(node),
					label = itemNode.label,
					p = Point.plus(it.p, it.rotation ? itemNode.rot : itemNode).round();
				app.highlight.show(p.x, p.y, it.id, node)
				showBodyAndTooltip(newCtx.offset, `${node} -${label}`);
			},
		}
	});
}
function registerNewWireFromEcState() {
	app.sm.register(<IMachineState>{
		key: State.NEW_WIRE_FROM_EC,
		overType: "function",
		actions: {
			KEY: function (code: any) {
				if (code == "Escape") {
					app.sm.data.wire.editMode = true;
					app.sm.data.selectedItem?.it.select(false);
					app.highlight.hide();
					app.sm.transition(State.BOARD, Action.RESUME);
				}
			},
			UP: function (newCtx: IMouseState) {
				let
					self = this as StateMachine,
					wire = self.data.wire as Wire;
				if (self.data.selectedItem) {
					let
						destIt = self.data.selectedItem.it as ItemBoard,
						destNode = self.data.selectedItem.node as number;
					wire.editMode = true;
					destIt.select(false);
					wire.bond(wire.last, destIt, destNode);
					app.highlight.hide();
					app.sm.transition(State.BOARD, Action.RESUME);
				} else {
					//otherwise correct last node
					wire.setNode(wire.last, newCtx.offset);
					wire.appendNode(newCtx.offset);
				}
			},
			OUT: function (newCtx: IMouseState) {
				if (newCtx.over.type == "node") {	//"node-x"
					app.sm.data.selectedItem?.it.select(false);
					app.sm.data.selectedItem = undefined;
					app.highlight.hide();
				}
			},
			OVER: function (newCtx: IMouseState) {
				let
					node = -1,
					pos: IPoint = <any>void 0,
					it = newCtx.it;
				if (!it)
					return;
				switch (newCtx.over.type) {
					case "body":
						pos = (it as EC).getNodeRealXY(node = it.findNode(newCtx.offset));
						break;
					case "line":
						pos = it.getNode(node = (it as Wire).findLineNode(newCtx.offset, newCtx.over.line))
						break;
				}
				if (it.id != app.sm.data.wire.id
					&& pos
					&& !(it.type == Type.WIRE && (node == 0 || node == it.last))) {
					if (app.sm.data.selectedItem && app.sm.data.selectedItem.it.id != it.id) {
						app.sm.data.selectedItem.it.select(false);
					}
					(app.sm.data.selectedItem = {
						it: it,
						node: node
					}).it.select(true);
					app.highlight.show(pos.x, pos.y, it.id, node);
				}
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
			},
			AFTER_DELETE: function (deletedId: any) {
				if (app.sm.data.wire.id == deletedId) {
					app.sm.transition(State.BOARD, Action.RESUME);
				}
			},
			//transitions
			START: function () {
				let
					ec = (app.sm.data.start.it as ItemBoard),
					node = app.sm.data.start.node,
					pos = app.sm.data.start.fromWire ? ec.getNode(node) : (ec as EC).getNodeRealXY(node);
				app.highlight.hide();
				app.sm.data.wire = app.circuit.add(<any>{
					name: "wire",
					points: <IPoint[]>[pos, pos]
				});
				app.addToDOM(app.sm.data.wire);
				app.updateCircuitLabel();
				app.sm.data.wire.bond(0, ec, node);
				app.execute(Action.UNSELECT_ALL, "");
				app.sm.data.selectedItem = undefined;
			},
		}
	});
}
function registerWireLineState() {
	app.sm.register(<IMachineState>{
		key: State.WIRE_LINE,
		overType: "deny",
		actions: {
			KEY: cursorBoardHandler,
			OUT: function (newCtx: IMouseState) {
				if (!newCtx.it || app.sm.data.node == -1) {
					app.highlight.hide();
					app.tooltip.setVisible(false);
					app.sm.transition(State.BOARD, Action.RESUME);
					if (app.sm.data.showWireConnections) {
						hideWireConnections();
					}
				}
			},
			MOVE: function (newCtx: IMouseState) {
				if (app.sm.data.wiringFromNode)
					return;
				let
					wire = (app.sm.data.it as Wire),
					line = newCtx.over.line;
				if (app.sm.data.showWireConnections) {
					hideWireConnections();
				}
				if (app.sm.data.mouseDown
					&& newCtx.button == 0) {
					//node or line
					if (app.sm.data.node >= 0) {
						app.sm.transition(State.WIRE_NODE_DRAG, Action.START, newCtx, {
							it: app.sm.data.it,
							node: app.sm.data.node
						})
					} else if (!((line == 1 && wire.nodeBonds(0))
						|| (line == wire.lastLine && wire.nodeBonds(wire.last)))
					) {
						app.sm.transition(State.WIRE_LINE_DRAG, Action.START, newCtx, {
							it: app.sm.data.it,
							line: line
						})
					} else {
						app.sm.transition(State.BOARD, Action.RESUME);
					}
					app.sm.data.mouseDown = false;
					return;
				}
				app.sm.data.mouseDown = false;
				let
					node = wire.overNode(newCtx.offset, newCtx.over.line),
					pos = wire.getNode(node);
				if (pos && !(
					(node == 0 && wire.nodeBonds(0)) ||
					(node == wire.last && wire.nodeBonds(wire.last))
				)) {
					app.sm.data.node = node;
					app.highlight.show(pos.x, pos.y, wire.id, node);
				} else {
					let
						p = Point.translateBy(newCtx.offset, app.tooltipOfs);
					!app.tooltip.move(p.x, p.y).visible
						&& app.tooltip.setVisible(true);
				}
			},
			DOWN: function (newCtx: IMouseState) {
				app.tooltip.setVisible(false);
				if (newCtx.ctrlKey) {
					let
						wire = app.sm.data.it as Wire;
					if (app.sm.data.node > 0 && app.sm.data.node < wire.last) {
						app.sm.data.wiringFromNode = true;
					} else
						showWireConnections(wire);
				} else
					app.sm.data.mouseDown = true;
			},
			UP: function (newCtx: IMouseState) {
				if (app.sm.data.wiringFromNode) {
					app.sm.transition(State.NEW_WIRE_FROM_EC, Action.START, newCtx, {
						start: {
							it: app.sm.data.it,
							node: app.sm.data.node,
							fromWire: true
						},
					});
					return;
				}
				app.rightClick.setVisible(false);
				(newCtx.button == 0
					&& app.sm.data.mouseDown)
					&& (app.sm.data.mouseDown = false,
						app.execute(
							newCtx.ctrlKey ?
								Action.TOGGLE_SELECT :  // Ctrl+click	=> toggle select
								Action.SELECT,  		// click		=> select one
							[app.sm.data.it.id, app.sm.data.it.name, "body"].join('::')));
				if (app.sm.data.showWireConnections) {
					hideWireConnections();
				}
				showBodyAndTooltip(newCtx.offset, app.sm.data.it.id);
			},
			//transitions
			START: function (newCtx: IMouseState) {
				app.sm.data.node = -1;
				app.sm.data.mouseDown = false;
				app.sm.data.showWireConnections = false;
				app.sm.data.wiringFromNode = false;
				showBodyAndTooltip(newCtx.offset, app.sm.data.it.id);
			},
		}
	});
}
function registerWireNodeDragState() {
	app.sm.register(<IMachineState>{
		key: State.WIRE_NODE_DRAG,
		overType: "deny",
		actions: {
			KEY: function (code: any) {
			},
			MOVE: function (newCtx: IMouseState) {
				app.sm.data.it.setNode(app.sm.data.node, newCtx.offset);
				app.highlight.show(newCtx.offset.x, newCtx.offset.y, app.sm.data.it.id, app.sm.data.node);
				let
					wire = app.sm.data.it as Wire,
					wireNode = app.sm.data.node;
				if (newCtx.ctrlKey && (
					wireNode == 0 || wireNode == wire.last
				)) {
					let
						item = (app.sm.data.list as { it: ItemBoard, r: Rect }[])
							.filter(c => c.r.inside(newCtx.offset))
							.map((c) => {
								let
									node = c.it.findNode(newCtx.offset);
								return {
									it: c.it,
									node: node
								}
							})
							.filter(c => (c.node != -1)
								&& !(c.it.type == Type.WIRE && (c.node == 0 || c.node == c.it.last))
							)[0];
					if (item) {
						if (app.sm.data.selectedItem && app.sm.data.selectedItem.it.id != item.it.id) {
							app.sm.data.selectedItem.it.select(false);
						}
						(app.sm.data.selectedItem = item).it.select(true);
					} else if (app.sm.data.selectedItem) {
						app.sm.data.selectedItem.it.select(false);
					}
					app.dash.hide();
				}
				else
					app.dash.matchWireNode(app.sm.data.it as Wire, app.sm.data.node);
			},
			UP: function (newCtx: IMouseState) {
				removeClass(app.svgBoard, (this as StateMachine).data.className);
				app.highlight.hide();
				app.dash.hide();
				if (app.sm.data.selectedItem) {
					app.sm.data.selectedItem.it.select(false);
					app.sm.data.it.bond(app.sm.data.node, app.sm.data.selectedItem.it, app.sm.data.selectedItem.node);
				}
				else {
					app.dash.match
						&& (app.dash.wire.setNode(app.dash.node, app.dash.p));
				}
				app.sm.transition(State.BOARD, Action.RESUME, newCtx);
			},
			OUT: function () {
				//has to be empty so dragging is not STOP when passing over another component
			},
			//transitions
			START: function () {
				addClass(app.svgBoard, app.sm.data.className = "dragging");
				app.rightClick.setVisible(false);
				let
					screenBounds = Rect.create(app.viewBox),
					id = app.sm.data.it.id;
				app.sm.data.list = app.circuit.components
					.filter(item => item.id != id)
					.map((item) => {
						let
							r = item.rect();
						screenBounds.intersect(r);
						return {
							it: item,
							r: r
						}
					}).filter(elem => !elem.r.empty);
				app.circuit.modified = true;
				app.updateCircuitLabel();
				app.sm.data.selectedItem = undefined;
				app.sm.data.it.select(false);
			},
		}
	});
}
function registerWireLineDragState() {
	app.sm.register(<IMachineState>{
		key: State.WIRE_LINE_DRAG,
		overType: "deny",
		actions: {
			MOVE: function (newCtx: IMouseState) {
				let
					self = this as StateMachine,
					line = self.data.line;
				self.data.it.setNode(line - 1, Point.minus(newCtx.offset, self.data.A));
				self.data.it.setNode(line, Point.minus(newCtx.offset, self.data.B));
				app.dash.matchWireLine(self.data.it as Wire, line)
			},
			UP: function (newCtx: IMouseState) {
				removeClass(app.svgBoard, app.sm.data.className);
				app.dash.hide();
				if (app.dash.match) {
					let
						line = app.sm.data.line,
						vector = Point.minus(app.dash.p, app.dash.wire.getNode(app.dash.node));
					//there's a rare exceptio here
					app.dash.wire.setNode(line - 1, Point.plus(app.dash.wire.getNode(line - 1), vector));
					app.dash.wire.setNode(line, Point.plus(app.dash.wire.getNode(line), vector));
				}
				app.sm.transition(State.BOARD, Action.RESUME, newCtx);
			},
			OUT: function () {
				//has to be empty so dragging is not STOP when passing over another component
			},
			//transitions
			START: function (newCtx: IMouseState) {
				let
					wire = app.sm.data.it as Wire,
					line = app.sm.data.line as number;
				app.sm.data.A = Point.minus(newCtx.offset, wire.getNode(line - 1))
				app.sm.data.B = Point.minus(newCtx.offset, wire.getNode(line));
				addClass(app.svgBoard, app.sm.data.className = "dragging");
				app.rightClick.setVisible(false);
				app.circuit.modified = true;
				app.updateCircuitLabel();
			},
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
	templatesDOM("viewBox01|size01|point01|baseWin01|ctxWin01|ctxItem01|propWin01|dialogWin01|formWin01")
		.then(async (templates: Object) => {
			let
				json = readJson('./dist/data/library-circuits.v2.json');
			json.forEach((element: IComponentOptions) => {
				Comp.register(element);
			});
			json = readJson('./dist/data/context-menu.json');
			app = new MyApp(<IMyAppOptions>{
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
					},
					theme_select: {
						tag: 'select[tool="theme-select"]',
						onChange: function (value: string, where: number) {
							(where == 1)	// 1 == "ui"
								&& (document.body.className != value)
								&& (document.body.className = value);
						}
					}
				},
				list: json
			});
			updateViewBox(ipcRenderer.sendSync('get-win-size', ''));
			app.board.appendChild(app.winProps.win);
			app.board.appendChild(app.rightClick.win);
			app.svgBoard.append(app.dash.g);
			app.svgBoard.append(app.selection.g);
			app.svgBoard.append(app.tooltip.g);
			app.svgBoard.append(app.highlight.g);
			qS('body>footer').insertAdjacentElement("afterend", app.dialog.win);
			qS('body>footer').insertAdjacentElement("afterend", app.form.win);

			//experimental
			//app.svgBoard.append(ecCircles.g);


			hookEvents();
			//register states
			registerBoardState();
			registerEcBodyState();
			registerEcDragState();
			registerEcNodeState();
			registerNewWireFromEcState();
			registerWireLineState();
			registerWireNodeDragState();
			registerWireLineDragState();
			app.sm.enabled = true;

			//////////////////// TESTINGS /////////////////
			//(<any>window).win = app.winProps;
			//(<any>window).combo = app.prop("comp_option");
			(<any>window).tooltip = app.tooltip;
			(<any>window).rc = app.rightClick;
			(<any>window).Rect = Rect;
			(<any>window).MyApp = app;
			(<any>window).dialog = app.dialog;

			console.log(`We are using Node.js ${process.versions.node}, Chromium ${process.versions.chrome}, and Electron ${process.versions.electron}`)
			//////////////////// TESTINGS /////////////////
		})
		.catch((ex: any) => {
			console.log(ex)
		});
});

function updateViewBox(arg: any) {
	qS("body").style.height = arg.height + "px";
	let
		mainHeight = qS("body").offsetHeight - qS("body>header").offsetHeight - qS("body>footer").offsetHeight;
	qS("body>main").style.height = mainHeight + "px";
	app.board.style.height = mainHeight + "px";
	app.size = new Size(arg.width, arg.height);
	app.contentHeight = mainHeight;
	app.updateViewBox(app.circuit.zoom);
}

ipcRenderer.on("win-resize", (event, arg) => {
	updateViewBox(arg)
});

ipcRenderer.on("check-before-exit", (event, arg) => {
	if (app.dialog.visible
		|| app.form.visible
		|| app.circuitLoadingOrSaving)
		return;

	app.saveCircuit(true)
		.then(choice => {
			let
				exit = false;
			switch (choice) {		// Save:0, Cancel: 1, Error: 5
				case 5:
				//show error and exit
				//....
				case 0:	// Save
				case 2:	// Don't Save
				case 3:	// Not Modified
					exit = true;
					break;
			}
			if (exit)
				ipcRenderer.send('app-quit', '')
		})
});

//this's a proof of concept of how to communicate with main process, the recommended NEW way...
console.log(ipcRenderer.sendSync('synchronous-message', 'ping')) // prints "pong"
ipcRenderer.on('asynchronous-reply', (event, arg) => {
	console.log(arg) // prints "pong"
})
ipcRenderer.send('asynchronous-message', 'ping')
//remote.getGlobal('sharedObj')	will be deprecated soon
//https://www.electronjs.org/docs/tutorial/security

/*
let
				a = await ipcRenderer.invoke('shared', 'app');
			console.log("global.app =", a);

			console.log("global.app.circuit.modified =",
				await ipcRenderer.invoke('shared-data', ['app.circuit.modified']));

			console.log("global.app.circuit.modified = true; =>",
				await ipcRenderer.invoke('shared-data', ['app.circuit.modified', true]));

			console.log("global.app.circuit.modified =",
				await ipcRenderer.invoke('shared-data', ['app.circuit.modified']));

				*/