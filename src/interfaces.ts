import Comp from "./components";
import Bond from "./bonds";
import { Type } from "./types";
import Point from './point';
import Prop from "./props";
import Rect from "./rect";
import Size from "./size";
import Tooltip from "./tooltip";
import HtmlWindow from "./app-window";
import StateMachine from "./stateMachine";
import ItemBoard from "./itemsBoard";
import { Application } from "./app";
import EC from "./ec";
import EcProp from "./ecprop";

export interface IExec {
	result: any;
	error: any;
}

//***************************************** UIProperty ************************************//

export interface IUIPropertyCallback {
	(value: number | string | string[], where: number, prop: Prop, e: any): void;
}

export interface IUIPropertyOptions {
	tag: string | Element;
	onChange?: IUIPropertyCallback | undefined;
	toStringFn?: () => string;
}

export interface IUIProperty extends IUIPropertyOptions {
	id: string;
	name: string;
	type: string;
	html: HTMLElement;
	editable: boolean;
	nodeName: string;
	value: number | string | string[];
}

export interface IUIPropertySettings extends IUIProperty {
	getter: string;
	htmlSelect: boolean;
	selectCount: number;
	selectMultiple: boolean;
}

//***************************************** Component Property ************************************//

export interface IComponentProperty {
	value: string;
	combo?: string[];
	type?: string;
	readonly?: boolean;
	title?: string;
	//this's for EC properties like this.p show in property window
	ec: ItemBoard;
	setValue(val: string): boolean;
}

export type ComponentPropertyType = string | IComponentProperty;
//string | { value: string, label?: boolean, editable?: boolean, combo?: string[]

//***************************************** Application ************************************//

export interface IApplicationOptions {
	templates: any;
	includePropsInThis: boolean;
	props: { [x: string]: IUIPropertyOptions };
	list: Map<string, IContextMenuItem[]>
}

export interface IApplicationSettings {
	props: Map<string, IUIProperty>;
	templates: any;
}

export interface IApplication {
	prop(id: string): IUIProperty;
}

//***************************************** MyApp ************************************//

export interface IMyAppOptions extends IApplicationOptions {

}

export interface IMyApp extends IApplication {
	rootDir: string;
	board: HTMLElement;
	svgBoard: SVGElement;

	ratio: number;
	viewBox: Rect;
	baseViewBox: Size;
	multiplier: number;
	ratioX: number;
	ratioY: number;
	pos: Point;
	tooltip: Tooltip;
	topBarLeft: HTMLElement;
	topBarRight: HTMLElement;
	winProps: HtmlWindow;

	state: StateMachine;
}

export interface IMouseState {
	//always
	id: string;
	type: string;
	button: number;
	client: Point;
	offset: Point;
	event: string;
	timeStamp: number;
	over: ICompOverState;
	ctrlKey: boolean;
	shiftKey: boolean;
	altKey: boolean;
	it: ItemBoard;
	//local
	vector: Point;
	className: string;
	nodeNumber: number;
	isEdgeNode: boolean;
	bond: { ec: ItemBoard, node: number };
	A: IPoint;
	B: IPoint;
}

export interface ICompOverState {
	type: string;
	svg: SVGElement;
	nodeNumber: number;
	node: IItemNode;
	line: number;
}
//***************************************** General ************************************//

export interface IPoint {
	x: number;
	y: number;
}

export interface ISize {
	width: number;
	height: number;
}

//***************************************** Component ************************************//
export interface IComponentOptions {
	type: string;
	name: string;
	properties: any;
	data: string;
	meta: IComponentMetadata;
	tmpl: IComponentTemplate;
}

//meta
export interface IComponentMetadata {
	class: string;
	countStart: number;	//for non-global count
	nameTmpl: string;
	labelId: IPoint;
	nodes: IMetadataNodes;
	logic: IMetadataLogic;
	label: IComponentTemplateLabel;
	nodeLabel: boolean;
}

export interface IMetadataNodes {
	length: number;
	//size: ISize;
	list: IMetadataNodeInfo[];
}

export interface IMetadataNodeInfo extends IPoint {
	label: string;
}

export interface IItemNode extends IMetadataNodeInfo {
	rot: IPoint;
}

export interface IMetadataLogic {
	header: string[];
	table: string[][];
}

//tmpl
export interface IComponentTemplate {
	name: string;
	label: IComponentTemplateLabel;
	labels: string[];
}

export interface IComponentTemplateLabel {
	x: number;
	y: number;
	class: string;
	text: string;
}

//
export interface IBaseStoreComponent {
	name: string,
	comp: Comp;
}

export interface IBaseComponent {
	count: number;
	comp: Comp;
}

//***************************************** Item ************************************//

//Item, BoardItem, Wire, ED, Label,...
export interface IItemBaseOptions {
	id: string;
	name: string;
	x: number;
	y: number;
	color: string;
	class: string;
	visible: boolean;
}

export interface IItemBoardOptions extends IItemBaseOptions {
	highlightNodeName: string;
}

export interface IItemWireOptions extends IItemBoardOptions {
	start: IWireBond;
	end: IWireBond;
	points: IPoint[];
}

export interface ILabelText extends IItemBaseOptions {
	fontSize: number;
}

