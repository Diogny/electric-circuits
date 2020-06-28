class Templates {
	private static map: Map<string, string> = new Map();

	public static get(key: string): string { return <any>Templates.map.get(key) }

	public static set(key: string, value: string) { Templates.map.set(key, value) }

	public static get size(): number { return Templates.map.size }

	public static register(obj: { [key: string]: string }) {
		for (let key in obj) {
			Templates.set(key, obj[key])
		}
	}

	/**
	 * @description simple template parser
	 * @param key template's key name
	 * @param obj object to get values from
	 */
	public static nano(key: string, obj: any) {
		let str = Templates.get(key);
		return str.replace(/\{\{\s*([\w\.]*)\s*\}\}/g, (n, t) => {
			for (var arr = t.split("."), f = obj[arr.shift()], i = 0, len = arr.length; f && len > i; i++)
				f = f[arr[i]];
			return "undefined" != typeof f && null !== f ? f : "null";
		});
	}

	/**
	 * @description full template parser
	 * @param key template's key name
	 * @param obj object to get values from
	 */
	public static parse(key: string, obj: any, beautify?: boolean) {
		let
			xml = XML.parse(Templates.get(key), "text/html"),
			nsMap = new Map(),
			getValue = (ns: string, o: any) => {
				for (var arr = ns.split("."), f = o[<any>arr.shift()], i = 0, len = arr.length; f && len > i; i++)
					f = f[arr[i]];
				return f;
			},
			getMappedValue = (ns: string) => {
				let
					value = nsMap.get(ns);
				!value && nsMap.set(ns, value = getValue(ns, obj))
				return value;
			},
			processNode = (node: HTMLElement, rootName: string, arr: any[], ndx: number) => {
				let
					isMatch = false,
					attributes = Array.from(node.attributes),
					parseContent = (str: string) => {
						let
							regex = /\{\{\s*([\w\.]*)\s*\}\}/g,
							match: RegExpMatchArray,
							parsed = "",
							index = 0;
						while (match = <RegExpMatchArray>regex.exec(str)) {
							parsed += str.substr(index, <any>match.index - index);
							isMatch = true;
							if (rootName == match[1])
								parsed += arr[ndx]
							else
								if (rootName && match[1].startsWith(rootName + '.')) {
									parsed += getValue(match[1].substr(rootName.length + 1), arr[ndx])
								} else {
									parsed += getMappedValue(match[1]);
								}
							index = <any>match.index + match[0].length;
						}
						parsed += str.substr(index, str.length - index);
						return parsed;
					};
				for (let i = 0; i < attributes.length; i++) {
					let
						attr = attributes[i],
						attrName = attr.name,
						isIndex = attrName == 'd-for-ndx',
						removeUndefined = attrName.endsWith('?'),
						value;
					isMatch = false;
					isIndex
						? (attrName = attr.value, value = <any>ndx)
						: (value = parseContent(attr.value), removeUndefined && (attrName = attrName.substr(0, attrName.length - 1)));
					if (removeUndefined || isIndex) {
						node.removeAttribute(attr.name);
						if (value != "undefined")
							node.setAttribute(attrName, value);
					} else
						isMatch && (attr.value = value);
				}
				if (!node.children.length) {
					node.firstChild && (node.firstChild.nodeValue = parseContent(<any>node.firstChild.nodeValue));
				}
				else
					processChildren(node, rootName, arr, ndx);
			},
			processChild = (child: HTMLElement, rootName: string, arr: any[], ndx: number) => {
				let
					_for = child.getAttribute('d-for');
				if (_for) {
					if (rootName)
						throw 'nested @for not supported';
					child.removeAttribute('d-for');
					let
						match = <RegExpMatchArray>_for.match(/(\w*)\s+in\s+(\w*)/),
						array: any[] = match ? obj[match[2]] : void 0;
					if (!array)
						throw 'invalid %for template';
					array.forEach((item, ndx: number) => {
						let
							node = child.cloneNode(true);
						child.parentElement?.insertBefore(node, child);
						processNode(<HTMLElement>node, match[1], array, ndx);
					});
					child.parentElement?.removeChild(child);
					return array.length;
				} else {
					processNode(child, rootName, arr, ndx);
					return 1;
				}
			},
			processChildren = (parent: HTMLElement, rootName: string, arr: any[], ndx: number) => {
				for (let i = 0, child = parent.children[i]; i < parent.children.length; child = parent.children[i]) {
					i += processChild(<HTMLElement>child, rootName, arr, ndx);
				}
			};
		processChildren(xml.body, <any>void 0, <any>void 0, <any>void 0);
		return beautify ?
			XML.prettify(xml.body.firstChild)
			: xml.body.innerHTML;
	}
}
//https://gist.github.com/max-pub/a5c15b7831bbfaba7ad13acefc3d0781
const XML = {
	parse: (str: string, type: SupportedType = 'text/xml') => new DOMParser().parseFromString(str, type),  // like JSON.parse
	stringify: (DOM: Node) => new XMLSerializer().serializeToString(DOM),                         // like JSON.stringify

	transform: (xml: any, xsl: any) => {
		let proc = new XSLTProcessor();
		proc.importStylesheet(typeof xsl == 'string' ? XML.parse(xsl) : xsl);
		let output = proc.transformToFragment(typeof xml == 'string' ? XML.parse(xml) : xml, document);
		return typeof xml == 'string' ? XML.stringify(output) : output; // if source was string then stringify response, else return object
	},

	minify: (node: any) => XML.toString(node, false),
	prettify: (node: any) => XML.toString(node, true),
	toString: (node: any, pretty: boolean, level = 0, singleton = false): string => {
		if (typeof node == 'string')
			node = XML.parse(node);
		let
			tabs = pretty ? Array(level + 1).fill('').join('\t') : '',
			newLine = pretty ? '\n' : '';
		if (node.nodeType == 3) {
			let
				nodeContent = (singleton ? '' : tabs) + node.textContent.trim();
			return nodeContent.trim() ? nodeContent + (singleton ? '' : newLine) : "";
		}
		if (!node.tagName)
			return XML.toString(node.firstChild, pretty);
		let
			output = tabs + `<${node.tagName}`; // >\n
		for (let i = 0; i < node.attributes.length; i++)
			output += ` ${node.attributes[i].name}="${node.attributes[i].value}"`;
		if (node.childNodes.length == 0)
			return output + ' />' + newLine;
		else
			output += '>';
		let
			onlyOneTextChild = ((node.childNodes.length == 1) && (node.childNodes[0].nodeType == 3));
		if (!onlyOneTextChild)
			output += newLine;
		for (let i = 0; i < node.childNodes.length; i++)
			output += XML.toString(node.childNodes[i], pretty, level + 1, onlyOneTextChild);
		return output + (onlyOneTextChild ? '' : tabs) + `</${node.tagName}>` + newLine;
	}
}

export { Templates, XML }