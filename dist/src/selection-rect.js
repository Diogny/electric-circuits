"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SelectionRect = void 0;
var point_1 = require("./point");
var rect_1 = require("./rect");
var utils_1 = require("./utils");
var dab_1 = require("./dab");
var SelectionRect = /** @class */ (function () {
    function SelectionRect(app) {
        this.app = app;
        this.g = utils_1.tag("rect", "selection-rect", {
            class: "dash",
            x: 0, y: 0, width: 0, height: 0,
            "stroke-dasharray": "3, 3"
        });
        this.hide();
    }
    SelectionRect.prototype.show = function (start) {
        this.start = start;
        this.rect = new rect_1.default(start.x, start.y, 0, 0);
        return this.g.classList.remove("hide"), this;
    };
    SelectionRect.prototype.hide = function () {
        this.start = new point_1.default(0, 0);
        this.rect = new rect_1.default(0, 0, 0, 0);
        return this.g.classList.add("hide"), this.refresh();
    };
    SelectionRect.prototype.refresh = function () {
        dab_1.attr(this.g, {
            x: this.rect.x,
            y: this.rect.y,
            width: this.rect.width,
            height: this.rect.height
        });
        return this;
    };
    SelectionRect.prototype.calculate = function (p) {
        var startX = Math.min(this.start.x, p.x), startY = Math.min(this.start.y, p.y), endX = Math.max(this.start.x, p.x), endY = Math.max(this.start.y, p.y);
        this.rect.x = startX;
        this.rect.y = startY;
        this.rect.width = endX - startX;
        this.rect.height = endY - startY;
        return this.refresh();
    };
    return SelectionRect;
}());
exports.SelectionRect = SelectionRect;
//# sourceMappingURL=selection-rect.js.map