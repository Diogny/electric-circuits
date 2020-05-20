
import { obj } from './dab';
import ItemBoard from './itemsBoard';
import {
	IBaseComponent, IComponentOptions, IMetadataNodes, IMetadataLogic, IBaseStoreComponent
} from './interfaces';

export default class Comp {

	private static baseComps: Map<string, IBaseComponent> =
		Comp.initializeComponents([{
			name: "label", obj: <Comp>{
				name: "label", type: "label"
			}
		},
		{
			name: "wire", obj: <Comp>{
				name: "wire", type: "wire"
			}
		}
		]); // all base components with metadata

	private static boardItems: Map<string, ItemBoard> = new Map(); //all ecs, wires in the board
	//private static alwaysTrue = () => !0;
	protected settings: IComponentOptions;

	get name(): string { return this.settings.name }
	get type(): string { return this.settings.type }
	get data(): string { return this.settings.data }
	get props(): any { return this.settings.properties }

	get nodes(): IMetadataNodes { return this.settings.meta.nodes }
	get logic(): IMetadataLogic { return this.settings.meta.logic }

	constructor(options: IComponentOptions) {
		//copy making a dupplicate
		this.settings = obj(options);

		//check to see if this component derivates from a template
		if (this.settings.tmpl) {
			let
				tmp = Comp.find(this.settings.tmpl.name, true);
			//copy SVG data
			this.settings.data = tmp.obj.data;
			//deep copy meta
			this.settings.meta = obj({
				"nodes": tmp.obj.nodes,
				"logic": tmp.obj.logic
			});
			//update svg text tag if provided
			let
				lbl = this.settings.tmpl.label;
			lbl && (this.settings.data = this.settings.data
				.replace(/\<text[^\>]*\>(.*)\<\/text\>/gm,
					`<text x='${lbl.x}' y='${lbl.y}' font-size='${lbl.font}'>${lbl.text}</text>`)
			);
			//update node labels
			this.settings.tmpl.labels.forEach((lbl, ndx) => {
				this.settings.meta.nodes.list[ndx].label = lbl;
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