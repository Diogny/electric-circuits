import { Application } from "./app";
import {
	IApplicationOptions, IMyApp, ITooltipText, IAppWindowOptions, IStateMachineOptions,
	StateType, ActionType, IMouseState, IContextMenuOptions, IItemSolidOptions
} from "./interfaces";
import { basePath, qS, pad } from "./utils";
import Rect from "./rect";
import Size from "./size";
import Point from './point';
import Tooltip from "./tooltip";
import { attr, aEL, nano } from "./dab";
import AppWindow from "./app-window";
import ItemSolid from "./itemSolid";
import Wire from "./wire";
import StateMachine from "./stateMachine";
import Comp from "./components";
import ContextWindow from "./context-window";
import ItemBoard from "./itemsBoard";
import EC from "./ec";

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

	viewBox: Rect;			//vb_x: 0, vb_y: 0,	vb_width: 0, vb_height: 0
	baseViewBox: Size;		//base_vb_width, base_vb_height
	multiplier: number;
	ratioX: number;
	ratioY: number;
	pos: Point;
	size: Size;
	compList: Map<string, ItemBoard>;

	//temporary properties
	ec: ItemSolid;
	wire: Wire;

	constructor(options: IApplicationOptions) {
		super(options);
		let
			that: MyApp = this,
			//HTML
			getClientXY = (evt: MouseEvent) =>
				new Point(evt.clientX - that.board.offsetLeft, evt.clientY - that.board.offsetTop),
			//SVG
			getOffset = (clientXY: Point, evt: MouseEvent) =>
				Point.times(clientXY, that.ratioX, that.ratioY).round(),
			handleMouseEvent = function (evt: MouseEvent): IMouseState {
				//this is MyApp
				evt.preventDefault();
				evt.stopPropagation();
				let
					arr = [],
					target = <any>evt.target as SVGElement,
					parent = <any>target.parentNode as Element,
					clientXY = getClientXY(evt),
					state: IMouseState = <IMouseState>{
						id: '#' + parent.id,
						type: attr(parent, "svg-comp"),
						button: evt.button,	//https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/button
						//parent: parent,
						client: clientXY,
						offset: getOffset(clientXY, evt),
						event: evt.type.replace('mouse', ''),
						timeStamp: evt.timeStamp,
						over: {
							type: attr(target, "svg-type"),
							svg: target
						},
						ctrlKey: evt.ctrlKey,
						shiftKey: evt.shiftKey,
						altKey: evt.altKey,
						it: Comp.item(parent.id)
					};
				//post actions
				switch (state.over.type) {
					case "node":
						state.over.nodeNumber = attr(state.over.svg, state.over.type);
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
		//location is panning, size is for scaling
		this.viewBox = new Rect(Point.origin, Size.empty);
		//scaling multipler
		this.multiplier = 0.5;  // 2X UI default
		//this's a const value
		this.ratio = window.screen.width / window.screen.height;
		this.ratioX = 1;
		this.ratioY = 1;
		this.pos = new Point(50, 10);
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
					that.state.transition(state, ActionType.START, newContext);	//EC_NODE		WIRE_NODE
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

		aEL(<any>this.svgBoard, "mouseover", function (evt: MouseEvent) {
			that.state.enabled && that.state.send(ActionType.OVER, handleMouseEvent.call(that, evt));
		}, false);
		aEL(<any>this.svgBoard, "mousemove", function (evt: MouseEvent) {
			that.state.enabled && that.state.send(ActionType.MOVE, handleMouseEvent.call(that, evt));
		}, false);
		aEL(<any>this.svgBoard, "mouseout", function (evt: MouseEvent) {
			that.state.enabled && that.state.send(ActionType.OUT, handleMouseEvent.call(that, evt));
		}, false);
		//
		aEL(<any>this.svgBoard, "mousedown", function (evt: MouseEvent) {
			that.state.enabled && that.state.send(ActionType.DOWN, handleMouseEvent.call(that, evt));
		}, false);
		aEL(<any>this.svgBoard, "mouseup", function (evt: MouseEvent) {
			that.state.enabled && that.state.send(ActionType.UP, handleMouseEvent.call(that, evt));
		}, false);
		//right click o board
		aEL(<any>this.svgBoard, "contextmenu", function (evt: MouseEvent) {
			evt.stopPropagation();
			let
				target = evt.target as Element,
				type = attr(target, "svg-type"),
				key = that.rightClick.setTrigger(
					attr(target.parentNode, "id"),
					attr(target.parentNode, "svg-comp"),
					type,
					type && attr(target, type));
			if (key) {
				that.rightClick
					.build(key)
					.movePoint(getClientXY(evt))
					.setVisible(true);
			}
		}, false);
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
		//
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
			//
		} else {
			comp = new EC(<IItemSolidOptions><unknown>{
				name: name,
				x: this.pos.x,
				y: this.pos.y,
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
}