import { condClass, obj, attr, extend, isFn } from './dab';
import { Bond } from './bonds';
import ItemBase from './itemsBase';
import Comp from './components';
import {
	IPoint, IItemNode, IBondItem, IItemBoardProperties,
	ComponentPropertyType, IComponentProperty, IItemBaseOptions
} from './interfaces';
import { map } from './utils';
import Point from './point';
import { Circuit } from './circuit';
import EC from './ec';
import Wire from './wire';
import { Type } from './types';

//ItemBoard->Wire
export abstract class ItemBoard extends ItemBase {

	protected settings: IItemBoardProperties;

	get base(): Comp { return this.settings.base }
	get onProp(): Function { return this.settings.onProp }
	get selected(): boolean { return this.settings.selected }
	get bonds(): Bond[] { return this.settings.bonds }
	get label(): string { return this.settings.label }

	abstract get count(): number;	// EC is node count, Wire is point count
	abstract valid(node: number): boolean;
	abstract get last(): number;
	abstract refresh(): ItemBoard;	//full refresh
	abstract nodeRefresh(node: number): ItemBoard;
	abstract getNode(node: number): IItemNode;
	abstract getNodeRealXY(node: number): Point;
	abstract setNode(node: number, p: IPoint): ItemBoard;
	abstract overNode(p: IPoint, ln: number): number;
	//finds a matching point, faster
	abstract findNode(p: Point): number;

	//this returns true for an EC, and any Wire node and that it is not a start|end bonded node
	abstract nodeHighlightable(node: number): boolean;

	constructor(public circuit: Circuit, options: IItemBaseOptions) {
		super(options);
		let
			base = <Comp>Comp.find(this.name);
		if (!base || !circuit)
			throw `cannot create component`;
		this.settings.props = obj(base.props);
		attr(this.g, {
			id: this.id,
			"svg-comp": this.base.type,
		})
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

	public bond(thisNode: number, ic: ItemBoard, icNode: number): boolean {
		let
			entry = this.nodeBonds(thisNode);
		// ic: wire,  node: wire node number, thisNode: node of IC connected
		if (!ic
			|| (entry && entry.has(ic.id)) 	//there's a bond with a connection to this ic.id
			|| !ic.valid(icNode))
			return false;
		//make bond if first, or append new one
		if (!entry) {
			(<any>this.settings.bonds)[thisNode] = entry = new Bond(this, ic, icNode, thisNode);
		} else if (!entry.add(ic, icNode)) {
			console.log('Oooopsie!')
		}
		this.settings.bondsCount++;
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
		let
			bond = this.nodeBonds(node),
			b = (bond == null) ? null : bond.remove(id);
		if (b != null) {
			if (bond.count == 0) {
				//ensures there's no bond object if no destination
				delete (<any>this.settings.bonds)[node];
				(--this.settings.bondsCount == 0) && (this.settings.bonds = []);
			}
			this.nodeRefresh(node);
			let
				ic = this.circuit.get(id);
			ic && ic.unbond(b.ndx, this.id);
		}
	}

	public unbondNode(node: number): void {
		let
			bond = this.nodeBonds(node),
			link: IBondItem = <any>void 0;
		if (!bond)
			return;
		//try later to use bond.to.forEach, it was giving an error with wire node selection, think it's fixed
		for (let i = 0, len = bond.to.length; i < len; i++) {
			link = bond.to[i];
			this.circuit.get(link.id)?.unbond(link.ndx, bond.from.id);
		}
		delete (<any>this.settings.bonds)[node];
		(--this.settings.bondsCount == 0) && (this.settings.bonds = []);
	}

	public disconnect() {
		for (let node = 0; node < this.count; node++)
			this.unbondNode(node);
	}

	public static connectedWiresTo(ecList: EC[]): Wire[] {
		let
			wireList: Wire[] = [],
			ecIdList = ecList.map(ec => ec.id),
			circuit = ecList[0]?.circuit,
			secondTest: { wire: Wire, toId: string }[] = [],
			oppositeEdge = (node: number, last: number) => node == 0 ? last : (node == last ? 0 : node);
		if (circuit) {
			ecList.forEach(ec => {
				ec.bonds.forEach(bond => {
					bond.to
						.filter(b => !wireList.find(w => w.id == b.id))
						.forEach(b => {
							let
								wire = circuit.get(b.id) as Wire,
								toWireBond = wire.nodeBonds(oppositeEdge(b.ndx, wire.last));
							if (toWireBond.to[0].type == Type.EC) {
								ecIdList.includes(toWireBond.to[0].id)
									&& wireList.push(wire)
							} else {
								if (wireList.find(w => w.id == toWireBond.to[0].id)) {
									wireList.push(wire);
								} else {
									secondTest.push({
										wire: wire,
										toId: toWireBond.to[0].id
									})
								}
							}
						})
				})
			});
			secondTest
				.forEach(b => wireList.find(w => w.id == b.toId) && wireList.push(b.wire))
		}
		return wireList;
	}

	public propertyDefaults(): IItemBoardProperties {
		return extend(super.propertyDefaults(), {
			selected: false,
			onProp: void 0,
			bonds: [],
			bondsCount: 0
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

	get value(): string { return this.ec[this.name].toString(0x06) }	//no props and no parenthesis
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
