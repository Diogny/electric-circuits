import EC from "./ec";
import Wire from "./wire";
import { ItemBoard } from "./itemsBoard";
import { Type } from "./types";
import Rect from "./rect";
import { nano, isNum } from "./dab";
import { MyApp } from "./myapp";
import { ipcRenderer } from "electron";
import * as xml2js from 'xml2js';
import { IPoint, IBaseComponent } from "./interfaces";
import Point from "./point";
import Comp from "./components";
import { Bond } from "./bonds";

export class Circuit {

	version: string;
	name: string;
	description: string;

	uniqueCounters: any;
	compMap: Map<string, IBaseComponent>;

	ecMap: Map<string, EC>;
	wireMap: Map<string, Wire>;

	public rootComponent(name: string): IBaseComponent | undefined {
		return this.compMap.get(name)
	}

	__multiplier: number;
	get multiplier(): number { return this.__multiplier }
	set multiplier(value: number) {
		if (isNaN(value)
			|| value == this.__multiplier
			|| !["0.125", "0.166", "0.25", "0.33", "0.5", "0.75", "1", "2", "4", "8"].some(s => parseFloat(s) == value))
			return;
		this.__multiplier = value;
		this.modified = true;
	}

	__modified: boolean;
	get modified(): boolean { return this.__modified }
	set modified(value: boolean) {
		if (value == this.__modified)
			return;
		this.__modified = value;
		//proof of concept
		/*ipcRenderer.invoke('shared-data', ['app.circuit.modified', value])
			.then(value => {
				console.log('setting modified: ', value)
			});*/
	}

	get ecList(): EC[] { return Array.from(this.ecMap.values()) }

	get wireList(): Wire[] { return Array.from(this.wireMap.values()) }

	//returns all components: ECs, Wires
	get components(): ItemBoard[] { return (this.ecList as ItemBoard[]).concat(this.wireList) }

	selectedComponents: EC[];

	public get(id: string): EC | Wire | undefined {
		return this.ecMap.get(id) || this.wireMap.get(id)
	}

	filePath: string;

	//has value if only one comp selected, none or multiple has undefined
	get ec(): EC | undefined {
		return !this.selectedComponents.length ? void 0 : this.selectedComponents[0]
	}

	circuitLoadingOrSaving: boolean;

	constructor(public app: MyApp, options: string | { name: string, multiplier: number, version?: string, filePath?: string, description?: string }) {
		this.compMap = new Map();
		this.ecMap = new Map();
		this.wireMap = new Map();
		this.selectedComponents = [];
		this.uniqueCounters = {};
		if (typeof options == "string") {
			//load Circuit
			parseCircuitXML.call(this, options);
		} else {
			//empty Circuit
			this.version = options.version || "1.1.5";
			this.__multiplier = options.multiplier;
			this.name = options.name;
			this.description = <string>options.description;
			this.filePath = <string>options.filePath;
		}
		//overrides
		this.__modified = false;
	}

	//selection
	public hasComponent(id: string): boolean { return this.ecMap.has(id); }

	public selectAll() {
		this.selectedComponents = selectAll.call(this, false);
	}

	public deselectAll() {
		selectAll.call(this, false);
		this.selectedComponents = [];
	}

	public toggleSelect(comp: EC) {
		comp.select(!comp.selected);
		this.selectedComponents = this.ecList.filter(c => c.selected);
	}

	public selectThis(comp: EC) {
		selectAll.call(this, false);
		this.selectedComponents = [comp.select(true) as EC];
	}

	public selectRect(rect: Rect) {
		(this.selectedComponents = this.ecList.filter((item) => {
			return rect.intersect(item.rect())
		}))
			.forEach(item => item.select(true));
	}

	public deleteSelected(): number {
		let
			deletedCount = 0;
		this.selectedComponents = this.selectedComponents.filter((c) => {
			if (this.delete(c)) {
				deletedCount++;
				return false;
			}
			return true;
		});
		this.modified = deletedCount != 0;
		return deletedCount
	}

	//add/delete
	public delete(comp: ItemBoard): boolean {
		if (comp.type == Type.WIRE ?
			this.wireMap.delete(comp.id) :
			this.ecMap.delete(comp.id)
		) {
			comp.disconnect();
			comp.remove();
			this.modified = true;
			return true
		}
		return false
	}

