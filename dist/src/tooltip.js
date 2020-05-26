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
var label_1 = require("./label");
var Tooltip = /** @class */ (function (_super) {
    __extends(Tooltip, _super);
    function Tooltip(options) {
        var _this = _super.call(this, options) || this;
        _this.svgRect = utils_1.tag("rect", "", {
            x: 0,
            y: 0,
            rx: _this.borderRadius
        });
        _this.g.insertBefore(_this.svgRect, _this.t);
        return _this;
    }
    Object.defineProperty(Tooltip.prototype, "type", {
        get: function () { return types_1.Type.TOOLTIP; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Tooltip.prototype, "borderRadius", {
        get: function () { return this.settings.borderRadius; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Tooltip.prototype, "size", {
        /*	DOESN'T WORK
        set visible(value: boolean) {
            //weird way to access an ancestor property  super.visible doesn't work
            super["visible"] = value;
        }
        */
        get: function () {
            var b = this.t.getBBox();
            return dab_1.obj({
                width: Math.round(b.width) + 10,
                height: Math.round(b.height) + this.gap
            });
        },
        enumerable: false,
        configurable: true
    });
    Tooltip.prototype.setVisible = function (value) {
        _super.prototype.setVisible.call(this, value);
        //clear values
        //because Firefox give DOM not loaded on g.getBox() because it's not visible yet
        // so I've to display tooltip in DOM and then continue setting text, move, font-size,...
        this.text = this.t.innerHTML = '';
        return this;
    };
    Tooltip.prototype.setBorderRadius = function (value) {
        this.settings.borderRadius = value | 0;
        return this.build();
    };
    Tooltip.prototype.build = function () {
        this.gap = Math.round(this.fontSize / 2) + 1;
        dab_1.attr(this.t, {
            "font-size": this.fontSize,
            x: Math.round(this.gap / 2),
            y: this.fontSize //+ 8
        });
        var s = this.size;
        dab_1.attr(this.svgRect, {
            width: s.width,
            height: s.height,
            rx: this.borderRadius
        });
        return this;
    };
    Tooltip.prototype.setText = function (value) {
        var arr = dab_1.isStr(value) ?
            value.split(/\r?\n/) :
            value, txtArray = [];
        this.t.innerHTML = arr.map(function (value, ndx) {
            var txt = '', attrs = '';
            if (dab_1.isStr(value)) {
                txt = value;
            }
            else if (dab_1.pojo(value)) {
                txt = value.text;
                attrs = utils_1.map(utils_1.filter(value, function (val, key) { return key != 'text'; }), function (v, k) { return k + "=\"" + v + "\""; }).join('');
            }
            txtArray.push(txt);
            return "<tspan x=\"5\" dy=\"" + ndx + ".1em\"" + attrs + ">" + txt + "</tspan>";
        }).join('');
        //set text
        this.text = txtArray.join('\r\n');
        return this.build();
    };
    Tooltip.prototype.propertyDefaults = function () {
        return dab_1.extend(_super.prototype.propertyDefaults.call(this), {
            name: "tooltip",
            class: "tooltip",
            borderRadius: 4
        });
    };
    return Tooltip;
}(label_1.Label));
exports.default = Tooltip;
//tooltip.move(200,50).setText("One line").visible = true;
//tooltip.move(200,50).setText("One line\r\nTwo lines and").visible = true;
//tooltip.move(200,50).setText([{ text : "One line" }, { text: "Two line and more..." } ]).visible = true;
//tooltip.move(200,50).setText([{ text : "One line" }, { text: "Two line and more...", fill: "blue"  } ]).visible = true;
//# sourceMappingURL=tooltip.js.map