"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var units_1 = require("./units");
var utils_1 = require("./utils");
var dab_1 = require("./dab");
//...still in progress ...
var EcProp = /** @class */ (function () {
    function EcProp(ec, name, onChange, addLabel) {
        var _this = this;
        this.ec = ec;
        this.name = name;
        this.onChange = onChange;
        var prop = ec.prop(name);
        if (!prop)
            throw "invalid ec: " + ec.id + ", prop: " + name;
        //valueObject is when not an string, and
        //editable when it's a valueObject with readonly property == false
        if (this.editable = (this.valueObject = typeof prop == "object") && !prop.readonly) {
            //set Unit only if defined
            (prop.valueType == "unit")
                && (this.unit = new units_1.default(prop.value));
        }
        var htmlProp, propObj = (this.valueObject ? prop : void 0), that = this;
        //hack to capture inside variables, not exposed outside
        this.refresh = function () {
            //get value from component property
            that.propValue = propObj.value;
            //set it's UI value, so far only for INPUT, SPAN
            switch (htmlProp.nodeName) {
                case "INPUT":
                    htmlProp.value = that.propValue;
                    break;
                case "SPAN":
                    htmlProp.innerText = that.propValue;
                    break;
            }
        };
        //create html
        if (this.editable) {
            //prop is an object
            this.propValue = propObj.value;
            switch (propObj.type) {
                case "select":
                    var options = [].map.call(propObj.options, function (element) {
                        return "<option value=\"" + element + "\"" + (_this.propValue == element ? " selected" : "") + ">" + element + "</option>";
                    }).join('');
                    htmlProp = utils_1.html("<select class=\"prop\">" + options + "</select>");
                    break;
                default:
                    // "input", "point"
                    htmlProp = utils_1.html("<input class=\"prop\" value=\"" + this.value + "\">");
                    break;
            }
            //hook onchange event if editable
            this.onChange && htmlProp.addEventListener('change', function () {
                var _a;
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
                if (propObj.isProperty) {
                    //we need feed back that it was successfully set
                    //  only for INPUT for now
                    !propObj.setValue(that.propValue)
                        && that.refresh();
                }
                else
                    propObj.value = that.propValue;
                document.activeElement.blur();
                //call onchange event if any
                (_a = that.onChange) === null || _a === void 0 ? void 0 : _a.call(that, that.value);
            });
        }
        else {
            this.propValue = propObj ? propObj.value : prop;
            var classArr = ["prop"];
            (this.valueObject && propObj.readonly) && classArr.push("readonly");
            (this.valueObject && propObj.class) && classArr.push(propObj.class);
            htmlProp = utils_1.html("<span class=\"" + classArr.join(' ') + "\">" + this.propValue + "</span>");
        }
        //create property container
        this.html = document.createElement("div");
        this.html.classList.add("ec-container");
        if (addLabel) {
            var label = (propObj && propObj.label) ? propObj.label : name;
            this.html.appendChild(utils_1.html("<span class=\"label\">" + label + "</span>"));
        }
        if (propObj && propObj.type == "rotation") {
            var div = document.createElement("div");
            div.classList.add("rot");
            div.appendChild(utils_1.html("<img src=\"img/rot-left-16x16-p2.png\" rot-angle=\"-45\" title=\"Rotate left\"/>"));
            div.appendChild(htmlProp);
            div.appendChild(utils_1.html("<img src=\"img/rot-right-16x16-p2.png\" rot-angle=\"45\" title=\"Rotate right\"/>"));
            this.html.appendChild(div);
            //register click events
            div.querySelectorAll(".rot>img").forEach((function (elem) {
                dab_1.aEL(elem, "click", function (e) {
                    console.log(e.target.getAttribute("rot-angle"));
                }, false);
            }));
        }
        else
            this.html.appendChild(htmlProp);
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
    EcProp.prototype.refresh = function () { }; //placeholder
    return EcProp;
}());
exports.default = EcProp;
//# sourceMappingURL=ecprop.js.map