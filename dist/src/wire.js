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
//wire.ts
var dab_1 = require("./dab");
var utils_1 = require("./utils");
var types_1 = require("./types");
var colors_1 = require("./colors");
var itemsBoard_1 = require("./itemsBoard");
var components_1 = require("./components");
var point_1 = require("./point");
var Wire = /** @class */ (function (_super) {
    __extends(Wire, _super);
    function Wire(options) {
        var _this = this;
        //set defaults
        options.name = "wire";
        options.class = "wire";
        options.highlightNodeName = "node";
        options.color = colors_1.Color.getcolor(options.color, colors_1.Colors.black); //set default wire color to black if not defined
        _this = _super.call(this, options) || this;
        //
        _this.settings.pad = 10; //radius of the highlight circle
        _this.settings.polyline = utils_1.tag("polyline", "", {
            "svg-type": "line",
            line: "0",
            points: "",
        });
        _this.g.insertBefore(_this.settings.polyline, _this.highlight.g);
        //hack sot editMode property is not called
        _this.settings.edit = false;
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
        //
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
    return Wire;
}(itemsBoard_1.default));
exports.default = Wire;
//# sourceMappingURL=wire.js.map