import { Application } from "./app";
import {
	IApplicationOptions, IMyApp, ITooltipText, IAppWindowOptions, IStateMachineOptions,
	StateType, ActionType, IMouseState, IContextMenuOptions, IItemSolidOptions, IItemWireOptions, IPoint
} from "./interfaces";
import { basePath, qS, pad } from "./utils";
import Rect from "./rect";
import Size from "./size";
import Point from './point';
import Tooltip from "./tooltip";
import { attr, aEL, nano } from "./dab";
import AppWindow from "./app-window";
import Wire from "./wire";
import StateMachine from "./stateMachine";
import Comp from "./components";
import ContextWindow from "./context-window";
import { ItemBoard } from "./itemsBoard";
import EC from "./ec";
import { Type } from "./types";

export class MyApp extends Application implements IMyApp {

	readonly rootDir: string;
	readonly board: HTMLElement;
	readonly ratio: number;
	readonly svgBoard: SVGElement;
	readonly tooltip: Tooltip;
	readonly topBarLeft: HTMLElement;
	readonly topBarRight: HTMLElement;
	readonly winProps: AppWindow;
	readonly state: StateMachine;
	readonly rightClick: ContextWindow;

	viewBox: Rect;
	baseViewBox: Size;
	multiplier: number;
	ratioX: number;
	ratioY: number;
	center: Point;
	size: Size;
	compList: Map<string, ItemBoard>;
	selectedComponents: ItemBoard[];

	//has value if only one comp selected, none or multiple has undefined
	get ec(): ItemBoard | undefined {
		return this.selectedComponents.length == 1 ? this.selectedComponents[0] : void 0;
	}

	//temporary properties
	wire: Wire;