	public add(name: string, addToDOM?: boolean, points?: IPoint[]): EC | Wire {
		let
			options = <any>{
				name: name
			},
			comp: EC | Wire;
		((name == "wire") && (options.points = points || [Point.origin, Point.origin], true))
			|| (options.x = this.app.center.x, options.y = this.app.center.y);
		comp = createBoardItem.call(this, options, addToDOM);
		this.modified = true;
		return <any>comp
	}

	//load/save
	public XML(): string {
		let
			circuitMetadata = () => {
				let
					description = this.description
						? ` description="${this.description}"` : "";
				return `<circuit version="1.1.5" zoom="${this.app.multiplier}" name="${this.name}"${description}>\n`
			},
			ecTmpl = '\t\t<ec id="{id}" name="{name}" x="{x}" y="{y}" rot="{rotation}" label="{label}" />\n',
			ecs = '\t<ecs>\n'
				+ this.ecList
					.map(comp => nano(ecTmpl, comp))
					.join('')
				+ '\t</ecs>\n',
			wireTnpl = '\t\t<wire id="{id}" points="{points}" label="{label}" />\n',
			wires =
				'\t<wires>\n'
				+ this.wireList
					.map(wire => nano(wireTnpl, {
						id: wire.id,
						points: wire.points.map(p => nano('{x},{y}', p))
							.join('|'),
						label: wire.label
					}))
					.join('')
				+ '\t</wires>\n',
			bonds = getAllCircuitBonds.call(this)
				.map((b: string) => `\t\t<bond>${b}</bond>\n`)
				.join('');
		return '<?xml version="1.0" encoding="utf-8"?>\n'
			+ circuitMetadata()
			+ ecs
			+ wires
			+ '\t<bonds>\n' + bonds + '\t</bonds>\n'
			+ '</circuit>\n'
	}

	public save(showDialog: boolean): Promise<number> {
		if (!this.modified)
			return Promise.resolve(3);	// Not Modified: 3
		let
			self = this as Circuit,
			getOptions = () => {
				let
					options = <any>{
						data: self.XML()
					};
				self.filePath && (options.filePath = self.filePath)
				return options
			};
		this.circuitLoadingOrSaving = true;
		return (showDialog ?
			this.app.dialog.showDialog("Confirm", "You have unsaved work!", ["Save", "Cancel", "Don't Save"])
				.then((choice) => {
					return Promise.resolve(choice); // Save: 0,  Cancel: 1, Don't Save: 2
				})
				.catch((reason) => {
					return Promise.resolve(5)	// Error: 5
				})
			: Promise.resolve(0)
		).then((choice) => {    // Save: 0,  Cancel: 1, Don't Save: 2, Error: 5
			if (choice == 0) {
				//try to save
				let answer = ipcRenderer.sendSync('saveFile', getOptions());
				//error treatment
				if (answer.canceled)
					choice = 1;		// Cancel: 1
				else if (answer.error) {
					console.log(answer);				//later popup with error
					choice = 5;		// Error: 5
				}
				else {						//OK
					self.filePath = answer.filepath;
					self.modified = false;
				}
			}
			self.circuitLoadingOrSaving = false;
			return Promise.resolve(choice);
		})
	}

	//cleaning
	public destroy() {
		this.ecList.forEach(ec => this.delete(ec));
		this.wireList.forEach(wire => this.delete(wire));
		//maps should be empty here
		this.compMap = <any>void 0;
		this.ecMap = <any>void 0;
		this.wireMap = <any>void 0;
		this.selectedComponents = <any>void 0;
		this.__modified = false;
		this.filePath = <any>void 0;
	}
}

