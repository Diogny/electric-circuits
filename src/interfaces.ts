import Comp from "./components";
import { Bond } from "./bonds";
import { Type } from "./types";
import Point from './point';
import Prop from "./props";
import Rect from "./rect";
import Size from "./size";
import Tooltip from "./tooltip";
import HtmlWindow from "./app-window";
import StateMachine from "./stateMachine";
import { ItemBoard } from "./itemsBoard";
import { Application } from "./app";
import EcProp from "./ecprop";
import EC from "./ec";
import Wire from "./wire";

export interface IExec {
	result: any;
	error: any;
}

//***************************************** UIProperty ************************************//

export interface IUIPropertyCallback {
	(value: number | boolean | string | string[], where: number, prop: Prop, e: any): void;
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
	value: number | boolean | string | string[];
}

export interface IUIPropertySettings extends IUIProperty {
	getter: string;
	htmlSelect: boolean;
	selectCount: number;
	selectMultiple: boolean;
}

//***************************************** Component Property ************************************//

export interface IComponentProperty {
	name: string;
	value: string;
	valueType: string;
	type: string;
	isProperty: boolean;
	readonly: boolean;
	label: string;
	class: string;
	options?: string[];

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
	multiplier: number;
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
	center: Point;
	tooltip: Tooltip;
	bottomBarLeft: HTMLElement;
	winProps: HtmlWindow;

	sm: StateMachine;
}

export interface IMouseState {
	type: string;
	button: number;
	client: Point;
	offset: Point;
	event: string;
	//timeStamp: number;
	over: ICompOverState;
	ctrlKey: boolean;
	shiftKey: boolean;
	altKey: boolean;
	it: EC | Wire | undefined;
}

export interface ICompOverState {
	type: string;
	svg: SVGElement;
	node: number;
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

export interface IRect extends IPoint, ISize { }

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
	//createNodeLabels: boolean;
}

export interface IMetadataNodes {
	//length: number;
	//size: ISize;
	createLabels: boolean;
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
	nodeLabels: string[];
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
	class: string;
	visible: boolean;
	label: string;
	base: Comp;
	//color: string;
}

export interface IItemWireOptions extends IItemBaseOptions {
	//start: IWireBond;
	//end: IWireBond;
	points: IPoint[];
}

export interface IItemSolidOptions extends IItemBaseOptions {
	rotation: number;
	onProp: Function;
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

//the object item base has all properties, but restricted in the constructor
export interface IItemBaseProperties extends IItemBaseOptions {
	g: SVGElement;
}

export interface ITooltipSettings extends IItemBaseOptions {
	g: SVGElement;
	fontSize: number;
	borderRadius: number;
}

export interface IHighlighNodeSettings extends IItemBaseOptions {
	g: SVGElement;
	radius: number;
	//these're the current selected node properties
	selectedId: string;
	selectedNode: number;
}

export interface IItemBoardProperties extends IItemBaseProperties {
	props: any;
	selected: boolean;
	onProp: Function;
	bonds: Bond[];
	bondsCount: number;
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
	name: string;
	data: string;
	shortcut: string;
	enabled: StateType[];
}

export interface IContextMenuOptions extends IBaseWindowOptions {
	list: Map<string, IContextMenuItem[]>;
}

export interface IContextMenuSettings extends IContextMenuOptions {
	win: HTMLElement;
	current: string;
	//client x,y where mouse right-click
	offset: Point;
}

//***************************************** State Machine ************************************//
export interface IStateMachineBaseOptions {
	id: string;
	initial: StateType;
	//ctx: IMouseState;		//this's the data held in every state
}

export interface IMachineActionCallback {
	(newContext: IMouseState): boolean | undefined;				//so later I can change it
}

export interface IStateMachineOptions extends IStateMachineBaseOptions {
	states?: Object;
	commonActions?: { [key: string]: IMachineActionCallback };
	log?: boolean;
}

export interface IStateMachineSettings extends IStateMachineBaseOptions {
	enabled: boolean;
	state: StateType;		//this's the value
	stateName: string;
	stateList: Map<string, IMachineState>;
	commonActions: Map<string, IMachineActionCallback>;
	log: boolean;
}


export type MachineOverActionType = "forward" | "deny" | "function";

export interface IMachineState {
	key: StateType;
	overType: MachineOverActionType;
	actions: { [key: string]: (newContext: IMouseState) => boolean | undefined };
	//data held in this state after a transition, initially is set to undefined
	data?: any;
	//persists data between transistions, it's not DELETED
	persistData?: boolean;
}

export interface IStateMachine extends IStateMachineBaseOptions {
	state: StateType;		//this's the value
	stateName: string;
	data: any;
	getState(name: string): IMachineState;
	transition(newState: StateType, newAction: ActionType, newContext?: any, data?: any): boolean;
	send(newAction: ActionType, newContext?: any): boolean;
	register(state: IMachineState): boolean;
}

export enum StateType {
	IDLE = 1,						// idle
	DEFAULT = 2,
	BOARD = 3,						// board
	EC_NODE = 4,
	EC_DRAG = 5,
	EC_BODY = 6,
	WIRE_NODE = 7,
	WIRE_NODE_DRAG = 8,
	WIRE_LINE = 9,
	WIRE_LINE_DRAG = 10,
	NEW_WIRE_FROM_EC = 11,
}

export enum ActionType {
	DEFAULT = 1,
	OVER = 2,
	OUT = 3,
	MOVE = 4,
	DOWN = 5,
	UP = 6,
	ENTER = 7,
	LEAVE = 8,
	//jump to leave space for basic actions
	START = 14,
	RESUME = 15,
	STOP = 16,
	HIDE_NODE = 17,
	FORWARD_OVER = 18,
	KEY = 40,

	//unified actions
	SELECT = 100,						//"Select"						7
	SELECT_ONLY = 101,
	TOGGLE_SELECT = 102,				//"Toggle Select"				6
	SELECT_ALL = 103,					//"Select All"					8
	UNSELECT_ALL = 104,					//"Deselect All"				9
	DELETE = 110,						//"Delete"						10
	DELETE_SELECTED = 111,				//
	DELETE_ALL = 112,					//"Remove All"
	DELETE_WIRE_NODE = 113,
	DELETE_THIS_LINE = 114,
	AFTER_DELETE = 115,

	SPLIT_THIS_LINE = 120,

	SHOW_PROPERTIES = 200,				//"Properties"					11
	BRING_TO_FRONT = 201,				//"Bring to Front"				3
	ROTATE_45_CLOCKWISE = 202,			//"Rotate 45 clockwise"			20
	ROTATE_45_COUNTER_CLOCKWISE = 203,	//"Rotate 45 counter clockwise"	21
	ROTATE_90_CLOCKWISE = 204,			//"Rotate 90 clockwise"			22
	ROTATE_90_COUNTER_CLOCKWISE = 205,	//"Rotate 90 counter clockwise"	23
	UNBOND = 206,						//"Unbond"						30
	RESUME_EDIT = 207,					//ex "Connections"					31
}
/*

*/