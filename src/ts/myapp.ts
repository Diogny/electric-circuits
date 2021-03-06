import { ipcRenderer } from "electron";
import { Application } from "./app";
import {
	IMyApp, ITooltipText, IAppWindowOptions, IStateMachineOptions, StateType, ActionType, IMouseState, IContextMenuOptions, IMyAppOptions, ITemplate
} from "./interfaces";
import { basePath, qS, pad, qSA } from "./utils";
import Rect from "./rect";
import Size from "./size";
import Point from './point';
import Tooltip from "./tooltip";
import { attr, aEL, removeClass, addClass } from "./dab";
import AppWindow from "./app-window";
import StateMachine from "./stateMachine";
import ContextWindow from "./context-window";
import { ItemBoard } from "./itemsBoard";
import EC from "./ec";
import { Type } from "./types";
import LinesAligner from "./linealign";
import HighlightNode from "./highlightNode";
import Wire from "./wire";
import { SelectionRect } from "./selection-rect";
import { Circuit } from "./circuit";
import { FormWindow, DialogWindow } from "./dialog-windows";
import { Templates } from "./templates";
import ActionManager from "./action-manager";

export class MyApp extends Application implements IMyApp {

	readonly rootDir: string;
	readonly board: HTMLElement;
	readonly ratio: number;
	readonly svgBoard: SVGElement;
	readonly tooltip: Tooltip;
	readonly bottomBarLeft: HTMLElement;
	readonly bottomBarCenter: HTMLElement;
	readonly circuitName: HTMLDivElement;
	readonly winProps: AppWindow;
	readonly sm: StateMachine;
	readonly rightClick: ContextWindow;
	readonly dash: LinesAligner;
	readonly highlight: HighlightNode;
	readonly selection: SelectionRect;
	readonly dialog: DialogWindow;
	readonly form: FormWindow;
	circuit: Circuit;

	viewBox: Rect;
	baseViewBox: Size;
	ratioX: number;
	ratioY: number;
	center: Point;
	//all window height
	contentHeight: number;
	size: Size;

	get boardOffsetLeft(): number { return this.board.offsetLeft }
	get boardOffsetTop(): number { return this.board.offsetTop }

	get tooltipOfs(): number { return 15 }

	circuitLoadingOrSaving: boolean;

