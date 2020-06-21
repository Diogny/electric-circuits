"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Application = void 0;
var props_1 = require("./props");
var dab_1 = require("./dab");
var Application = /** @class */ (function () {
    function Application(options) {
        var _this = this;
        this.settings = dab_1.extend({}, options);
        this.settings.props = new Map();
        !this.settings.templates && (this.settings.templates = {});
        Object.keys(options.props).forEach(function (key) {
            if (_this.add(options.props[key], key)) {
                options.includePropsInThis
                    && dab_1.dP(_this, key, { get: function () { return _this.prop(key); } });
            }
        });
    }
    Object.defineProperty(Application.prototype, "templates", {
        get: function () { return this.settings.templates; },
        set: function (value) {
            this.settings.templates = value;
        },
        enumerable: false,
        configurable: true
    });
    Application.prototype.has = function (key) { return this.settings.props.has(key); };
    Application.prototype.add = function (propOptions, key) {
        var p = new props_1.default(propOptions);
        !key && (key = p.id);
        if (this.has(key))
            return false;
        this.settings.props.set(key, p);
        return true;
    };
    Application.prototype.prop = function (id) {
        return this.settings.props.get(id);
    };
    return Application;
}());
exports.Application = Application;
//# sourceMappingURL=app.js.map