	constructor(options: IApplicationOptions) {
		super(options);
		let
			that: MyApp = this,
			//HTML
			getClientXY = (ev: MouseEvent) =>
				new Point(ev.clientX - that.board.offsetLeft, ev.clientY - that.board.offsetTop),
			//SVG
			getOffset = (clientXY: Point, ev: MouseEvent) =>
				Point.times(clientXY, that.ratioX, that.ratioY).round(),
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
						id: '#' + parent.id,
						type: attr(parent, "svg-comp"),
						button: ev.button,	//https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/button
						//parent: parent,
						client: clientXY,
						offset: getOffset(clientXY, ev),
						event: ev.type.replace('mouse', ''),
						timeStamp: ev.timeStamp,
						over: {
							type: attr(target, "svg-type"),
							svg: target
						},
						ctrlKey: ev.ctrlKey,
						shiftKey: ev.shiftKey,
						altKey: ev.altKey,
						it: Comp.item(parent.id)
					};
				//post actions
				switch (state.over.type) {
					case "node":
						state.over.nodeNumber = parseInt(attr(state.over.svg, state.over.type));
						state.it && (state.over.node = state.it.getNode(<number>state.over.nodeNumber))
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
				arr.push(`${pad(state.event, 5, '&nbsp;')} ${state.id} ${state.type}^${state.over.type}`);
				//arr.push(`multiplier: ${that.multiplier}`);
				arr.push(`state: ${StateType[that.state.value]}`);
				arr.push(state.offset.toString()); //`x: ${round(state.offset.x, 1)} y: ${round(state.offset.y, 1)}`
				//arr.push(`client ${clientXY.toString()}`);
				//arr.push(`scaled: x: ${clientXYScaled.x} y: ${clientXYScaled.y}`);
				//render
				that.topBarLeft.innerHTML = arr.join(", ");
				return state;
			};
		this.compList = new Map();
		this.selectedComponents = [];
		//location is panning, size is for scaling
		this.viewBox = new Rect(Point.origin, Size.empty);
		//scaling multipler
		this.multiplier = 0.5;  // 2X UI default
		//this's a const value
		this.ratio = window.screen.width / window.screen.height;
		this.ratioX = 1;
		this.ratioY = 1;
		//main SVG insertion point
		this.tooltip = new Tooltip(<ITooltipText>{ id: "tooltip", borderRadius: 4 });
		this.rootDir = <string>basePath();			//not used in electron
		this.board = (<HTMLElement>qS("#board"));
		this.svgBoard = (<SVGElement>this.board.children[0]);
		this.topBarLeft = qS("#top-bar>div:nth-of-type(1)");
		this.topBarRight = qS("#top-bar>div:nth-of-type(2)");

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
			content: "Aaaaa...!  kjsdhj sjh sj d sj sd sdjs djsdj kkisaujn ak asd asdn askd askd aksdn aksd  ia hsdoia oa sdoas "
		});
		//create state machine
		this.state = new StateMachine(<IStateMachineOptions>{
			id: "state-machine-01",
			initial: StateType.IDLE,
			states: {},
			ctx: <IMouseState>{},
			commonActions: {
				HIDE_NODE: function (newContext: IMouseState) {
					newContext.it && newContext.it.hideNode();
					that.tooltip.setVisible(false);
				},
				SHOW_BODY_TOOLTIP: function (newContext: IMouseState) {
					let
						p = Point.translateBy(newContext.offset, 20);
					that.tooltip.setVisible(true)
						.move(p.x, p.y)
						.setFontSize(that.tooltipFontSize())
						.setText(<string>newContext.it?.id);
				},
				SHOW_NODE_TOOLTIP: function (newContext: IMouseState) {
					//data has current state
					if (!newContext.it?.highlighted) {
						newContext.it?.showNode(<number>newContext.over.nodeNumber);
						let
							p = Point.translateBy(newContext.offset, 20);
						that.tooltip.setVisible(true)
							.move(p.x, p.y)
							.setFontSize(that.tooltipFontSize())
							.setText(`${newContext.over.nodeNumber} -${newContext.over.node?.label}`);
					}
				},
				FORWARD_OVER: function (newContext: IMouseState) {
					//accepts transitions to new state on mouse OVER
					let
						prefix = !newContext.it ? "" : newContext.it.type == 1 ? "EC_" : "WIRE_",
						stateName = (prefix + newContext.over.type).toUpperCase(),
						state = <StateType><unknown>StateType[<any>stateName];
					that.state.transition(state, ActionType.START, newContext);	//EC_NODE		WIRE_EDIT_NODE
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

		aEL(<any>this.svgBoard, "mouseover", function (ev: MouseEvent) {
			that.state.enabled && that.state.send(ActionType.OVER, handleMouseEvent.call(that, ev));
		}, false);
		aEL(<any>this.svgBoard, "mousemove", function (ev: MouseEvent) {
			that.state.enabled && that.state.send(ActionType.MOVE, handleMouseEvent.call(that, ev));
		}, false);
		aEL(<any>this.svgBoard, "mouseout", function (ev: MouseEvent) {
			that.state.enabled && that.state.send(ActionType.OUT, handleMouseEvent.call(that, ev));
		}, false);
		//
		aEL(<any>this.svgBoard, "mousedown", function (ev: MouseEvent) {
			that.state.enabled && that.state.send(ActionType.DOWN, handleMouseEvent.call(that, ev));
		}, false);
		aEL(<any>this.svgBoard, "mouseup", function (ev: MouseEvent) {
			that.state.enabled && that.state.send(ActionType.UP, handleMouseEvent.call(that, ev));
		}, false);
		//right click on board
		aEL(<any>this.svgBoard, "contextmenu", function (ev: MouseEvent) {
			ev.stopPropagation();
			let
				target = ev.target as Element,
				type = attr(target, "svg-type"),
				key = that.rightClick.setTrigger(
					attr(target.parentNode, "id"),
					attr(target.parentNode, "svg-comp"),
					type,
					type && attr(target, type));
			key &&
				that.rightClick
					.build(key)
					.movePoint(getClientXY(ev))
					.setVisible(true);
		}, false);
		document.onkeydown = function (ev: KeyboardEvent) {
			switch (ev.keyCode) {
				case 13:	// ENTER
				case 27:	// ESC
				case 37:	// LEFT
				case 38:	// UP
				case 39:	// RIGHT
				case 40:	// DOWN
				case 46:	// DEL
					break;
			}
		}
	}

	public insideBoard(p: Point): boolean {
		//later include panning
		return p.x > 0 && p.y > 0 && p.x < this.viewBox.size.width && p.y < this.viewBox.size.height
	}

	public setViewBox(m: number) {
		if (!m) {
			let
				zoom_item = qS('.bar-item[data-scale].selected'),	//get default from DOM
				o = attr(zoom_item, "data-scale");
			m = parseFloat(o);
		}
		this.multiplier = m;
		this.baseViewBox = new Size(this.board.clientWidth * this.ratio | 0, this.board.clientHeight * this.ratio | 0);
		//calculate size
		this.viewBox.size = new Size(
			this.baseViewBox.width * this.multiplier | 0,
			this.baseViewBox.height * this.multiplier | 0);
		//set SVG DOM viewBox attribute
		attr(this.svgBoard, { "viewBox": `${this.viewBox.x} ${this.viewBox.y} ${this.viewBox.width} ${this.viewBox.height}` });
		//calculate ratio
		this.ratioX = this.viewBox.width / this.svgBoard.clientWidth;
		this.ratioY = this.viewBox.height / this.svgBoard.clientHeight;
		this.center = new Point(this.viewBox.width / 2, this.viewBox.height / 2);
		this.refreshTopBarRight();
	}

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

	public hasComponent(id: string): boolean { return this.compList.has(id); }

	public addComponent(name: string): ItemBoard {
		let
			comp: ItemBoard = <any>void 0;

		if (name == "wire") {
			//this's temporary, until create wire tool works
			//wire.setPoints([{x:50,y:100}, {x:200,y:100}, {x:200, y:25}, {x:250,y:25}])
			comp = this.wire = new Wire((<IItemWireOptions>{
				points: <IPoint[]>[
					{ x: 25, y: 50 },
					{ x: 25, y: 100 },
					{ x: 200, y: 100 },
					{ x: 200, y: 25 },
					{ x: 250, y: 25 }]
			}))
		} else {
			comp = new EC(<IItemSolidOptions><unknown>{
				name: name,
				x: this.center.x,
				y: this.center.y,
				onProp: function (e: any) {
					//this happens when this component is created
				}
			})
		}
		if (comp) {
			if (this.hasComponent(comp.id))
				throw `duplicated component ${comp.id}`;
			this.compList.set(comp.id, comp);

			//add it to SVG DOM
			this.svgBoard.insertBefore(comp.g, this.tooltip.g);
			//do after DOM inserted work
			comp.afterDOMinserted();
		}
		return <ItemBoard>comp;
	}

	public rotateEC(angle: number) {
		this.rotateComponentBy(angle, this.ec)
	}

	public rotateComponentBy(angle: number, comp?: ItemBoard) {
		if (!comp || comp.type != Type.EC)
			return;
		let
			ec = (comp as EC);
		ec && ec.rotate(ec.rotation + angle);
		this.refreshRotation(ec);
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
			comp = Comp.item(<string>arr.shift()),
			name = arr.shift(),
			type = arr.shift(),
			nodeOrLine = arr.shift(),
			data = arr.shift(),
			compNull = false,
			selectAll = (value: boolean): ItemBoard[] => {
				let
					arr = Array.from(this.compList.values());
				arr.forEach(comp => comp.select(value));
				return arr;
			}
		//this's a temporary fix to make it work
		//	final code will have a centralized action dispatcher
		switch (action) {
			case ActionType.TOGGLE_SELECT:
				if (!(compNull = !comp)) {
					comp.select(!comp.selected);
					this.selectedComponents = Array.from(this.compList.values()).filter(c => c.selected);
					this.refreshRotation(this.ec);
					(this.ec && (this.winProps.load(this.ec), (<any>window).ec = this.ec, 1)) || this.winProps.clear();
				}
				break;
			case ActionType.SELECT:
				if (!(compNull = !comp)) {
					selectAll(false);
					this.selectedComponents = [comp.select(true)];
					this.refreshRotation(comp);
					this.winProps.load(comp);
					//temporary, for testings...
					(<any>window).ec = this.ec;
				}
				break;
			case ActionType.SELECT_ALL:
				this.selectedComponents = selectAll(true);
				this.refreshRotation();
				this.winProps.clear();
				//temporary, for testings...
				(<any>window).ec = void 0;
				break;
			case ActionType.UNSELECT_ALL:
				selectAll(false);
				this.selectedComponents = [];
				this.refreshRotation();
				this.winProps.clear();
				//temporary, for testings...
				(<any>window).ec = void 0;
				break;
			case ActionType.DELETE:
				if (!(compNull = !comp)) {
					//disconnects and remove component from DOM
					comp.disconnect();
					comp.remove();
					this.compList.delete(comp.id);
					this.selectedComponents = Array.from(this.compList.values()).filter(c => c.selected);
					this.refreshRotation();
					(this.winProps.compId == comp.id) && this.winProps.clear();
					this.tooltip.setVisible(false);
					//temporary, for testings...
					(<any>window).ec = void 0;
				}
				break;
			case ActionType.SHOW_PROPERTIES:
				if (!(compNull = !comp)) {
					this.winProps.load(comp);
				}
				break;
			case ActionType.ROTATE_45_CLOCKWISE:
			case ActionType.ROTATE_45_COUNTER_CLOCKWISE:
			case ActionType.ROTATE_90_CLOCKWISE:
			case ActionType.ROTATE_90_COUNTER_CLOCKWISE:
				if (!(compNull = !comp) && data) {
					this.rotateComponentBy(<any>data | 0, comp);
				}
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