import { ipcRenderer } from "electron";
import { templatesDOM, qSA, qS } from "./src/utils"
import * as fs from 'fs';
import {
	IComponentOptions, IApplicationOptions, StateType as State, ActionType as Action,
	IMachineState, IMouseState, IItemWireOptions, IPoint, IItemSolidOptions
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
import Rect from "src/rect";

let
	app: MyApp;

//https://www.electronjs.org/docs/tutorial/security

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
	//add component
	aEL(qS('.bar-item[action="comp-create"]'), "click", () =>
		app.addComponent(createEC(<string>app.prop("comp_option").value)), false);
}

function registerStates() {
	let
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
		};
	//BOARD
	app.sm.register(<IMachineState>{
		key: State.BOARD,
		overType: "function",	//forward
		//persistData: true,
		data: {
		},
		actions: {
			ENTER: function (newCtx: IMouseState) {
				//console.log('BOARD.ENTER')
			},
			LEAVE: function (newCtx: IMouseState) {
				app.topBarLeft.innerHTML = "&nbsp;";
			},
			OUT: function (newCtx: IMouseState) {
				//console.log('BOARD.OUT', newCtx)
			},
			OVER: function (newCtx: IMouseState) {
				if (!newCtx.it) {
					//console.log('BOARD.OVER');
					return
				}
				switch (newCtx.over.type) {
					case "node":
						app.sm.transition(State.EC_NODE, Action.START, newCtx, {
							it: newCtx.it,
							node: newCtx.over.node
						})
						break;
					case "line":
						(newCtx.it as Wire).editMode = true;			//not in editMode
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
					default:
						break;
				}
			},
			MOVE: function (newCtx: IMouseState) {
				if (!newCtx.it)
					return;
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
					default:
						break;
				}
			},
			UP: function (newCtx: IMouseState) {
				if (newCtx.button == 0)
					app.execute(Action.UNSELECT_ALL, 'board::board::board');
				app.rightClick.setVisible(false);
			},
			//transitions
			START: function () {
				throw 'BOARD.START ILLEGAL'
			},
			RESUME: function () {
				app.sm.data = {};
				app.highlight.hide();
			}
		}
	});
	//EC_BODY
	app.sm.register(<IMachineState>{
		key: State.EC_BODY,
		overType: "deny",
		actions: {
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
					if (node != -1
						//&& !ec.nodeBonds(node)
					) {
						//console.log('over node:' + node);
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
					[newCtx.it.id, newCtx.it.name, "body"].join('::'));
			},
			//transitions
			START: function (newCtx: IMouseState) {
				showBodyAndTooltip(newCtx.offset, app.sm.data.it.id);
				app.sm.data.mouseDown = false;
				app.sm.data.button = newCtx.button;
			}
		}
	});
	//EC_DRAG
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
				(app.ec?.id == app.winProps.compId) && app.winProps.property("p")?.refresh();
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
					it = self.data.it;
				!app.selectedComponents.some(comp => comp.id == newCtx.it.id) &&
					(app.execute(Action.SELECT_ONLY, `${newCtx.it.id}::${newCtx.it.name}::body`));
				self.data = {
					it: it,
					className: "dragging",
					dragging: app.selectedComponents.map(comp => ({
						ec: comp,
						offset: Point.minus(newCtx.offset, comp.p)
					}))
				};
				addClass(app.svgBoard, self.data.className);
				hideNodeTooltip(newCtx.it);
				app.rightClick.setVisible(false);
			},
		}
	});
	//EC_NODE
	app.sm.register(<IMachineState>{
		key: State.EC_NODE,
		overType: "deny",
		actions: {
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
				app.highlight.show(p.x, p.y, node)
				showBodyAndTooltip(newCtx.offset, `${node} -${label}`);
			},
		}
	});
	//NEW_WIRE_FROM_EC
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
					self = this as StateMachine;
				if (self.data.selectedItem) {
					app.sm.data.wire.editMode = true;
					app.sm.data.selectedItem?.it.select(false);
					self.data.wire.bond(self.data.wire.last, self.data.selectedItem.it, self.data.selectedItem.node);
					app.highlight.hide();
					app.sm.transition(State.BOARD, Action.RESUME);
				} else {
					//otherwise correct last node
					self.data.wire.setNode(self.data.wire.last, newCtx.offset);
					self.data.wire.appendNode(newCtx.offset);
				}
			},
			OUT: function (newCtx: IMouseState) {
				if (newCtx.over.type == "node-x") {
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
				switch (newCtx.over.type) {
					case "body":
						pos = (it as EC).getNodeRealXY(node = it.findNode(newCtx.offset));
						break;
					case "line":
						pos = it.getNode(node = (it as Wire).findLineNode(newCtx.offset, newCtx.over.line))
						break;
				}
				if (it?.id != app.sm.data.wire.id && pos) {
					if (app.sm.data.selectedItem && app.sm.data.selectedItem.it.id != newCtx.it.id) {
						app.sm.data.selectedItem.it.select(false);
					}
					(app.sm.data.selectedItem = {
						it: newCtx.it,
						node: node
					}).it.select(true);
					app.highlight.show(pos.x, pos.y, node);
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
					ec = (app.sm.data.start.it as EC),
					node = app.sm.data.start.node,
					pos = ec.getNode(node),
					p = new Point(pos.x, pos.y);
				app.highlight.hide();
				p = Point.plus(p, ec.p);
				app.sm.data.wire = new Wire(<IItemWireOptions>{
					//class: "wiring",
					points: <IPoint[]>[p, p]
				});
				app.addComponent(app.sm.data.wire);
				app.sm.data.wire.bond(0, ec, node);
				app.execute(Action.UNSELECT_ALL, "");
				app.sm.data.selectedItem = undefined;
			},
		}
	});
	//WIRE_LINE
	app.sm.register(<IMachineState>{
		key: State.WIRE_LINE,
		overType: "deny",
		actions: {
			OUT: function (newCtx: IMouseState) {
				if (!newCtx.it || app.sm.data.node == -1) {	
					app.highlight.hide();
					app.sm.transition(State.BOARD, Action.RESUME);
				}
			},
			MOVE: function (newCtx: IMouseState) {
				let
					wire = (app.sm.data.it as Wire),
					line = newCtx.over.line;
				if (app.sm.data.mouseDown
					&& app.sm.data.button == 0) {
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
					app.highlight.show(pos.x, pos.y, node);
				}
			},
			DOWN: function (newCtx: IMouseState) {
				app.sm.data.mouseDown = true;
				app.sm.data.button = newCtx.button;
			},
			UP: function () {
				app.sm.data.mouseDown = false;
				app.execute(Action.SELECT, [app.sm.data.it.id, app.sm.data.it.name, "body"].join('::'));
			},
			//transitions
			START: function (newCtx: IMouseState) {
				app.sm.data.node = -1;
				app.sm.data.mouseDown = false;
				app.sm.data.button = newCtx.button;
			},
		}
	});
	//WIRE_NODE_DRAG
	app.sm.register(<IMachineState>{
		key: State.WIRE_NODE_DRAG,
		overType: "deny",
		actions: {
			KEY: function (code: any) {
			},
			MOVE: function (newCtx: IMouseState) {
				app.sm.data.it.setNode(app.sm.data.node, newCtx.offset);
				app.highlight.show(newCtx.offset.x, newCtx.offset.y, app.sm.data.node)
					;
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
				app.sm.data.list = Comp.itemCollection
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
				app.sm.data.selectedItem = undefined;
				app.sm.data.it.select(false);
			},
		}
	});
	//WIRE_LINE_DRAG
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
			updateViewBox(ipcRenderer.sendSync('get-win-size', ''));	//set SVG viewBox values
			app.board.appendChild(app.winProps.win);					//add HtmlWindow to board
			app.board.appendChild(app.rightClick.win);					//add right-click window
			app.svgBoard.append(app.dash.g);
			app.svgBoard.append(app.tooltip.g);							//top z-index SVG 
			app.svgBoard.append(app.highlight.g);

			hookEvents();
			registerStates();
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
			(<any>window).Rect = Rect;
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