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
        var htmlProp, that = this;
        //hack to capture inside variables, not exposed outside
        this.refresh = function () {
            //get value from component property
            that.propValue = prop.value;
            //set it's UI value, so far only for INPUT
            (htmlProp.nodeName == "INPUT") && (htmlProp.value = that.propValue);
        };
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
            onChange && (this.onChange = onChange, htmlProp.addEventListener('change', function () {
                //save new value
                if (htmlProp.nodeName == "INPUT") {
                    that.propValue = htmlProp.value;
                }
                else {
                    that.propValue = htmlProp.selectedOptions[0].value;
                }
                //create unit if defined
                that.unit && (that.unit = new units_1.default(that.propValue));
                //set new value
                if (prop.type == "property") {
                    //we need feed back that it was successfully set
                    //  only for INPUT for now
                    !prop.setValue(that.propValue)
                        && that.refresh();
                }
                else
                    prop.value = that.propValue;
                document.activeElement.blur();
                //call onchange event if any
                that.onChange.call(that, that.value);
            }));
        }
        else {
            this.propValue = this.valueObject ? prop.value : prop;
            htmlProp = utils_1.html("<span class=\"ec-prop\">" + this.propValue + "</span>");
        }
        if (addTitle) {
            //wrap title
            this.html = utils_1.html("<span><label class=\"ec-prop-title\">" + (prop.title || name) + "</label></span>");
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
    EcProp.prototype.refresh = function () { };
    return EcProp;
}());
exports.default = EcProp;
//# sourceMappingURL=ecprop.js.map