export interface ITooltipText extends ILabelText {
	borderRadius: number;
}

export interface IWireBond {
	id: string;
	node: number;
}

export interface IItemSolidOptions extends IItemBoardOptions {
	rotation: number;
	onProp: Function;
}

//the object item base has all properties, but restricted in the constructor
export interface IItemBaseProperties extends IItemBoardOptions {
	g: SVGElement;
}

export interface ITooltipSettings extends IItemBaseProperties {
	fontSize: number;
	borderRadius: number;
}

export interface IItemBoardProperties extends IItemBaseProperties {
	base: Comp;
	props: any;
	selected: boolean;
	onProp: Function;
	bonds: Bond[];
}

export interface IItemSolidProperties extends IItemBoardProperties {
	rotation: number;
}

export interface IWireProperties extends IItemSolidProperties {
	points: Point[];
	polyline: SVGElement;
	lines: SVGElement[];		//used on edit-mode only
	pad: number;
	edit: boolean;
}

export interface IHighlightable {
	visible: boolean;
	p: Point;
	radius: number;
	g: SVGCircleElement;

	nodeName: string;
	nodeValue: number;

	move(x: number, y: number): void;
	hide(): IHighlightable;
	show(nodeValue: number): IHighlightable;
	refresh(): void;
	setRadius(value: number): IHighlightable;
}

//***************************************** Bonds ************************************//

export interface IBondItem {
	id: string;
	type: Type;
	ndx: number;
}

//***************************************** BaseWindow ************************************//

export interface IBaseWindowOptions extends IItemBaseOptions {
	app: Application;
	size: ISize;
	title: string;
	templateName: string;
	ignoreHeight: boolean;
}

export interface IBaseWindowSettings extends IBaseWindowOptions {
	win: HTMLElement;
}

//***************************************** AppWindow ************************************//

export interface IAppWindowOptions extends IBaseWindowOptions {
	selected: boolean;
	content: string;
	bar: string;
}

export interface IAppWindowProperties extends IAppWindowOptions, IBaseWindowSettings {
	//
	titleDOM: HTMLElement;
	main: HTMLElement;
	footer: HTMLElement;
	//
	dragging: boolean;
	offset: Point;
	//
	properties: EcProp[];
}

//***************************************** ContextWindow ************************************//

export interface IContextMenuItem {
	text: string;
	action: number;
	shortcut: string;
}

export interface IContextMenuOptions extends IBaseWindowOptions {
	list: Map<string, IContextMenuItem[]>;
}

export interface IContextMenuSettings extends IContextMenuOptions {
	win: HTMLElement;
	current: string;
}

//***************************************** State Machine ************************************//
export interface IStateMachineBaseOptions {
	id: string;

	initial: StateType;
	ctx: IMouseState;		//this's the data held in every state
}

export interface IMachineActionCallback {
	(newContext: IMouseState): boolean | undefined;				//so later I can change it
}

export interface IStateMachineOptions extends IStateMachineBaseOptions {
	states?: Object;
	commonActions?: { [key: string]: IMachineActionCallback };
}

export interface IStateMachineSettings extends IStateMachineBaseOptions {
	enabled: boolean;
	value: StateType;		//this's the value
	states: Map<string, IMachineState>;
	commonActions: Map<string, IMachineActionCallback>;
}


export type MachineOverActionType = "forward" | "deny" | "function";

export interface IMachineState {
	key?: StateType;
	overType: MachineOverActionType;
	actions: { [key: string]: (newContext: IMouseState) => boolean | undefined };
}

export interface IStateMachine extends IStateMachineBaseOptions {
	enabled: boolean;

	value: StateType;
	transition(newState: StateType, newAction: ActionType, data?: any): boolean;
	send(newAction: ActionType, data?: any): boolean;
	register(state: IMachineState): boolean;
}

export enum StateType {
	IDLE = 1,						// idle
	DEFAULT = 2,
	BOARD = 3,						// board
	EC_NODE = 4,					// ec_node
	EC_DRAG = 5,					// ec_dragging
	EC_BODY = 6,					// ec_body
	WIRE_LINE = 7,					// wire_line
	WIRE_EDIT = 8,					// wire_edit
	WIRE_NODE = 9,					// wire_node
	WIRE_NODE_DRAG = 10,			// wire_node_dragging
	WIRE_LINE_DRAG = 11,			// wire_line_dragging

	//BOND_WIRE = 13,					// bond_wire
	//BOND_WIRE_NODE = 14,			// bond_wire_node
	//BOND_WIRE_NODE_DRAG = 15,		// bond_wire_node_dragging
}

export enum ActionType {
	DEFAULT = 1,
	OVER = 2,
	OUT = 3,
	MOVE = 4,
	DOWN = 5,
	UP = 6,
	START = 14,						//jump to leave space for basic actions
	RESUME = 15,
	STOP = 16,
	HIDE_NODE = 17,
	SHOW_NODE_TOOLTIP = 18,
	SHOW_BODY_TOOLTIP = 19,
	FORWARD_OVER = 20,
	SELECT_ALL = 21,
	UNSELECT_ALL = 22,
	//check this one is used
	AFTER_DRAG = 51
}