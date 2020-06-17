export enum Type {
	UNDEFINED = 0,
	EC = 1,
	WIRE = 2,
	BOND = 3,
	LABEL = 4,
	WIN = 5,
	TOOLTIP = 6,
	HIGHLIGHT = 7
};

export abstract class TypedClass {

	abstract get type(): Type;

}