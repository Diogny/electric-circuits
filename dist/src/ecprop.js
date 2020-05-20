"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var units_1 = require("./units");
var utils_1 = require("./utils");
var EcProp = /** @class */ (function () {
    function EcProp(ec, name, addTitle, onChange) {
        this.ec = ec;
        this.name = name;
        if (!(this.prop = ec.prop(name)))
            throw "invalid ec: " + ec.id + ", prop: " + name;
        //valueObject is when not an string, and
        //editable when it's a valueObject with editable property == true
        if (this.editable = (this.valueObject = typeof this.prop != "string") && (this.prop.editable == true)) {
            this.unit = new units_1.default(this.prop.value);
        }
        var htmlProp;
        //create html
        if (this.editable) {
            if (this.prop.combo) {
                //combo
                var options = [].map.call(this.prop.combo, function (element) {
                    return "<option value=\"" + element + "\">" + element + "</option>";
                }).join('');
                htmlProp = utils_1.html("<select class=\"ec-prop\">" + options + "</select>");
            }
            else {
                //input
                htmlProp = utils_1.html("<input class=\"ec-prop\" value=\"" + this.value + "\">");
            }
            //hook onchange event if editable
            var that_1 = this;
            onChange && (this.onChange = onChange, htmlProp.addEventListener('change', function () {
                //create new value
                if (that_1.editable) {
                    if (htmlProp.nodeName == "INPUT") {
                        that_1.prop = htmlProp.value;
                    }
                    else {
                        //SELECT
                        that_1.prop = htmlProp.selectedOptions[0].value;
                    }
                    //create unit
                    that_1.unit = new units_1.default(that_1.prop);
                }
                else {
                    //check for valueObject here
                    that_1.prop = htmlProp.innerText;
                }
                that_1.onChange.call(that_1, that_1.value);
            }));
        }
        else {
            //span
            htmlProp = utils_1.html("<span class=\"ec-prop\">" + this.value + "</span>");
        }
        //
        if (addTitle) {
            this.html = utils_1.html("<span><label class=\"ec-prop-title\">" + name + "</label></span>");
            this.html.appendChild(htmlProp);
        }
        else {
            this.html = htmlProp;
        }
    }
    Object.defineProperty(EcProp.prototype, "value", {
        get: function () {
            var _a;
            return this.valueObject ? (this.editable ? (_a = this.unit) === null || _a === void 0 ? void 0 : _a.toString() : this.prop.value) : this.prop;
        },
        enumerable: false,
        configurable: true
    });
    return EcProp;
}());
exports.default = EcProp;
/*
"properties" : {
        "capacitance" : {
            "editable" : true,
            "label" : true,
            "value" : "0.1mF"
        },
        "voltage": "50V",
        "tolerance": "2%",
        "description": "Generic capacitor",
        "voltage" : {
            "label" : true,
            "value" : "5V"
        },
        "current": "2500mA",
        "description" : "Generic LED diode",
        "notes": "color combo [green, blue, red, yellow, clear]. size combo [1.5mm, 3mm, 5mm]",
        "size" : {
            "editable" : true,
            "label" : true,
            "combo": [ "1.5", "3", "5" ],
            "value" : "3mm"
        }
},

*/ 
//# sourceMappingURL=ecprop.js.map