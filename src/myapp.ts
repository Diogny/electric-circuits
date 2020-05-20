import { Application } from "./app";
import { IApplicationOptions, IMyApp, ITooltipText, IWindowOptions, IStateMachineOptions, StateType, ActionType, IMouseState } from "./interfaces";
import { basePath, qS } from "./utils";
import Rect from "./rect";
import Size from "./size";
import Point from './point';
import Tooltip from "./tooltip";
import { attr, aEL, nano } from "./dab";
import HtmlWindow from "./window";
import ItemSolid from "./itemSolid";
import Wire from "./wire";
import StateMachine from "./stateMachine";
import Comp from "./components";

export class MyApp extends Application implements IMyApp {
	rootDir: string;
	board: HTMLElement;
	ratio: number;
	svgBoard: SVGElement;
	viewBox: Rect;			//vb_x: 0, vb_y: 0,	vb_width: 0, vb_height: 0
	baseViewBox: Size;		//base_vb_width, base_vb_height
	multiplier: number;
	ratioX: number;
	ratioY: number;
	pos: Point;
	tooltip: Tooltip;
	topBarLeft: HTMLElement;
	topBarRight: HTMLElement;
	winProps: HtmlWindow;
	state: StateMachine;

	//temporary properties
	ec: ItemSolid;
	wire: Wire;

	constructor(options: IApplicationOptions) {
		super(options);
		//location is panning, size is for scaling
		this.viewBox = new Rect(Point.origin, Size.empty);
		//scaling multipler
		this.multiplier = 0.5;  // 2X UI default
		this.ratioX = 1;
		this.ratioY = 1;
		this.pos = new Point(50, 10);
		//main SVG insertion point
		this.tooltip = new Tooltip(<ITooltipText>{ id: "tooltip", borderRadius: 4 });

		this.rootDir = <string>basePath();
		this.board = (<HTMLElement>qS("#board"));
		this.svgBoard = (<SVGElement>this.board.children[0]);
		//
		this.ratio = window.screen.width / window.screen.height;
		//base_vb_width: board.clientWidth * ratio | 0,
		//base_vb_height: board.clientHeight * ratio | 0
		this.baseViewBox = new Size(this.board.clientWidth * this.ratio | 0, this.board.clientHeight * this.ratio | 0);

		this.topBarLeft = qS("#top-bar>div:nth-of-type(1)");
		this.topBarRight = qS("#top-bar>div:nth-of-type(2)");

		//this'll hold the properties of the current selected component
		this.winProps = new HtmlWindow(<IWindowOptions>{
			app: this as Application,
			id: "win-props",
			x: 800,
			y: 0,
			title: "Properties",
			bar: "...",
			size: {
				width: 250,
				height: 300
			},
			visible: false,
			content: "Aaaaa...!  kjsdhj sjh sj d sj sd sdjs djsdj kkisaujn ak asd asdn askd askd aksdn aksd  ia hsdoia oa sdoas "
		});

		let
			that: MyApp = this;

		//create state machine
		this.state = new StateMachine(<IStateMachineOptions>{
			id: "state-machine-01",
			initial: StateType.IDLE, // 'IDLE',
			states: {},
			ctx: <IMouseState>{},
			commonActions: {
				HIDE_NODE: function (newContext: IMouseState) {
					newContext.it && newContext.it.hideNode();
					//hide tooltip
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
						//show tooltip
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
					//EC_NODE		WIRE_NODE
					that.state.transition(state, ActionType.START, newContext);
					//console.log(`transition: ${transition}.${action}`)
				}
			}
		});
		//register machine events
		let
			handleMouseEvent = function (evt: MouseEvent): IMouseState {
				//this is MyApp
				evt.preventDefault();
				evt.stopPropagation();
				let
					arr = [],
					target: SVGElement = <any>evt.target,
					parent: Element = <any>target.parentNode,
					type = attr(parent, "svg-comp"),
					//HTML
					clientXY = new Point(evt.clientX - that.board.offsetLeft, evt.clientY - that.board.offsetTop),
					//SVG
					clientXYScaled = Point.times(clientXY, that.ratioX, that.ratioY).round(),
					state: IMouseState = <IMouseState>{
						id: '#' + parent.id,
						type: type,
						button: evt.button,	//https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/button
						//parent: parent,
						client: clientXY,
						offset: clientXYScaled,
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
				}
				//UI logs
				arr.push(` ${state.event} ${state.id} ${state.type}^${state.over.type}`);
				arr.push(`multiplier: ${that.multiplier}`);
				arr.push(`state: ${StateType[that.state.value]}`);
				arr.push(state.offset.toString()); //`x: ${round(state.offset.x, 1)} y: ${round(state.offset.y, 1)}`
				//arr.push(`Client: x: ${clientXY.x} y: ${clientXY.y}`);
				//arr.push(`scaled: x: ${clientXYScaled.x} y: ${clientXYScaled.y}`);
				//render
				that.topBarLeft.innerText = arr.join(", ");
				return state;
			};
		//
		aEL(<any>this.svgBoard, "mouseover", function (evt: MouseEvent) {
			that.state.enabled && that.state.send(ActionType.OVER, handleMouseEvent.call(that, evt));
		}, false);		//enter a component
		aEL(<any>this.svgBoard, "mousemove", function (evt: MouseEvent) {
			that.state.enabled && that.state.send(ActionType.MOVE, handleMouseEvent.call(that, evt));
		}, false);
		aEL(<any>this.svgBoard, "mouseout", function (evt: MouseEvent) {
			that.state.enabled && that.state.send(ActionType.OUT, handleMouseEvent.call(that, evt));
		}, false);		//exists a component
		//
		aEL(<any>this.svgBoard, "mousedown", function (evt: MouseEvent) {
			that.state.enabled && that.state.send(ActionType.DOWN, handleMouseEvent.call(that, evt));
		}, false);
		aEL(<any>this.svgBoard, "mouseup", function (evt: MouseEvent) {
			that.state.enabled && that.state.send(ActionType.UP, handleMouseEvent.call(that, evt));
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
		//calculate size
		this.viewBox.size = new Size(
			this.baseViewBox.width * this.multiplier | 0,
			this.baseViewBox.height * this.multiplier | 0);
		//app.vb_width = app.base_vb_width * this.multiplier | 0;
		//app.vb_height = app.base_vb_height * this.multiplier | 0;

		//set SVG DOM viewBox attribute
		//attr(this.svgBoard, { "viewBox": `${app.vb_x} ${app.vb_y} ${app.vb_width} ${app.vb_height}` });
		attr(this.svgBoard, { "viewBox": `${this.viewBox.x} ${this.viewBox.y} ${this.viewBox.width} ${this.viewBox.height}` });
		//calculate ratio
		this.ratioX = this.viewBox.width / this.svgBoard.clientWidth;
		this.ratioY = this.viewBox.height / this.svgBoard.clientHeight;
		//
		this.topBarRight.innerHTML = nano(this.templates.viewBox01, this.viewBox); // `${this.viewBox.x} ${this.viewBox.y} ${this.viewBox.width} ${this.viewBox.height}`;
	}

	public getAspectRatio(width: number, height: number) {
		var
			ratio = width / height;
		return (Math.abs(ratio - 4 / 3) < Math.abs(ratio - 16 / 9)) ? '4:3' : '16:9';
	}

	public tooltipFontSize = () => Math.max(10, 35 * this.multiplier)

}