	constructor(options: IMyAppOptions) {
		super(options);
		let
			that: MyApp = this,
			hideNodeTooltip = (newCtx: IMouseState) => {
				that.highlight.hide();
				that.tooltip.setVisible(false);
			},
			//HTML
			getClientXY = (ev: MouseEvent) =>
				new Point(ev.clientX - that.board.offsetLeft,
					ev.clientY - that.board.offsetTop),
			//SVG
			getOffset = (clientXY: Point) =>
				Point.plus(new Point(this.viewBox.x, this.viewBox.y),
					Point.times(clientXY, that.ratioX, that.ratioY)
						.round()
				),
			handleMouseEvent = function (ev: MouseEvent): IMouseState {
				//this is MyApp
				ev.preventDefault();
				ev.stopPropagation();
				let
					arr = [],
					target = <any>ev.target as SVGElement,
					parent = <any>target.parentNode as Element,
					clientXY = getClientXY(ev),
					state: IMouseState = <IMouseState>{
						//id: parent.id,
						type: attr(parent, "svg-comp"),
						button: ev.button,	//https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/button
						//parent: parent,
						client: clientXY,
						offset: getOffset(clientXY),
						event: ev.type.replace('mouse', ''),
						//timeStamp: ev.timeStamp,
						over: {
							type: attr(target, "svg-type"),
							svg: target
						},
						ctrlKey: ev.ctrlKey,
						shiftKey: ev.shiftKey,
						altKey: ev.altKey,
						it: that.circuit.get(parent.id)
					};
				//post actions
				switch (state.over.type) {
					case "node":
						//case "node-x":
						state.over.node = attr(state.over.svg, state.over.type) | 0;
						break;
					case "line":
						state.over.line = attr(state.over.svg, state.over.type) | 0;
						break;
					default:
						//if we got here, it's a hit on a component without svg-type
						//state.type != ["board", "wire"] then it's "body"
						(state.it && state.type != "wire") && (state.over.type = "body");
						break;
				}
				//UI logs
				arr.push(`${pad(state.event, 5, '&nbsp;')} ${parent.id} ${state.type}^${state.over.type}`);
				//arr.push(`zoom: ${that.zoom}`);
				arr.push(`state: ${StateType[that.sm.state]}`);
				arr.push(state.offset.toString()); //`x: ${round(state.offset.x, 1)} y: ${round(state.offset.y, 1)}`
				//arr.push(`client ${clientXY.toString()}`);
				//arr.push(`scaled: x: ${clientXYScaled.x} y: ${clientXYScaled.y}`);
				//render
				that.bottomBarLeft.innerHTML = arr.join(", ");
				return state;
			};
		this.viewBox = Rect.empty();		//location is panning, size is for scaling
		this.ratio = window.screen.width / window.screen.height;		//this's a const value
		this.ratioX = 1;
		this.ratioY = 1;
		this.tooltip = new Tooltip(<ITooltipText>{ id: "tooltip", borderRadius: 4 });
		this.rootDir = <string>basePath();			//not used in electron
		this.board = (<HTMLElement>qS("#board"));
		this.svgBoard = (<SVGElement>this.board.children[0]);
		this.bottomBarLeft = qS('[bar="bottom-left"]');
		this.bottomBarCenter = qS('[bar="bottom-center"]');
		this.circuitName = <HTMLDivElement>qS('footer [circuit="name"]');
		this.dash = new LinesAligner(this);
		this.highlight = new HighlightNode(<any>{});
		this.selection = new SelectionRect(this);
		this.dialog = new DialogWindow(<any>{
			app: this as Application,
			id: "win-dialog",
		});
		this.form = new FormWindow(<any>{
			app: this as Application,
			id: "win-form",
		});
		this.circuit = new Circuit({ name: "new circuit", zoom: this.getUIZoom() }); //scaling multipler 2X UI default
		this.updateCircuitLabel();

		//this'll hold the properties of the current selected component
		this.winProps = new AppWindow(<IAppWindowOptions>{
			id: "win-props",
			x: 800,
			y: 0,
			size: {
				width: 250,
				height: 300
			},
			title: "Properties",
			bar: "...",
			content: "Aaaaa...!  lorep itsum.... whatever"
		});
		//create state machine
		this.sm = new StateMachine(<IStateMachineOptions>{
			id: "state-machine-01",
			initial: StateType.BOARD,
			states: {},
			log: this.prop("cons_log")?.value,
			ctx: <IMouseState>{},
			commonActions: {
				ENTER: function (newCtx: IMouseState) {
					//that.sm.ctx = newCtx;		//save data
				},
				LEAVE: function (newCtx: IMouseState) {
					//cannot save new context, erases wiring status
					hideNodeTooltip(newCtx);
					that.bottomBarLeft.innerHTML = "&nbsp;";
				},
				KEY: function (code: any) {
					//console.log(`KEY: ${code}`);
					//this's the default
					(code == "Delete") && ActionManager.$.execute(ActionType.DELETE, "");
				},
				HIDE_NODE: hideNodeTooltip,
				FORWARD_OVER: function (newCtx: IMouseState) {
					//accepts transitions to new state on mouse OVER
					let
						prefix = !newCtx.it ? "" : newCtx.it.type == 1 ? "EC_" : "WIRE_",
						stateName = (prefix + newCtx.over.type).toUpperCase(),
						state = <StateType><unknown>StateType[<any>stateName];
					that.sm.transition(state, ActionType.START, newCtx);	//EC_NODE		WIRE_NODE
				}
			}
		});
		//context menu
		this.rightClick = new ContextWindow(<IContextMenuOptions><unknown>{
			app: this,
			id: "win-rc",
			x: 50,
			y: 50,
			size: {
				width: 200,
				height: 250
			},
			class: "no-select",
			list: options.list
		});

		aEL(<any>this.svgBoard, "mouseenter",
			(ev: MouseEvent) => that.sm.send(ActionType.ENTER, handleMouseEvent.call(that, ev)), false);

		aEL(<any>this.svgBoard, "mouseleave",
			(ev: MouseEvent) => that.sm.send(ActionType.LEAVE, handleMouseEvent.call(that, ev)), false);

		aEL(<any>this.svgBoard, "mouseover",
			(ev: MouseEvent) => that.sm.send(ActionType.OVER, handleMouseEvent.call(that, ev)), false);

		aEL(<any>this.svgBoard, "mousemove",
			(ev: MouseEvent) => that.sm.send(ActionType.MOVE, handleMouseEvent.call(that, ev)), false);

		aEL(<any>this.svgBoard, "mouseout",
			(ev: MouseEvent) => that.sm.send(ActionType.OUT, handleMouseEvent.call(that, ev)), false);
		//
		aEL(<any>this.svgBoard, "mousedown",
			(ev: MouseEvent) => that.sm.send(ActionType.DOWN, handleMouseEvent.call(that, ev)), false);
		aEL(<any>this.svgBoard, "mouseup",
			(ev: MouseEvent) => that.sm.send(ActionType.UP, handleMouseEvent.call(that, ev)), false);
		//right click on board
		aEL(<any>this.svgBoard, "contextmenu", function (ev: MouseEvent) {
			ev.stopPropagation();
			let
				target = ev.target as Element,
				parent = target.parentNode,
				id = attr(parent, "id"),
				compName = attr(parent, "svg-comp"),
				type = attr(target, "svg-type"),
				nodeOrLine: number = parseInt(attr(target, type)),
				key: string = <any>void 0,
				clientXY = getClientXY(ev),
				comp: ItemBoard = <any>void 0;

			//test for highlightNode
			(compName == "h-node") &&
				(id = that.highlight.selectedId,
					comp = <ItemBoard>that.circuit.get(id),
					compName = comp.type == Type.WIRE ? "wire" : "ec",
					(nodeOrLine != that.highlight.selectedNode
						//&& console.log(`node: ${nodeOrLine} <> ${that.highlight.selectedNode}`)
					));

			key = that.rightClick.setTrigger(
				id,
				compName,
				type,
				isNaN(nodeOrLine) ? <any>undefined : nodeOrLine);

			key &&
				that.rightClick
					.build(key, that.sm.state, getOffset(clientXY))
					.movePoint(clientXY)
					.setVisible(true);
		}, false);

		document.addEventListener("keydown", (ev: KeyboardEvent) => {
			//https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/code
			if (that.dialog.visible)
				return;
			let
				keyCode = ev.code;
			switch (ev.code) {
				case 'Enter':
				case 'Escape':
				case 'Space':
				case 'Delete':
				//
				case 'ArrowLeft':
				case 'ArrowUp':
				case 'ArrowRight':
				case 'ArrowDown':
				//case 'ControlLeft':
				//case 'ControlRight':
				case 'F1':
					break;
				case 'KeyA':	// CtrlKeyA		select all ECs
				case 'KeyU':	// CtrlKeyU		unselect all ECs
				case 'KeyC':	// CtrlKeyC		copy selected ECs
				case 'KeyV':	// CtrlKeyV		paste cloned selected ECs
				//case 'KeyX':	// CtrlKeyX		cut selected ECs - see if it makes sense
				case 'KeyS':	// CtrlKeyS		saves current circuit
				case 'KeyL':	// CtrlKeyL		loads a new circuit
				case 'KeyN':	// CtrlKeyN		creates a new circuit
				case 'KeyP':	// CtrlKeyP		prints current circuit
				case 'KeyZ':	// CtrlKeyZ		undo previous command
				case 'KeyY':	// CtrlKeyY		redo previous undone command
				case 'KeyH':	// CtrlKeyZ		help
					ev.ctrlKey && (keyCode = "Ctrl" + keyCode);	// CtrlKeyA
					break;
				default:
					return;
			}
			that.sm.send(ActionType.KEY, keyCode);
			//console.log(ev.code)
		}, false);
	}

