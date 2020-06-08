"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var dab_1 = require("./dab");
var utils_1 = require("./utils");
var types_1 = require("./types");
var itemsBoard_1 = require("./itemsBoard");
var components_1 = require("./components");
var point_1 = require("./point");
var rect_1 = require("./rect");
var Wire = /** @class */ (function (_super) {
    __extends(Wire, _super);
    function Wire(options) {
        var _this = _super.call(this, options) || this;
        _this.settings.polyline = utils_1.tag("polyline", "", {
            "svg-type": "line",
            line: "0",
            points: "",
        });
        _this.g.append(_this.settings.polyline);
        //set new points in polyline
        _this.setPoints(options.points);
        //bond wire ends if any
        if (options.start) {
            //...
        }
        if (options.end) {
            //...
        }
        //place it
        _this.move(_this.settings.points[0].x, _this.settings.points[0].y);
        //signal component creation
        _this.onProp && _this.onProp({
            id: "#" + _this.id,
            args: {
                id: _this.id,
                name: _this.name,
                x: _this.x,
                y: _this.y,
                color: _this.color,
                points: _this.settings.points,
                bonds: '[' + _this.bonds.map(function (b) { return b.link; }).join(', ') + ']'
            },
            method: 'create',
            where: 1 //signals it was a change inside the object
        });
        components_1.default.save(_this);
        return _this;
    }
    Object.defineProperty(Wire.prototype, "type", {
        get: function () { return types_1.Type.WIRE; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Wire.prototype, "count", {
        get: function () { return this.settings.points.length; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Wire.prototype, "last", {
        get: function () { return this.settings.points.length - 1; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Wire.prototype, "lastLine", {
        get: function () { return this.editMode ? this.settings.lines.length : 0; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Wire.prototype, "isOpen", {
        get: function () { return !this.nodeBonds(0) || !this.nodeBonds(this.last); },
        enumerable: false,
        configurable: true
    });
    Wire.prototype.rect = function () { return rect_1.default.create(this.box); };
    Object.defineProperty(Wire.prototype, "editMode", {
        //edit-mode
        get: function () { return this.settings.edit; },
        set: function (value) {
            var _this = this;
            if (this.editMode == value) //avoid duplicated
                return;
            //if editMode == true
            if (this.editMode) {
                //	will change to false
                //		.destroy lines
                this.settings.lines = this.settings.lines.filter(function (ln) {
                    _this.g.removeChild(ln);
                    return false;
                });
                //		.recreate polyline
                this.refresh();
                //		.show polyline
                dab_1.removeClass(this.settings.polyline, "hide");
            }
            else {
                //if editMode == false
                //	will change to true
                //		.hide polyline
                dab_1.addClass(this.settings.polyline, "hide");
                //		.create lines
                for (var i = 0, a = this.settings.points[0], cnt = this.last; i < cnt; i++) {
                    var b = this.settings.points[i + 1], ln = utils_1.tag("line", "", {
                        "svg-type": "line",
                        line: (i + 1),
                        x1: a.x,
                        y1: a.y,
                        x2: b.x,
                        y2: b.y
                    });
                    this.settings.lines.push(ln);
                    this.g.insertBefore(ln, this.settings.polyline);
                    a = b;
                }
            }
            this.settings.edit = value;
        },
        enumerable: false,
        configurable: true
    });
    Wire.prototype.refresh = function () {
        //set new points
        dab_1.attr(this.settings.polyline, {
            points: this.settings.points.map(function (p) { return p.x + ", " + p.y; }).join(' ')
        });
        return this;
    };
    Wire.prototype.nodeRefresh = function (node) {
        if (this.editMode) {
            //update lines  only if in edit mode
            var ln = void 0, p = this.settings.points[node];
            (ln = this.settings.lines[node - 1]) && dab_1.attr(ln, { x2: p.x, y2: p.y }); //line where i(p) is second point
            (ln = this.settings.lines[node]) && dab_1.attr(ln, { x1: p.x, y1: p.y }); //line where i(p) is first point
        }
        else {
            //full refresh because polyline
            this.refresh();
        }
        if (!(node == 0 || node == this.last)) {
            var bond = this.nodeBonds(node), p_1 = this.settings.points[node];
            bond && bond.to.forEach(function (b) {
                var _a;
                (_a = components_1.default.item(b.id)) === null || _a === void 0 ? void 0 : _a.setNode(b.ndx, p_1);
            });
        }
        return this;
    };
    /**
     * @description returns true if a point is valid
     * @comment later see how to change this to validNode, conflict in !ic.valid(node)
     * 		because we don't know if it's a IC or a wire
     * @param {number} node 0-based point index	it can be -1
     * @returns {boolean} true if point is valid
     */
    Wire.prototype.valid = function (node) {
        //(i) => ((i = i | 0) >= 0 && i < points.length);
        //return (node = <any>node | 0) >= -1 && node < this.points.length;	// NOW ACCEPTS  -1
        //	-1  0  ... last  	   -> true
        //	"-1"  "0"  ... "last"  -> true
        //	""  "  "  "1."  "1a"   -> false
        return node >= -1 //String(Number(node)) == node
            && node <= this.last; // NOW ACCEPTS  -1
    };
    Wire.prototype.getNode = function (node) {
        var p = this.settings.points[node];
        p && (p = p.clone());
        return p;
    };
    Wire.prototype.appendNode = function (p) {
        return !this.editMode && (this.settings.points.push(p), this.refresh(), true);
    };
    Wire.prototype.setNode = function (node, p) {
        //because no transformation, p is the same, just save it
        this.settings.points[node].x = p.x | 0; // remove decimals "trunc"
        this.settings.points[node].y = p.y | 0;
        //this.updateTransformPoint(node, p, false);
        return this.nodeRefresh(node);
    };
    Wire.prototype.nodeHighlightable = function (node) {
        //any Wire node and that it is not a start|end bonded node
        return this.valid(node) //&& this.editMode
            && (!(this.nodeBonds(node) && (node == 0 || node == this.last)));
    };
    Wire.prototype.setPoints = function (points) {
        if (!dab_1.isArr(points)
            || points.length < 2)
            throw 'Poliwire min 2 points';
        //can only be called when editMode == false
        if (!this.editMode) {
            this.settings.points = points.map(function (p) { return new point_1.default(p.x | 0, p.y | 0); });
            //clean lines and set polyline new points
            this.settings.lines = [];
            this.refresh();
        }
        return this;
    };
    Wire.prototype.overNode = function (p, ln) {
        var _this = this;
        var endPoint = ln, lineCount = this.settings.lines.length, isLine = function (ln) { return ln && (ln <= lineCount); }, isAround = function (p, x, y) {
            return (x >= p.x - _this.settings.pad) &&
                (x <= p.x + _this.settings.pad) &&
                (y >= p.y - _this.settings.pad) &&
                (y <= p.y + _this.settings.pad);
        };
        //if not in editMode, then ln will be 0, so reset to 1, and last point is the last
        !this.editMode && (ln = 1, endPoint = this.last, lineCount = 1);
        if (isLine(ln)) {
            return isAround(this.settings.points[ln - 1], p.x, p.y) ?
                ln - 1 :
                (isAround(this.settings.points[endPoint], p.x, p.y) ? endPoint : -1);
        }
        return -1;
    };
    Wire.prototype.findLineNode = function (p, line) {
        var fn = function (np) { return (Math.pow(p.x - np.x, 2) + Math.pow(p.y - np.y, 2)) <= 25; };
        ((line <= 0 || line >= this.last) && (line = this.findNode(p), 1))
            || fn(this.settings.points[line])
            || fn(this.settings.points[--line])
            || (line = -1);
        return line;
    };
    //don't care if wire is in editMode or not
    Wire.prototype.findNode = function (p) {
        for (var i = 0, thisP = this.settings.points[i], len = this.settings.points.length; i < len; thisP = this.settings.points[++i]) {
            //radius 5 =>  5^2 = 25
            if ((Math.pow(p.x - thisP.x, 2) + Math.pow(p.y - thisP.y, 2)) <= 25)
                return i;
        }
        return -1;
    };
    Wire.prototype.deleteLine = function (line) {
        //cannot delete fir or last line
        if (line <= 1 || line >= this.last)
            return false;
        var savedEditMode = this.editMode;
        this.editMode = false;
        deleteWireNode.call(this, line);
        deleteWireNode.call(this, line - 1);
        this.editMode = savedEditMode;
        return true;
    };
    Wire.prototype.deleteNode = function (node) {
        var savedEditMode = this.editMode, p;
        this.editMode = false;
        p = deleteWireNode.call(this, node);
        this.editMode = savedEditMode;
        return p;
    };
    Wire.prototype.insertNode = function (node, p) {
        //cannot insert node in first or after last position
        if (node <= 0 || node > this.last || isNaN(node))
            return false;
        var savedEditMode = this.editMode;
        this.editMode = false;
        //fix all bonds link indexes from last to this node
        for (var n = this.last; n >= node; n--) {
            fixBondIndexes.call(this, n, n + 1);
        }
        this.settings.points.splice(node, 0, p);
        this.editMode = savedEditMode;
        return true;
    };
    /**
     * @description standarizes a wire node number to 0..points.length
     * @param {number} node 0-based can be -1:last 0..points.length-1
     * @returns {number} -1 for wrong node or standarized node number, where -1 == last, otherwise node
     */
    Wire.prototype.standarizeNode = function (node) {
        if (this.valid(node))
            return node == -1 ? this.last : node;
        return -1;
    };
    Wire.prototype.windowProperties = function () { return ["id", "bonds"]; };
    Wire.prototype.prop = function (propName) {
        //a wire discards position property this.p
        if (propName == "p")
            return void 0;
        return _super.prototype.prop.call(this, propName);
    };
    Wire.prototype.propertyDefaults = function () {
        return dab_1.extend(_super.prototype.propertyDefaults.call(this), {
            name: "wire",
            class: "wire",
            highlightNodeName: "node",
            pad: 5,
            color: "black",
            edit: false // initial is false
        });
    };
    return Wire;
}(itemsBoard_1.ItemBoard));
exports.default = Wire;
function deleteWireNode(node) {
    var last = this.last;
    //first or last node cannot be deleted, only middle nodes
    if (node <= 0 || node >= last || isNaN(node))
        return;
    this.unbondNode(node);
    fixBondIndexes.call(this, last, last - 1);
    return this.settings.points.splice(node, 1)[0];
}
function fixBondIndexes(node, newIndex) {
    var _this = this;
    var lastBond = this.nodeBonds(node);
    if (!lastBond)
        return false;
    //fix this from index
    lastBond.from.ndx = newIndex;
    //because it's a wire last node, it has only one destination, so fix all incoming indexes
    lastBond.to.forEach(function (bond) {
        var compTo = components_1.default.item(bond.id), compToBonds = compTo === null || compTo === void 0 ? void 0 : compTo.nodeBonds(bond.ndx);
        compToBonds === null || compToBonds === void 0 ? void 0 : compToBonds.to.filter(function (b) { return b.id == _this.id; }).forEach(function (b) {
            b.ndx = newIndex;
        });
    });
    //move last bond entry
    delete this.settings.bonds[node];
    this.settings.bonds[newIndex] = lastBond;
    return true;
}
//# sourceMappingURL=wire.js.map