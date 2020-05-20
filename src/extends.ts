var extendStatics: any = function (d: any, b: any) {
	extendStatics = Object.setPrototypeOf ||
		({ __proto__: [] } instanceof Array && function (d: any, b: any) { d.__proto__ = b; }) ||
		function (d: any, b: any) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
	return extendStatics(d, b);
};

export function __extends(d: any, b: any) {
	extendStatics(d, b);
	function __() { this.constructor = d; }
	d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new (__ as any)());
}