import { obj } from './dab';
import { IComponentOptions, IBaseStoreComponent, IComponentMetadata } from './interfaces';

const defaultIdTemplate = "{base.comp.name}-{base.count}";
const defaultComponent = (name: string): IBaseStoreComponent => (<any>{
	name: name,
	comp: {
		name: name,
		type: name,
		meta: {
			nameTmpl: defaultIdTemplate,
			nodes: []
		}
	}
});

export default class Comp {

	private static baseComps: Map<string, Comp> =
		Comp.initializeComponents([defaultComponent("tooltip"), defaultComponent("wire")]);

	protected settings: IComponentOptions;

	get name(): string { return this.settings.name }
	get type(): string { return this.settings.type }
	get data(): string { return this.settings.data }
	get props(): any { return this.settings.properties }
	get meta(): IComponentMetadata { return this.settings.meta }

	constructor(options: IComponentOptions) {
		let
			that = this,
			template = options.tmpl;
		delete options.tmpl;
		this.settings = obj(options);
		if (template) {
			let
				base = <Comp>Comp.find(template.name);
			this.settings.data = base.data;
			this.settings.meta = JSON.parse(JSON.stringify(base.meta));
			template.label && (this.settings.meta.label = obj(template.label));
			template.nodeLabels.forEach((lbl, ndx) => {
				that.settings.meta.nodes.list[ndx].label = lbl;
			})
		}
		!this.settings.meta.nameTmpl && (this.settings.meta.nameTmpl = defaultIdTemplate);
		if (!Comp.store(this.settings.name, this))
			throw `duplicated: ${this.settings.name}`;
	}

	public static register = (options: IComponentOptions) => new Comp(options);

	private static initializeComponents(list: IBaseStoreComponent[]): Map<string, Comp> {
		let
			set: Map<string, Comp> = Comp.baseComps;
		if (set == null) {
			set = new Map();
		}
		list.forEach((c) => {
			set.set(c.name, c.comp)
		});
		return set;
	}

	public static store = (name: string, comp: Comp): boolean =>
		Comp.baseComps.has(name) ?
			false :
			(Comp.baseComps.set(name, comp), true);

	public static has = (name: string) => Comp.baseComps.has(name);

	public static find = (name: string): Comp | undefined => {
		return Comp.baseComps.get(name);
	}

}