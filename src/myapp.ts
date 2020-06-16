import { ipcRenderer } from "electron";
import { Application } from "./app";
import {
	IMyApp, ITooltipText, IAppWindowOptions, IStateMachineOptions,
	StateType, ActionType, IMouseState, IContextMenuOptions, IMyAppOptions
} from "./interfaces";
import { basePath, qS, pad, qSA } from "./utils";
import Rect from "./rect";
import Size from "./size";
import Point from './point';
import Tooltip from "./tooltip";
import { attr, aEL, nano, removeClass, addClass } from "./dab";
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
import DialogWindow from "./dialog-window";

export class MyApp extends Application implements IMyApp {

	readonly rootDir: string;
	readonly board: HTMLElement;
	readonly ratio: number;
	readonly svgBoard: SVGElement;
	readonly tooltip: Tooltip;
	readonly bottomBarLeft: HTMLElement;
	readonly bottomBarCenter: HTMLElement;
	readonly winProps: AppWindow;
	readonly sm: StateMachine;
	readonly rightClick: ContextWindow;
	readonly dash: LinesAligner;
	readonly highlight: HighlightNode;
	readonly selection: SelectionRect;
	readonly dialog: DialogWindow;
	circuit: Circuit;

	viewBox: Rect;
	baseViewBox: Size;
	get multiplier(): number { return this.circuit.multiplier }
	ratioX: number;
	ratioY: number;
	center: Point;
	//all window height
	contentHeight: number;
	size: Size;

	get tooltipOfs(): number { return 15 }

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
				//arr.push(`multiplier: ${that.multiplier}`);
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
		this.dash = new LinesAligner(this);
		this.highlight = new HighlightNode(<any>{});
		this.selection = new SelectionRect(this);
		this.dialog = new DialogWindow(<any>{
			app: this as Application,
			id: "win-dialog",
		});
		this.circuit = new Circuit(this, { name: "my circuit", multiplier: options.multiplier }); //scaling multipler 2X UI default

