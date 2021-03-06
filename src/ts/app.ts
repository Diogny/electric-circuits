
import { IApplication, IApplicationOptions, IApplicationSettings, IUIProperty, IUIPropertyOptions } from "./interfaces";
import UIProp from "./props";
import { dP, extend } from "./dab";

export class Application implements IApplication {

	protected settings: IApplicationSettings;

	public has(key: string): boolean { return this.settings.props.has(key) }

	public add(propOptions: IUIPropertyOptions, key?: string): boolean {
		let
			p = new UIProp(propOptions);
		!key && (key = p.id);
		if (this.has(key))
			return false;
		this.settings.props.set(key, p);
		return true;
	}

	constructor(options: IApplicationOptions) {
		this.settings = extend({}, options);
		this.settings.props = new Map();
		Object.keys(options.props).forEach((key: string) => {
			if (this.add(options.props[key], key)) {
				options.includePropsInThis
					&& dP(this, key, { get: () => this.prop(key) })
			}
		});
	}

	prop(id: string): IUIProperty {
		return <IUIProperty>this.settings.props.get(id)
	}

}