	public insideBoard(p: Point): boolean {
		//later include panning
		return p.x > 0 && p.y > 0 && p.x < this.viewBox.width && p.y < this.viewBox.height
	}

	public getUIZoom(): number {
		let
			zoom_item = qS('.bar-item[data-scale].selected'),
			o = attr(zoom_item, "data-scale"),
			m = parseFloat(o);
		return m;
	}

	public setBoardZoom(zoom: number) {
		//remove all selected class, should be one
		qSA('.bar-item[data-scale].selected').forEach((item: any) => {
			removeClass(item, "selected");
		});
		addClass(qS(`[data-scale="${zoom}"]`), "selected");
		this.updateViewBox(zoom);
	}

	public updateCircuitLabel() {
		this.circuitName.innerHTML = Templates.nano('circuitName', {
			name: this.circuit.name,
			class: this.circuit.modified ? "" : "hide"
		});
	}

	public updateViewBox(zoom: number, x?: number, y?: number) {
		this.baseViewBox = new Size(this.board.clientWidth * this.ratio | 0, this.board.clientHeight * this.ratio | 0);
		//calculate size
		this.viewBox.width = this.baseViewBox.width * zoom | 0;
		this.viewBox.height = this.baseViewBox.height * zoom | 0;
		calculateAndUpdateViewBoxData.call(this, x, y);
	}

