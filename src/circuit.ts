import EC from "./ec";
import Wire from "./wire";
import { ItemBoard } from "./itemsBoard";
import { Type } from "./types";
import Rect from "./rect";
import { nano } from "./dab";
import { MyApp } from "./myapp";
import { ipcRenderer } from "electron";

export class Circuit {

	ecMap: Map<string, EC>;
	wireMap: Map<string, Wire>;
	__modified: boolean;

	get modified(): boolean { return this.__modified }
	set modified(value: boolean) {
		if (value == this.__modified)
			return;
		ipcRenderer.invoke('shared-data', ['app.circuit.modified', value])
			.then(value => {
				console.log('setting modified: ', value)
			});
		this.__modified = value;
	}

	//returns all components: ECs, Wires
	get components(): ItemBoard[] {
		return (Array.from(this.ecMap.values()) as ItemBoard[])
			.concat(Array.from(this.wireMap.values()))
	}

	selectedComponents: EC[];

	public get(id: string): EC | Wire | undefined {
		return this.ecMap.get(id) || this.wireMap.get(id)
	}

	//has value if only one comp selected, none or multiple has undefined
	get ec(): EC | undefined {
		return !this.selectedComponents.length ? void 0 : this.selectedComponents[0]
	}

	constructor(public app: MyApp, public name: string, public description?: string) {
		this.ecMap = new Map();
		this.wireMap = new Map();
		this.selectedComponents = [];
		this.__modified = false;
	}

	//components
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
		this.selectedComponents = Array.from(this.ecMap.values()).filter(c => c.selected);
	}

	public selectThis(comp: EC) {
		selectAll.call(this, false);
		this.selectedComponents = [comp.select(true) as EC];
	}

	public selectRect(rect: Rect) {
		(this.selectedComponents =
			Array.from(this.ecMap.values())
				.filter((item) => {
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

	public add(comp: EC | Wire, fn?: (comp: EC | Wire) => void): boolean {
		switch (comp.type) {
			case Type.EC:
				return !this.ecMap.has(comp.id)
					&& (this.ecMap.set(comp.id, <EC>comp), fn && fn(comp), this.modified = true, true);
			case Type.WIRE:
				return !this.wireMap.has(comp.id)
					&& (this.wireMap.set(comp.id, <Wire>comp), fn && fn(comp), this.modified = true, true)
		}
		return false;
	}

	public XML(): string {
		let
			ecs = '\t<ecs>\n'
				+ Array.from(this.ecMap.values())
					.map(comp => nano('\t\t<ec id="{id}" name="{name}" x="{x}" y="{y}" rot="{rotation}" />\n', comp))
					.join('')
				+ '\t</ecs>\n',
			wires =
				'\t<wires>\n'
				+ Array.from(this.wireMap.values())
					.map(wire => nano('\t\t<wire id="{id}" points="{points}" />\n', {
						id: wire.id,
						points: wire.points.map(p => nano('{x},{y}', p))
							.join('|')
					}))
					.join('')
				+ '\t</wires>\n',
			bonds =
				this.components.map(comp => !comp.bonds.length ? "" : nano(`\t\t<bond id="{id}" d="${comp.bonds.map((o) => o.link).filter(s => !!s).join(',')}" />\n`, comp))
					.filter(s => !!s)
					.join('');
		return '<?xml version="1.0" encoding="utf-8"?>\n<circuit version="1.1.5">\n'
			+ ecs + wires
			+ '\t<bonds>\n' + bonds + '\t</bonds>\n'
			+ '</circuit>\n'
	}

	public load(content: string): boolean {

		return true
	}

}

function selectAll(value: boolean): EC[] {
	let
		arr = Array.from((this as Circuit).ecMap.values());
	arr.forEach(comp => comp.select(value));
	return arr;
}