function createBoardItem(options: any, addToDOM?: boolean): EC | Wire {
	let
		self = (this as Circuit),
		regex = /(?:{([^}]+?)})+/g,
		name = options?.name || "",
		base = <IBaseComponent>self.rootComponent(name),
		newComp = !base,
		item: ItemBoard = <any>void 0;
	//register new component in the circuit
	!base && (base = {
		comp: <Comp>Comp.find(name),
		count: 0
	});
	if (!base.comp)
		throw `unregistered component: ${name}`;
	newComp
		&& (base.count = base.comp.meta.countStart | 0, self.compMap.set(name, base));
	options.base = base.comp;
	if (!options.id) {
		//if not ID
		options.id = `${name}-${base.count}`;

		//use template to create label according to defined strategy
		options.label = base.comp.meta.nameTmpl.replace(regex,
			function (match: string, group: string): string { //, offset: number, str: string
				let
					arr = group.split('.'),
					getRoot = (name: string): any => {
						//valid entry points
						switch (name) {
							case "base": return base;
							case "Circuit": return self.uniqueCounters;
						}
					},
					rootName = arr.shift() || "",
					rootRef = getRoot(rootName),
					prop: string = <any>arr.pop(),
					isUniqueCounter = () => rootName == "Circuit",
					result: any;
				while (rootRef && arr.length)
					rootRef = rootRef[<any>arr.shift()];
				if (rootRef == undefined
					|| ((result = rootRef[prop]) == undefined
						&& (!isUniqueCounter()
							|| (result = rootRef[prop] = base.comp.meta.countStart | 0, false)))
				)
					throw `invalid label template`;
				//increment counter only for static properties
				isUniqueCounter() && isNum(result) && (rootRef[<any>prop] = result + 1)
				return result;
			});
		base.count++;
	}
	switch (name) {
		case "wire":
			item = new Wire(self, options);
			if (self.wireMap.has(item.id))
				throw `duplicated id: ${item.id}`;
			self.wireMap.set(item.id, <Wire>item);
			break;
		default:
			!options.onProp && (options.onProp = function () {
				//this happens when this component is created...
			});
			item = new EC(self, options);
			if (self.ecMap.has(item.id))
				throw `duplicated id: ${item.id}`;
			self.ecMap.set(item.id, <EC>item);
			break;
	}
	addToDOM && self.app.addToDOM(<any>item);
	return <any>item
}

function parseCircuitXML(data: string) {
	let
		self = (this as Circuit);
	//answer.filepath
	xml2js.parseString(data, { trim: true, explicitArray: false }, (err, json) => {
		if (err)
			console.log(err);
		else {
			let
				atttrs = json.circuit.$,
				ecs = json.circuit.ecs.ec,
				wires = json.circuit.wires.wire,
				bonds = json.circuit.bonds.bond;
			//attributes
			self.version = atttrs.version;
			self.multiplier = parseFloat(atttrs.zoom) || 1;
			self.name = atttrs.name;
			self.description = atttrs.description;
			//create ECs
			ecs.forEach((xml: { $: { id: string, name: string, x: string, y: string, rot: string, label: string } }) => {
				let
					ec = <EC>createBoardItem.call(self, {
						id: xml.$.id,
						name: xml.$.name,
						x: parseInt(xml.$.x),
						y: parseInt(xml.$.y),
						rotation: parseInt(xml.$.rot),
						label: xml.$.label,
					}, false);

			})
			wires.forEach((xml: { $: { id: string, points: string, label: string } }) => {
				let
					options = {
						id: xml.$.id,
						name: "wire",
						label: xml.$.label,
						points: xml.$.points.split('|').map(s => Point.parse(s)),
					};
				if (options.points.some(p => !p))
					throw `invalid wire points`;
				let
					wire = <Wire>createBoardItem.call(self, options, false);
			})
			bonds.forEach((s: string) => {
				let
					arr = s.split(','),
					fromIt = <ItemBoard>self.get(<string>arr.shift()),
					fromNdx = parseInt(<string>arr.shift()),
					toIt = <ItemBoard>self.get(<string>arr.shift()),
					toNdx = parseInt(<string>arr.shift());
				if (arr.length || !fromIt || !toIt || !fromIt.getNode(fromNdx) || !toIt.getNode(toNdx))
					throw `invalid bond`;
				fromIt.bond(fromNdx, toIt, toNdx);
			})
		}
	})
}

function getAllCircuitBonds(): string[] {
	let
		bonds: string[] = [],
		keyDict: Set<string> = new Set(),
		findBonds = (bond: Bond) => {
			let
				fromId = bond.from.id,
				fromNdx = bond.from.ndx,
				keyRoot = `${fromId},${fromNdx}`;
			bond.to.forEach(b => {
				let
					otherRoot = `${b.id},${b.ndx}`,
					key0 = `${keyRoot},${otherRoot}`;
				if (!keyDict.has(key0)) {
					keyDict.add(key0).add(`${otherRoot},${keyRoot}`);
					bonds.push(key0);
				}
			})
		};
	(this as Circuit).components
		.forEach(comp => comp.bonds.forEach(findBonds));
	return bonds;
}

function selectAll(value: boolean): EC[] {
	let
		arr = Array.from((this as Circuit).ecMap.values());
	arr.forEach(comp => comp.select(value));
	return arr;
}