	public getViewBoxRects(r: Rect): { zoom: string, rect: Rect }[] {
		let
			getRect = (z: number, index: number): { zoom: string, rect: Rect } => ({
				zoom: Circuit.zoomFactors[index],
				rect: new Rect(r.x, r.y, this.baseViewBox.width * z, this.baseViewBox.height * z)
			}),
			sizes = Circuit.zoomMultipliers.map(getRect)
				.filter(o => o.rect.contains(r));
		return sizes.length ? sizes : [getRect(Circuit.zoomMultipliers[0], 0)]
	}

	public refreshViewBoxData() {
		this.bottomBarCenter.innerHTML = Templates.nano('viewBox01', this.viewBox) + "&nbsp; "
		//+ na no(this.templates.size01, this.size);
	}

	public getAspectRatio(width: number, height: number) {
		var
			ratio = width / height;
		return (Math.abs(ratio - 4 / 3) < Math.abs(ratio - 16 / 9)) ? '4:3' : '16:9';
	}

	public tooltipFontSize = () => Math.max(10, 35 * this.circuit.zoom)

	public rotateEC(angle: number) {
		this.rotateComponentBy(angle, this.circuit.ec)
	}

	public rotateComponentBy(angle: number, comp?: ItemBoard) {
		if (!comp || comp.type != Type.EC)
			return;
		let
			rotation = (comp as EC).rotation;
		(rotation != (comp as EC).rotate((comp as EC).rotation + angle).rotation)
			&& (this.circuit.modified = true, this.updateCircuitLabel());
		this.refreshRotation(comp);
	}

	public refreshRotation(ec?: ItemBoard) {
		let
			isEC = ec && (ec.type == Type.EC),
			rotation = isEC ? (ec as EC).rotation : 0;
		this.prop("rot_lbl").value = ` ${rotation}°`;
		isEC && (this.winProps.compId == ec?.id) && this.winProps.property("rotation")?.refresh();
	}

	public addToDOM(comp: EC | Wire): boolean {
		switch (comp.type) {
			case Type.EC:
				this.svgBoard.insertBefore(comp.g, this.tooltip.g);
				break;
			case Type.WIRE:
				this.dash.g.insertAdjacentElement("afterend", comp.g);
				break;
			default:
				return false;
		}
		comp.afterDOMinserted();
		return true;
	}

	protected saveDialogIfModified(): Promise<number> {
		return this.circuit.modified
			? this.dialog.showDialog("Confirm", "You have unsaved work!", ["Save", "Cancel", "Don't Save"])
				.then((choice) => {
					if (choice == 0)
						return this.circuit.save()	// Save: 0, Cancel: 1, Error: 5
					else
						return Promise.resolve(choice)
				})
			: Promise.resolve(3)			// Not Modified: 3
	}

