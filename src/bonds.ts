
import { Type, TypedClass } from './types';
import { obj } from './dab';
import { ItemBoard } from './itemsBoard';
import { IBondItem } from './interfaces';

export default class Bond implements TypedClass {

	public from: IBondItem;
	public to: IBondItem[];

	get type(): Type { return Type.BOND }

	get count(): number { return this.to.length }

	// [0>id-0(Y), -1>id-1(12)]
	get link(): string { return `${this.from.ndx}>${this.to[0].id}(${this.to[0].ndx})` }

	/**
	 * @description implements a component bond, it must be created by default as a One-to-One bond
	 * @param {object} _from from
	 * @param {object} _to to
	 * @param {number} node node
	 * @param {any} pin pin
	 */
	constructor(from: ItemBoard, to: ItemBoard, node: number, pin: number) {
		if (!from || !to)
			throw 'empty bond';
		this.from = this.create(from, pin);
		//by default a destination bond has at least one item
		this.to = [];
		//adds the first to bond
		this.add(to, node);
	}

	//returns true if this bond is connected to an specific EC
	public has(id: string): boolean { return this.to.some((b) => id == b.id) }

	public get(id: string): IBondItem | undefined {
		return this.to.find((b) => id == b.id)
	}

	public add(t: ItemBoard, ndx: number): boolean {
		if (t && !this.has(t.id)) {
			let
				b: IBondItem = this.create(t, ndx);
			if (b.type == Type.EC || b.type == Type.WIRE) {
				this.to.push(b);
				return true;
			}
		}
		return false;
	}

	private create(ec: ItemBoard, ndx: number): IBondItem {
		return obj({
			id: ec.id,
			type: ec.type,
			ndx: ndx
		})
	}

	/**
	 * @description removes a bond connection from this component item
	 * @param {String} id id name of the destination bond
	 * @returns {IBondItem} removed bond item or null if none
	 */
	public remove(id: string): IBondItem | null {
		let
			ndx = this.to.findIndex((b) => b.id == id),
			b: IBondItem | null = (ndx == -1) ? null : this.to[ndx];
		//remove from array
		(b != null) && this.to.splice(ndx, 1);
		//return the removed bond or null
		return b;
	}

	//for Debugging purposes
	public toString = (): string => {
		let
			fn = (o: IBondItem) => `#${o.id} [${o.ndx}]`,
			toStr = this.to.map((b) => fn(b)).join(', ');

		return `from ${fn(this.from)} to ${toStr}`
	}

	//for Debugging purposes
	public static display = (arr: Bond[]): string[] => { return arr.map((o) => o.toString()) }

}

/*
gets the start bond for the wire:
	Comp.item('wire-0').bond().filter((b)=> b.from.ndx == 0)
gets the end bond for the wire:
	Comp.item('wire-0').bond().filter((b)=> b.from.ndx == -1)	//scrapped
*/