		//this'll hold the properties of the current selected component
		this.winProps = new AppWindow(<IAppWindowOptions>{
			app: this as Application,
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
					(code == "Delete") && that.execute(ActionType.DELETE, "");
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
					break;
				case 'KeyA':	// CtrlKeyA		select all ECs
				case 'KeyC':	// CtrlKeyC		copy selected ECs
				case 'KeyV':	// CtrlKeyV		paste cloned selected ECs
				//case 'KeyX':	// CtrlKeyX		cut selected ECs - see if it makes sense
				case 'KeyS':	// CtrlKeyS		saves current circuit
				case 'KeyL':	// CtrlKeyL		loads a new circuit
				case 'KeyP':	// CtrlKeyP		prints current circuit
				case 'KeyZ':	// CtrlKeyZ		undo previous command
				case 'KeyY':	// CtrlKeyY		redo previous undone command
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

	public setBoardZoom(m: number, updateDOM: boolean) {
		this.circuit.multiplier = m;
		if (updateDOM) {
			//remove all selected class, should be one
			qSA('.bar-item[data-scale].selected').forEach((item: any) => {
				removeClass(item, "selected");
			});
			addClass(qS(`[data-scale="${this.circuit.multiplier}"]`), "selected");
		}
		this.baseViewBox = new Size(this.board.clientWidth * this.ratio | 0, this.board.clientHeight * this.ratio | 0);
		//calculate size
		this.viewBox.width = this.baseViewBox.width * this.multiplier | 0;
		this.viewBox.height = this.baseViewBox.height * this.multiplier | 0;
		calculateAndUpdateViewBoxData.call(this);
	}

	public updateViewBox(x?: number, y?: number) { calculateAndUpdateViewBoxData.call(this, x, y); }

	public refreshTopBarRight() {//topBarRight
		this.bottomBarCenter.innerHTML = nano(this.templates.viewBox01, this.viewBox) + "&nbsp; " +
			nano(this.templates.size01, this.size);
	}

	public getAspectRatio(width: number, height: number) {
		var
			ratio = width / height;
		return (Math.abs(ratio - 4 / 3) < Math.abs(ratio - 16 / 9)) ? '4:3' : '16:9';
	}

	public tooltipFontSize = () => Math.max(10, 35 * this.multiplier)

	public rotateEC(angle: number) {
		this.rotateComponentBy(angle, this.circuit.ec)
	}

	public rotateComponentBy(angle: number, comp?: ItemBoard) {
		if (!comp || comp.type != Type.EC)
			return;
		let
			rotation = (comp as EC).rotation;
		(rotation != (comp as EC).rotate((comp as EC).rotation + angle).rotation)
			&& (this.circuit.modified = true);
		this.refreshRotation(comp);
	}

	public refreshRotation(ec?: ItemBoard) {
		let
			isEC = ec && (ec.type == Type.EC),
			rotation = isEC ? (ec as EC).rotation : 0;
		this.prop("rot_lbl").value = ` ${rotation}°`;
		isEC && (this.winProps.compId == ec?.id) && this.winProps.property("rotation")?.refresh();
	}

	//public execute({ action, trigger, data }: { action: ActionType; trigger: string; data?: any; }) {
	public execute(action: ActionType, trigger: string) {
		let
			arr = trigger.split('::'),
			comp = this.circuit.get(<string>arr.shift()),
			name = arr.shift(),
			type = arr.shift(),
			nodeOrLine = parseInt(<any>arr.shift()),
			data = arr.shift(),
			compNull = false;
		//this's a temporary fix to make it work
		//	final code will have a centralized action dispatcher
		switch (action) {
			case ActionType.TOGGLE_SELECT:
				if (!(compNull = !comp) && comp.type == Type.EC) {
					this.circuit.toggleSelect(comp as EC);
					this.refreshRotation(this.circuit.ec);
					(this.circuit.ec && (this.winProps.load(this.circuit.ec), 1)) || this.winProps.clear();
					//temporary, for testings...
					this.circuit.ec && ((<any>window).ec = this.circuit.ec);
				}
				break;
			case ActionType.SELECT:
				if (!(compNull = !comp) && comp.type == Type.EC) {
					this.circuit.selectThis(comp as EC);
					this.refreshRotation(comp);
					((action == ActionType.SELECT) && (this.winProps.load(comp), 1)) || this.winProps.clear();
					//temporary, for testings...
					(<any>window).ec = this.circuit.ec;
				}
				break;
			case ActionType.SELECT_ALL:
				this.circuit.selectAll();
				this.refreshRotation();
				this.winProps.clear();
				//temporary, for testings...
				(<any>window).ec = void 0;
				break;
			case ActionType.UNSELECT_ALL:
				this.circuit.deselectAll();
				this.refreshRotation();
				this.winProps.clear();
				//temporary, for testings...
				(<any>window).ec = void 0;
				break;
			case ActionType.DELETE_SELECTED:
				let
					selectedCount = this.circuit.selectedComponents.length,
					deletedCount = this.circuit.deleteSelected();
				this.refreshRotation();
				this.winProps.clear().setVisible(false);
				this.tooltip.setVisible(false);
				if (selectedCount != deletedCount) {
					console.log(`[${deletedCount}] components of [${selectedCount}]`)
				}
				//temporary, for testings...
				(<any>window).ec = void 0;
				break;
			case ActionType.DELETE:
				//only comp if sent
				if (!(compNull = !comp)) {
					if (this.circuit.delete(comp)) {
						this.refreshRotation();
						this.winProps.clear().setVisible(false);
						this.tooltip.setVisible(false);
						this.sm.send(ActionType.AFTER_DELETE, comp.id);
					}
				}
				//temporary, for testings...
				(<any>window).ec = void 0;
				break;
			case ActionType.DELETE_THIS_LINE:
				//console.log(`delete line segment: `, trigger);
				if (!(compNull = !comp)) {
					(comp as Wire).deleteLine(nodeOrLine);
					this.winProps.refresh();
				}
				break;
			case ActionType.DELETE_WIRE_NODE:
				//console.log(`delete wire node: `, trigger);
				if (!(compNull = !comp)) {
					(comp as Wire).deleteNode(nodeOrLine);
					this.winProps.refresh();
				}
				break;
			case ActionType.SPLIT_THIS_LINE:
				//console.log(`split line segment: `, trigger, this.rightClick.offset);
				if (!(compNull = !comp)) {
					(comp as Wire).insertNode(nodeOrLine, this.rightClick.offset);
					this.winProps.refresh();
				}
				break;
			case ActionType.SHOW_PROPERTIES:
				!(compNull = !comp) && this.winProps.load(comp);
				break;
			case ActionType.ROTATE_45_CLOCKWISE:
			case ActionType.ROTATE_45_COUNTER_CLOCKWISE:
			case ActionType.ROTATE_90_CLOCKWISE:
			case ActionType.ROTATE_90_COUNTER_CLOCKWISE:
				!(compNull = !comp) && data && this.rotateComponentBy(<any>data | 0, comp);
				break;
		}
		//logs
		if (compNull) {
			console.log(`invalid trigger: ${trigger}`);
		} else {
			//console.log(`action: ${action}, id: ${comp?.id}, name: ${name}, type: ${type}, trigger: ${trigger}`);
		}
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

	public loadCircuit(): Promise<number> {
		let
			self = this as MyApp;
		return this.circuit.save(false)
			.then(choice => {
				self.circuit.circuitLoadingOrSaving = true;
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
							circuit = new Circuit(self, answer.data);
						//everything OK here
						self.circuit.destroy();
						//start loading new circuit
						self.circuit = circuit;
						self.setBoardZoom(circuit.multiplier, true);
						self.circuit.filePath = answer.filePath;
						//circuit add to DOM
						self.circuit.components
							.forEach(comp => self.addToDOM(<any>comp));
						choice = 4;						// Load: 4
					}
				}
				return Promise.resolve(choice)
			})
	}
}

function calculateAndUpdateViewBoxData(x?: number, y?: number) {
	let
		self = this as MyApp;
	(x != undefined) && (self.viewBox.x = x);
	(y != undefined) && (self.viewBox.y = y);
	//set SVG DOM viewBox attribute
	attr(self.svgBoard, { "viewBox": `${self.viewBox.x} ${self.viewBox.y} ${self.viewBox.width} ${self.viewBox.height}` });
	//calculate ratio
	self.ratioX = self.viewBox.width / self.svgBoard.clientWidth;
	self.ratioY = self.viewBox.height / self.svgBoard.clientHeight;
	self.center = new Point(Math.round(self.viewBox.x + self.viewBox.width / 2),
		Math.round(self.viewBox.y + self.viewBox.height / 2));
	self.refreshTopBarRight();
}