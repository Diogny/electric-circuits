import { Application } from "./app";
import {
	IApplicationOptions, IMyApp, ITooltipText, IAppWindowOptions, IStateMachineOptions,
	StateType, ActionType, IMouseState, IContextMenuOptions
} from "./interfaces";
import { basePath, qS, pad } from "./utils";
import Rect from "./rect";
import Size from "./size";
import Point from './point';
import Tooltip from "./tooltip";
import { attr, aEL, nano } from "./dab";
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

export class MyApp extends Application implements IMyApp {

	readonly rootDir: string;
	readonly board: HTMLElement;
	readonly ratio: number;
	readonly svgBoard: SVGElement;
	readonly tooltip: Tooltip;
	readonly topBarLeft: HTMLElement;
	readonly topBarRight: HTMLElement;
	readonly winProps: AppWindow;
	readonly sm: StateMachine;
	readonly rightClick: ContextWindow;
	readonly dash: LinesAligner;
	readonly highlight: HighlightNode;
	readonly selection: SelectionRect;
	readonly circuit: Circuit;

	viewBox: Rect;
	baseViewBox: Size;
	multiplier: number;
	ratioX: number;
	ratioY: number;
	center: Point;
	//all window height
	contentHeight: number;
	size: Size;

	get tooltipOfs(): number { return 15 }

	constructor(options: IApplicationOptions) {
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
				that.topBarLeft.innerHTML = arr.join(", ");
				return state;
			};
		this.viewBox = Rect.empty();		//location is panning, size is for scaling
		this.multiplier = 0.5;  //scaling multipler 2X UI default
		this.ratio = window.screen.width / window.screen.height;		//this's a const value
		this.ratioX = 1;
		this.ratioY = 1;
		this.tooltip = new Tooltip(<ITooltipText>{ id: "tooltip", borderRadius: 4 });
		this.rootDir = <string>basePath();			//not used in electron
		this.board = (<HTMLElement>qS("#board"));
		this.svgBoard = (<SVGElement>this.board.children[0]);
		this.topBarLeft = qS("#top-bar>div:nth-of-type(1)");
		this.topBarRight = qS("#top-bar>div:nth-of-type(2)");
		this.dash = new LinesAligner(this);
		this.highlight = new HighlightNode(<any>{});
		this.selection = new SelectionRect(this);
		this.circuit = new Circuit(this, "my circuit");

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
					that.topBarLeft.innerHTML = "&nbsp;";
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
					(nodeOrLine != that.highlight.selectedNode && console.log(`node: ${nodeOrLine} <> ${that.highlight.selectedNode}`)));

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
		document.onkeydown = function (ev: KeyboardEvent) {
			//https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/code
			switch (ev.code) {
				case 'Enter':
				case 'Escape':
				case 'ArrowLeft':
				case 'ArrowUp':
				case 'ArrowRight':
				case 'ArrowDown':
				case 'Delete':
				case 'ControlLeft':
				case 'ControlRight':
					that.sm.send(ActionType.KEY, ev.code);
					break;
			}
			//console.log(ev.code)
		}
	}

	public insideBoard(p: Point): boolean {
		//later include panning
		return p.x > 0 && p.y > 0 && p.x < this.viewBox.width && p.y < this.viewBox.height
	}

	public setViewBox(m: number) {
		if (!m) {
			let
				zoom_item = qS('.bar-item[data-scale].selected'),
				o = attr(zoom_item, "data-scale");
			m = parseFloat(o);
		}
		this.multiplier = m;
		this.baseViewBox = new Size(this.board.clientWidth * this.ratio | 0, this.board.clientHeight * this.ratio | 0);
		//calculate size
		this.viewBox.width = this.baseViewBox.width * this.multiplier | 0;
		this.viewBox.height = this.baseViewBox.height * this.multiplier | 0;
		calculateAndUpdateViewBoxData.call(this);
	}

	public updateViewBox() { calculateAndUpdateViewBoxData.call(this); }

	public refreshTopBarRight() {
		this.topBarRight.innerHTML = nano(this.templates.viewBox01, this.viewBox) + "&nbsp; " +
			nano(this.templates.size01, this.size);
	}

	public getAspectRatio(width: number, height: number) {
		var
			ratio = width / height;
		return (Math.abs(ratio - 4 / 3) < Math.abs(ratio - 16 / 9)) ? '4:3' : '16:9';
	}

	public tooltipFontSize = () => Math.max(10, 35 * this.multiplier)

	public addECtoDOM(ec: EC) {
		this.svgBoard.insertBefore(ec.g, this.tooltip.g);
		//do after DOM inserted work
		ec.afterDOMinserted();
	}

	public addWiretoDOM(wire: Wire) {
		this.dash.g.insertAdjacentElement("afterend", wire.g);
		//do after DOM inserted work
		wire.afterDOMinserted();
	}

	public rotateEC(angle: number) {
		this.rotateComponentBy(angle, this.circuit.ec)
	}

	public rotateComponentBy(angle: number, comp?: ItemBoard) {
		if (!comp || comp.type != Type.EC)
			return;
		(comp as EC).rotate((comp as EC).rotation + angle);
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
			case ActionType.SELECT_ONLY:
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
}

function calculateAndUpdateViewBoxData() {
	let
		self = this as MyApp;
	//set SVG DOM viewBox attribute
	attr(self.svgBoard, { "viewBox": `${self.viewBox.x} ${self.viewBox.y} ${self.viewBox.width} ${self.viewBox.height}` });
	//calculate ratio
	self.ratioX = self.viewBox.width / self.svgBoard.clientWidth;
	self.ratioY = self.viewBox.height / self.svgBoard.clientHeight;
	self.center = new Point(Math.round(self.viewBox.x + self.viewBox.width / 2),
		Math.round(self.viewBox.y + self.viewBox.height / 2));
	self.refreshTopBarRight();
}