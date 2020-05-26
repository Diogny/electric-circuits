
import { aCld, condClass, obj, attr, extend, isFn, addClassX, nano } from './dab';
import Bond from './bonds';
import ItemBase from './itemsBase';
import Comp from './components';
import { IHighlightable, IPoint, IItemNode, IItemBoardOptions, IBondItem, IItemBoardProperties, ComponentPropertyType } from './interfaces';
import BoardCircle from './boardCircle';
import { map, tag } from './utils';
import EC from './ec';

//ItemBoard->Wire
export default abstract class ItemBoard extends ItemBase {

	protected settings: IItemBoardProperties;
	public highlight: IHighlightable;

	get base(): Comp { return this.settings.base }
	get onProp(): Function { return this.settings.onProp }
	get selected(): boolean { return this.settings.selected }
	get bonds(): Bond[] { return this.settings.bonds }

	abstract get count(): number;	// EC is node count, Wire is node count

	constructor(options: IItemBoardOptions) {
		super(options);
		//I can use a MAC address for a board item in components.ts to access all base info of component
		let
			base = Comp.find(options.name, true);
		if (!base)
			throw `unknown component: ${options.name}`;
		//save base data
		this.settings.base = base.obj;
		//this overrides the id
		////this.base.name + "-" + base.count++;
		this.settings.id = nano(base.obj.meta.nameTmpl, {
			name: this.base.name,
			count: base.count++
		});
		//deep copy component properties
		this.settings.props = obj(base.obj.props);
		//add properties to DOM
		attr(this.g, {
			id: this.id,
			"svg-comp": this.base.type,
		});
		//check for custom class
		this.base.meta.class && addClassX(this.g, this.base.meta.class);
		//create the highligh object
		this.highlight = new BoardCircle(options.highlightNodeName);
		//add it to component, this's the insertion point (insertBefore) for all inherited objects
		aCld(this.g, this.highlight.g);
		//initialize Bonds array
		this.settings.bonds = [];
		//add component label if available
		let
			createText = (attr: any, text: string) => {
				let
					svgText = tag("text", "", attr);
				return svgText.innerHTML = text, svgText
			}
		if (base.obj.meta.label) {
			aCld(this.g, createText({
				x: base.obj.meta.label.x,
				y: base.obj.meta.label.y,
				"class": base.obj.meta.label.class
			}, base.obj.meta.label.text))
		}
		//add node labels
		if (base.obj.meta.nodeLabel) {
			let
				i = 0,
				factor = 20,
				x = 7,
				pins = (this as unknown as EC).count / 2;
			for (let y = 60; y > 0; y -= 44, x += (factor = -factor)) {
				for (let col = 0; col < pins; col++, i++, x += factor) {
					aCld(this.g, createText({
						x: x,
						y: y
					}, i + ""))
				}
			}
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

	public prop(propName: string): ComponentPropertyType { return this.settings.props[propName] }

	public properties(): string[] {
		return map(this.settings.props,
			(value: ComponentPropertyType, key: string) => key)
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
			onProp: void 0
		})
	}
}