
import { obj } from './dab';
import ItemBoard from './itemsBoard';
import {
	IBaseComponent, IComponentOptions, IBaseStoreComponent, IComponentMetadata
} from './interfaces';

export default class Comp {

	// all base components with metadata
	private static baseComps: Map<string, IBaseComponent> =
		Comp.initializeComponents([{
			name: "label", obj: <Comp>{
				name: "label", type: "label", meta: {}
			}
		},
		{
			name: "wire", obj: <Comp>{
				name: "wire", type: "wire", meta: {}
			}
		}
		]);

	//all ecs, wires in the board
	private static boardItems: Map<string, ItemBoard> = new Map();
	protected settings: IComponentOptions;

	get name(): string { return this.settings.name }
	get type(): string { return this.settings.type }
	get data(): string { return this.settings.data }
	get props(): any { return this.settings.properties }
	get meta(): IComponentMetadata {
		return this.settings.meta
	}

	constructor(options: IComponentOptions) {
		let
			that = this,
			template = options.tmpl;
		//delete
		delete options.tmpl;
		//copy making a dupplicate
		this.settings = obj(options);

		//check to see if this component derivates from a template
		if (template) {
			let
				comp = Comp.find(template.name, true);
			//copy SVG data
			this.settings.data = comp.obj.data;
			//deep copy meta, it has simple object and values
			this.settings.meta = JSON.parse(JSON.stringify(comp.obj.meta));
			//copy label if any
			template.label && (this.settings.meta.label = obj(template.label));
			//update node labels
			template.labels.forEach((lbl, ndx) => {
				that.settings.meta.nodes.list[ndx].label = lbl;
			})
		}
		if (!Comp.store(this.settings.name, this))
			throw `duplicated: ${this.settings.name}`;
	}

	////////////////////////////// STATIC ////////////////////////////////

	public static each = (callbackfn: (value: ItemBoard, key: string, map: Map<string, ItemBoard>) => void) => Comp.boardItems.forEach(callbackfn);

	//it can be sent #id
	public static item = (id: string): ItemBoard | undefined => Comp.boardItems.get((id).startsWith('#') ? id.slice(1) : id);

	public static save = function (obj?: ItemBoard): boolean {
		if (!obj)
			return false;
		return (Comp.boardItems.set(obj.id, obj), true);
	}

	public static get count() { return Comp.boardItems.size }

	//BASE COMPONENT METADATA

	//register a new base component template
	public static register = (options: IComponentOptions) => new Comp(options);

	private static storeComponent(map: Map<string, IBaseComponent>, name: string, o: Comp): Map<string, IBaseComponent> {
		return map.set(name, obj({
			//interface IBaseComponent
			count: 0,
			obj: o
		}))
	}

	private static initializeComponents(list: IBaseStoreComponent[]): Map<string, IBaseComponent> {
		let
			set: Map<string, IBaseComponent> = Comp.baseComps;
		if (set == null) {
			set = new Map();
		}
		list.forEach((c) => {
			Comp.storeComponent(set, c.name, c.obj)
		});
		return set;
	}

	public static store = (name: string, obj: Comp): boolean =>
		Comp.baseComps.has(name) ?
			false :
			(Comp.storeComponent(Comp.baseComps, name, obj), true);

	public static has = (name: string) => Comp.baseComps.has(name);

	public static find = (name: string, original: boolean): IBaseComponent => {
		let
			entry = Comp.baseComps.get(name);
		return (!entry || original) ? entry : obj({
			obj: entry.obj,
			count: entry.count
		})
	}

}