	public newCircuit(): Promise<number> {
		let
			self = this as MyApp,
			options = Circuit.circuitProperties(),
			path = options.find(value => value.label == "path"),
			filename = options.find(value => value.label == "filename");
		path && (path.visible = false);
		filename && (filename.visible = false);
		this.circuitLoadingOrSaving = true;
		return this.saveDialogIfModified()
			.then((choice) => {
				self.updateCircuitLabel();
				if (choice == 0 || choice == 2 || choice == 3) { // Save: 0, Don't Save: 2, Not Modified: 3
					return self.form.showDialog("New Circuit", options)
						.then(choice => {
							if (choice == 0) {
								console.log(options);
								let
									circuit = new Circuit({
										name: options[0].value,
										description: options[1].value,
										zoom: self.getUIZoom()
									});
								//everything OK here
								self.circuit.destroy();
								self.circuit = circuit;
								self.updateViewBox(circuit.zoom, circuit.view.x, circuit.view.y);
								circuit.modified = false;
								self.updateCircuitLabel();
								choice = 4;						// Load: 4
							}
							self.circuitLoadingOrSaving = false;
							return Promise.resolve(choice)
						})
				}
				else {
					self.circuitLoadingOrSaving = false;
					return Promise.resolve(choice)
				}
			})
			.catch((reason) => {
				//console.log('error: ', reason);
				self.circuitLoadingOrSaving = false;
				return self.dialog.showMessage(reason.name, reason.message)
					.then(() => {
						return Promise.resolve(5)	// Error: 5
					})
			})
	}

	public saveCircuit(showDialog: boolean): Promise<number> {
		let
			self = this as MyApp;
		//here make later a dialogBox with error or something else
		return (showDialog
			? this.saveDialogIfModified()
			: this.circuit.save()
		)
			.then(choice => {
				self.updateCircuitLabel();
				return Promise.resolve(choice)
			})
	}

	public loadCircuit(): Promise<number> {
		let
			self = this as MyApp;
		this.circuitLoadingOrSaving = true;
		return this.saveDialogIfModified()
			.then((choice) => {
				self.updateCircuitLabel();
				if (choice == 0 || choice == 2 || choice == 3) { // Save: 0, Don't Save: 2, Not Modified: 3
					let
						answer = ipcRenderer.sendSync('openFile', "");
					//error treatment
					if (answer.error) {
						console.log(answer);	//later popup with error
						choice = 5;					// Error: 5
					}
					else if (answer.canceled) {
						console.log(answer);
						choice = 1;				// Cancel: 1
					}
					else if (!answer.data) {
						console.log(answer);	//later popup with error
						choice = 5;					// Error: 5
					}
					else {
						let
							circuit = Circuit.load({ filePath: answer.filePath, data: answer.data });
						//everything OK here
						self.circuit.destroy();
						self.circuit = circuit;
						self.setBoardZoom(circuit.zoom);
						self.circuit.components
							.forEach(comp => self.addToDOM(<any>comp));
						self.updateViewBox(circuit.zoom, circuit.view.x, circuit.view.y);
						circuit.modified = false;
						self.updateCircuitLabel();
						choice = 4;						// Load: 4
					}
				}
				self.circuitLoadingOrSaving = false;
				return Promise.resolve(choice)
			})
			.catch((reason) => {
				//console.log('error: ', reason);
				self.circuitLoadingOrSaving = false;
				return self.dialog.showMessage(reason.name, reason.message)
					.then(() => {
						return Promise.resolve(5)	// Error: 5
					})
			})
	}
}

function calculateAndUpdateViewBoxData(x?: number, y?: number) {
	let
		self = this as MyApp,
		updateCircuit = false;
	(x != undefined) && (self.viewBox.x = x, updateCircuit = true);
	(y != undefined) && (self.viewBox.y = y, updateCircuit = true);
	//set SVG DOM viewBox attribute
	attr(self.svgBoard, { "viewBox": `${self.viewBox.x} ${self.viewBox.y} ${self.viewBox.width} ${self.viewBox.height}` });
	//calculate ratio
	self.ratioX = self.viewBox.width / self.svgBoard.clientWidth;
	self.ratioY = self.viewBox.height / self.svgBoard.clientHeight;
	self.center = new Point(Math.round(self.viewBox.x + self.viewBox.width / 2),
		Math.round(self.viewBox.y + self.viewBox.height / 2));
	self.refreshViewBoxData();
	if (updateCircuit) {
		self.circuit.view = new Point(self.viewBox.x, self.viewBox.y);
		self.circuit.modified = true;
		self.updateCircuitLabel();
	}
}