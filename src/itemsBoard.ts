
import { aCld, condClass, obj, attr, extend, isFn, isNum, dP, typeOf } from './dab';
import Bond from './bonds';
import ItemBase from './itemsBase';
import Comp from './components';
import {
	IHighlightable, IPoint, IItemNode, IItemBoardOptions, IBondItem, IItemBoardProperties,
	ComponentPropertyType, IComponentProperty
} from './interfaces';
import BoardCircle from './boardCircle';
import { map, tag } from './utils';
import EC from './ec';
import Point from './point';

//ItemBoard->Wire
export abstract class ItemBoard extends ItemBase {

	protected settings: IItemBoardProperties;
	public highlight: IHighlightable;

	get base(): Comp { return this.settings.base }
	get onProp(): Function { return this.settings.onProp }
	get selected(): boolean { return this.settings.selected }
	get bonds(): Bond[] { return this.settings.bonds }

	label: string;
	abstract get count(): number;	// EC is node count, Wire is point count

	constructor(options: IItemBoardOptions) {
		super(options);
		let
			base = Comp.find(this.name, true),
			regex = /(?:{([^}]+?)})+/g,
			that = this;
		if (!base)
			throw `unknown component: ${this.name}`;
		//save base data
		this.settings.base = base.comp;
		//use template to create id according to defined strategy
		// nano(base.comp.meta.nameTmpl, { name: this.base.name, count: base.count++ });
		this.settings.id = `${this.base.name}-${base.count++}`;

		this.label = base.comp.meta.nameTmpl.replace(regex,
			function (match: string, group: string): string { //, offset: number, str: string
				let
					arr = group.split('.'),
					getRoot = (name: string): any => {
						//valid entry points
						switch (name) {
							case "this": return that;
							case "base": return base;
							case "Comp": return Comp;
						}
					},
					rootRef = getRoot(<string>arr.shift()),
					prop = arr.pop(),
					result: any;
				while (rootRef && arr.length)
					rootRef = rootRef[<any>arr.shift()];
				if (rootRef == undefined || (result = rootRef[<any>prop]) == undefined)
					throw `invalid id naming template`;
				//increment counter if any
				isNum(result) && (rootRef[<any>prop] = result + 1)
				return result;
			});
		//deep copy component properties
		this.settings.props = obj(base.comp.props);
		//add properties to DOM
		attr(this.g, {
			id: this.id,
			"svg-comp": this.base.type,
		});
		//create the highligh object
		this.highlight = new BoardCircle(this.settings.highlightNodeName);
		//add it to component, this's the insertion point (insertBefore) for all inherited objects
		aCld(this.g, this.highlight.g);
		//add component label if available
		let
			createText = (attr: any, text: string) => {
				let
					svgText = tag("text", "", attr);
				return svgText.innerHTML = text, svgText
			}
		//for labels in N555, 7408, Atmega168
		if (base.comp.meta.label) {
			aCld(this.g, createText({
				x: base.comp.meta.label.x,
				y: base.comp.meta.label.y,
				"class": base.comp.meta.label.class
			}, base.comp.meta.label.text))
		}
		//add node labels for DIP packages
		if (base.comp.meta.nodes.createLabels) {
			let
				pins = (this as unknown as EC).count / 2;
			for (let y = 60, x = 7, i = 0, factor = 20; y > 0; y -= 44, x += (factor = -factor))
				for (let col = 0; col < pins; col++, i++, x += factor)
					aCld(this.g, createText({ x: x, y: y }, i + ""));
		}

