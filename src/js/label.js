"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Label = void 0;
var tslib_1 = require("tslib");
var itemsBase_1 = require("./itemsBase");
var types_1 = require("./types");
var dab_1 = require("./dab");
var utils_1 = require("./utils");
var Label = /** @class */ (function (_super) {
    tslib_1.__extends(Label, _super);
    function Label(options) {
        var _this = this;
        options.visible = false;
        _this = _super.call(this, options) || this;
        _this.text = '';
        _this.t = utils_1.tag("text", "", {});
        dab_1.aCld(_this.g, _this.t);
        return _this;
    }
    Object.defineProperty(Label.prototype, "type", {
        get: function () { return types_1.Type.LABEL; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Label.prototype, "size", {
        get: function () {
            var b = this.t.getBBox();
            return dab_1.obj({
                width: Math.round(b.width),
                height: Math.round(b.height)
            });
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Label.prototype, "fontSize", {
        get: function () { return this.settings.fontSize; },
        enumerable: false,
        configurable: true
    });
    Label.prototype.move = function (x, y) {
        _super.prototype.move.call(this, x, y);
        dab_1.attr(this.g, { transform: "translate(" + this.x + " " + this.y + ")" });
        return this;
    };
    Label.prototype.setFontSize = function (value) {
        this.settings.fontSize = value;
        return this.build();
    };
    Label.prototype.build = function () {
        dab_1.attr(this.t, {
            "font-size": this.fontSize,
            x: 0,
            y: 0
        });
        return this;
    };
    Label.prototype.setText = function (value) {
        this.t.innerHTML = this.text = value;
        return this.build();
    };
    Label.prototype.propertyDefaults = function () {
        return dab_1.extend(_super.prototype.propertyDefaults.call(this), {
            name: "label",
            class: "label",
            fontSize: 50
        });
    };
    return Label;
}(itemsBase_1.default));
exports.Label = Label;
//# sourceMappingURL=label.js.map