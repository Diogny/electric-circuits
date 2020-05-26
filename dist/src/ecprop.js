"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var units_1 = require("./units");
var utils_1 = require("./utils");
//...still in progress ...
var EcProp = /** @class */ (function () {
    function EcProp(ec, name, addTitle, onChange) {
        var _this = this;
        this.ec = ec;
        this.name = name;
        var prop = ec.prop(name);
        if (!prop)
            throw "invalid ec: " + ec.id + ", prop: " + name;
        //valueObject is when not an string, and
        //editable when it's a valueObject with readonly property == false
        if (this.editable = (this.valueObject = typeof prop != "string") && !prop.readonly) {
            //set Unit only if defined
            (prop.type == "unit")
                && (this.unit = new units_1.default(prop.value));
        }
        var htmlProp;
        //create html
        if (this.editable) {
            this.propValue = prop.value;
            if (prop.combo) {
                var options = [].map.call(prop.combo, function (element) {
                    return "<option value=\"" + element + "\"" + (_this.propValue == element ? " selected" : "") + ">" + element + "</option>";
                }).join('');
                htmlProp = utils_1.html("<select class=\"ec-prop\">" + options + "</select>");
            }
            else {
                htmlProp = utils_1.html("<input class=\"ec-prop\" value=\"" + this.value + "\">");
            }
            //hook onchange event if editable
            var that_1 = this;
            onChange && (this.onChange = onChange, htmlProp.addEventListener('change', function () {
                //save new value
                if (htmlProp.nodeName == "INPUT") {
                    that_1.propValue = htmlProp.value;
                }
                else {
                    that_1.propValue = htmlProp.selectedOptions[0].value;
                }
                //create unit if defined
                that_1.unit && (that_1.unit = new units_1.default(that_1.propValue));
                prop.value = that_1.propValue;
                that_1.onChange.call(that_1, that_1.value);
            }));
        }
        else {
            this.propValue = this.valueObject ? prop.value : prop;
            htmlProp = utils_1.html("<span class=\"ec-prop\">" + this.propValue + "</span>");
        }
        if (addTitle) {
            //wrap title
            this.html = utils_1.html("<span><label class=\"ec-prop-title\">" + name + "</label></span>");
            this.html.appendChild(htmlProp);
        }
        else {
            this.html = htmlProp;
        }
    }
    Object.defineProperty(EcProp.prototype, "value", {
        get: function () {
            return this.unit ?
                this.unit.toString() :
                this.propValue;
        },
        enumerable: false,
        configurable: true
    });
    return EcProp;
}());
exports.default = EcProp;
//# sourceMappingURL=ecprop.js.map