		//this still doesn't work to get all overridable properties ¿?
		//properties still cannot access super value
		//(<any>this.settings).__selected = dab.propDescriptor(this, "selected");
	}

	public select(value: boolean): ItemBoard {
		if (this.selected != value) {
			//set new value
			this.settings.selected = value;
			//add class if selected
			condClass(this.g, "selected", this.selected);
			//unselect any node if any
			this.highlight.hide();
			//trigger property changed if applicable
			this.onProp && this.onProp({
				id: `#${this.id}`,
				value: this.selected,
				prop: "selected",
				where: 1				//signals it was a change inside the object
			});
		}
		return this;
	}

	public setColor(value: string): ItemBoard {
		super.setColor(value);
		//trigger property changed if applicable
		this.onProp && this.onProp({
			id: `#${this.id}`,
			value: this.color,
			prop: "color",
			where: 1				//signals it was a change inside the object
		})
		return this;
	}

	public move(x: number, y: number): ItemBoard {
		super.move(x, y);
		//trigger property changed if applicable
		this.onProp && this.onProp({
			id: `#${this.id}`,
			args: {
				x: this.x,
				y: this.y
			},
			method: 'move',
			where: 1				//signals it was a change inside the object
		})
		return this;	//for object chaining
	}

	public setOnProp(value: Function): ItemBoard {
		isFn(value) && (this.settings.onProp = value);
		//for object chaining
		return this;
	}

	//properties available to show up in property window
	public windowProperties(): string[] { return ["id", "p", "bonds"] }

	public properties(): string[] {
		return this.windowProperties().concat(map(this.settings.props,
			(value: ComponentPropertyType, key: string) => key))
	}

	public prop(propName: string): ComponentPropertyType {
		//inject available properties if called
		switch (propName) {
			case "id":
				return new IdInjector(this)
			case "p":
				return new PositionInjector(this)
			case "bonds":
				return new BondsInjector(this)
		}
		return this.settings.props[propName]
	}

	//poly.bond(0, ec, 1)
	//poly.bond(poly.last, ec, 1)
	//ec.bond(1, poly, 0)
	//ec.bond(1, poly, poly.last)
	public bond(thisNode: number, ic: ItemBoard, icNode: number): boolean {
		let
			entry = this.nodeBonds(thisNode);

		// ic: wire,  node: wire node number, thisNode: node of IC connected
		if (!ic
			|| (entry && entry.has(ic.id)) 	//there's a bond with a connection to this ic.id
			//!(ic.valid(node) || node == -1)) 	//(!ic.valid(node) && node != -1)
			|| !ic.valid(icNode))
			return false;
		//make bond if first, or append new one
		if (!entry) {
			(<any>this.settings.bonds)[thisNode] = entry = new Bond(this, ic, icNode, thisNode);
		} else {
			entry.add(ic, icNode);
		}
		//refresh this node
		this.nodeRefresh(thisNode);

		//make bond the other way, to this component, if not already done
		entry = ic.nodeBonds(icNode);
		//returning true when already a bond is to ensure the first bond call returns "true"
		return (entry && entry.has(this.id)) ? true : ic.bond(icNode, this, thisNode);
	}

	public nodeBonds(nodeName: number): Bond {
		return <Bond>(<any>this.bonds)[nodeName]
	}

	public unbond(node: number, id: string): void {
		//find nodeName bonds
		let
			bond = this.nodeBonds(node),
			b = (bond == null) ? null : bond.remove(id);

		if (b != null) {
			//
			if (bond.count == 0) {
				//ensures there's no bond object if no destination
				delete (<any>this.settings.bonds)[node];
			}
			//refresh this item node
			this.nodeRefresh(node);
			let
				ic = Comp.item(id);
			ic && ic.unbond(b.ndx, this.id);
		}
	}

	public disconnect() {
		this.bonds.forEach((b: Bond) => {
			b.to.forEach((link: IBondItem) => {
				let
					toIc = Comp.item(link.id);
				toIc?.unbond(link.ndx, b.from.id)
			})
		});
	}

	abstract valid(node: number): boolean;
	abstract refresh(): ItemBoard;	//full refresh
	abstract nodeRefresh(node: number): ItemBoard;	//node refresh
	abstract getNode(node: number): IItemNode;
	abstract setNode(node: number, p: IPoint): ItemBoard;
	abstract overNode(p: IPoint, ln: number): number;
	//this returns true for an EC, and any Wire node and that it is not a start|end bonded node
	abstract nodeHighlightable(node: number): boolean;

	//highligh short-cuts
	public setNodeRadius(value: number): ItemBoard {
		this.highlight.setRadius(value);
		return this
	}

	public showNode(node: number): ItemBoard {
		let
			nodeData = this.getNode(node);
		if (nodeData) {
			this.highlight.move(nodeData.x, nodeData.y);
			this.highlight.show(node);
		}
		//for object chaining
		return this;
	}

	public hideNode(): ItemBoard {
		this.highlight.hide();
		return this
	}

	get highlighted(): boolean { return this.highlight.visible }

	public propertyDefaults(): IItemBoardProperties {
		return extend(super.propertyDefaults(), {
			selected: false,
			onProp: void 0,
			bonds: []
		})
	}
}

export abstract class PropertyInjector implements IComponentProperty {

	class: string;

	abstract value: string;
	get valueType(): string { return "string" }

	abstract type: string;

	get isProperty(): boolean { return true }

	get label(): string { return this.name }

	abstract setValue(val: string): boolean;

	constructor(public ec: ItemBoard, public name: string, public readonly: boolean) {
		if (!this.ec || !(this.name in this.ec))
			throw `invalid property ${this.name}`;
		this.class = "";
	}
}

export abstract class PointInjector extends PropertyInjector {

	get type(): string { return "point" }

	get value(): string { return this.ec[this.name].toString(0x06) }	//no vars and no parenthesis
}

export class PositionInjector extends PointInjector {

	get label(): string { return "position" }

	public setValue(val: string): boolean {
		let
			p = Point.parse(val);
		return p && (this.ec.move(p.x, p.y), true);
	}

	constructor(public ec: ItemBoard) {
		super(ec, "p", false)
	}
}

export class StringInjector extends PropertyInjector {

	get type(): string { return "string" }

	get value(): string { return this.ec[this.name] }

	setValue(val: string): boolean {
		return !this.readonly && (this.ec[this.name] = val, true);
	}

	constructor(ec: ItemBoard, name: string, readonly: boolean) {
		super(ec, name, readonly);
	}
}

export class IdInjector extends StringInjector {

	get value(): string { return this.ec[this.name] }

	setValue(val: string): boolean { return false }

	constructor(ec: ItemBoard) {
		super(ec, "id", true);
	}
}

export class BondsInjector extends StringInjector {

	get value(): string {
		return this.ec.bonds.map((o) => o.link).filter(s => !!s).join(', ')
	}

	setValue(val: string): boolean { return false }

	constructor(ec: ItemBoard) {
		super(ec, "bonds", true);
		this.class = "simple";
	}
}
