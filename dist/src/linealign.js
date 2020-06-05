"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var point_1 = require("./point");
var utils_1 = require("./utils");
var dab_1 = require("./dab");
var LinesAligner = /** @class */ (function () {
    function LinesAligner(app) {
        this.app = app;
        var create = function (id) { return utils_1.tag("line", id, {
            class: "dash hide",
            x1: 0, y1: 0, x2: 0, y2: 0,
            "stroke-dasharray": "3, 3"
        }); };
        this.line0 = create("line0");
        this.line1 = create("line1");
    }
    LinesAligner.prototype.hide = function () {
        dab_1.addClass(this.line0, "hide");
        dab_1.addClass(this.line1, "hide");
    };
    LinesAligner.prototype.calculate = function (line, nodePoint, otherNodePoint) {
        if (!otherNodePoint)
            return 0;
        var ofs = point_1.default.minus(otherNodePoint, nodePoint);
        if (Math.abs(ofs.x) < 3) {
            dab_1.attr(line, {
                x1: nodePoint.x = otherNodePoint.x,
                y1: 0,
                x2: nodePoint.x,
                y2: this.app.viewBox.height
            });
            return 1; //vertical
        }
        else if (Math.abs(ofs.y) < 3) {
            dab_1.attr(line, {
                x1: 0,
                y1: nodePoint.y = otherNodePoint.y,
                x2: this.app.viewBox.width,
                y2: nodePoint.y
            });
            return -1; //horizontal
        }
        return 0;
    };
    LinesAligner.prototype.matchWireLine = function (wire, line) {
        this.hide();
        this.p = point_1.default.create(wire.getNode(this.node = line)); //line is 1-based
        if (this.calculate(this.line0, this.p, wire.getNode(line + 1)) ||
            (this.p = point_1.default.create(wire.getNode(this.node = --line)),
                this.calculate(this.line0, this.p, wire.getNode(--line)))) {
            this.wire = wire;
            dab_1.removeClass(this.line0, "hide");
            return this.match = true;
        }
        return false;
    };
    LinesAligner.prototype.matchWireNode = function (wire, node) {
        this.hide();
        this.p = point_1.default.create(wire.getNode(node));
        var before = this.calculate(this.line0, this.p, wire.getNode(node - 1)), after = this.calculate(this.line1, this.p, wire.getNode(node + 1));
        if (before | after) {
            this.wire = wire;
            this.node = node;
            before && dab_1.removeClass(this.line0, "hide");
            after && dab_1.removeClass(this.line1, "hide");
            return this.match = true;
        }
        return this.match = false;
    };
    return LinesAligner;
}());
exports.default = LinesAligner;
//# sourceMappingURL=linealign.js.map