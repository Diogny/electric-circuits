
import { IApplication, IApplicationOptions, IApplicationSettings, IUIProperty, IUIPropertyOptions } from "./interfaces";
import UIProp from "./props";
import { dP, extend } from "./dab";

export class Application implements IApplication {

	protected settings: IApplicationSettings;

	//returns the registered templates, undefined if not loaded yet
	get templates(): any { return this.settings.templates }

	set templates(value: any) {
		this.settings.templates = value
	}

	public has(key: string): boolean { return this.settings.props.has(key) }

	public add(propOptions: IUIPropertyOptions, key?: string): boolean {
		let
			p = new UIProp(propOptions);
		//if key is undefined, then we get it from property.id
		!key && (key = p.id);
		//see for duplicates
		if (this.has(key))
			return false;
		//add it
		this.settings.props.set(key, p);
		return true;
	}

	constructor(options: IApplicationOptions) {
		//sets defaults
		this.settings = extend({}, options);

		this.settings.props = new Map();
		!this.settings.templates && (this.settings.templates = {});

		//this only happens when DOM is ready
		Object.keys(options.props).forEach((key: string) => {
			if (this.add(options.props[key], key)) {
				//save all properties as a get/set property in this for direct access
				options.includePropsInThis
					&& dP(this, key, { get: () => this.prop(key) })
			}
		});
	}

	prop(id: string): IUIProperty {
		return <IUIProperty>this.settings.props.get(id)
	}

}