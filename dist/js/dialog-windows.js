"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FormWindow = exports.DialogWindow = void 0;
var tslib_1 = require("tslib");
var dab_1 = require("./dab");
var dialog_base_1 = require("./dialog-base");
var DialogWindow = /** @class */ (function (_super) {
    tslib_1.__extends(DialogWindow, _super);
    function DialogWindow(options) {
        var _this = _super.call(this, options) || this;
        _this.contentHTML = _this.win.querySelector("div>h5");
        return _this;
    }
    DialogWindow.prototype.showDialog = function (title, message, buttons) {
        return this.promise(title, function () {
            this.contentHTML.innerText = message;
        }, buttons);
    };
    DialogWindow.prototype.showMessage = function (title, message) {
        return this.showDialog(title, message, ["OK"])
            .then(function (choice) {
            return Promise.resolve();
        })
            .catch(function (reason) {
            return Promise.resolve();
        });
    };
    DialogWindow.prototype.propertyDefaults = function () {
        return dab_1.extend(_super.prototype.propertyDefaults.call(this), {
            class: "win dialog box no-select hide",
            templateName: "dialogWin01",
        });
    };
    return DialogWindow;
}(dialog_base_1.default));
exports.DialogWindow = DialogWindow;
var FormWindow = /** @class */ (function (_super) {
    tslib_1.__extends(FormWindow, _super);
    function FormWindow(options) {
        var _this = _super.call(this, options) || this;
        _this.contentHTML = _this.win.querySelector("div>form>fieldset");
        return _this;
    }
    FormWindow.prototype.showDialog = function (title, formItems) {
        return this.promise(title, function () {
            var _this = this;
            this.contentHTML.innerHTML = formItems.map(function (item, index) {
                var o = dab_1.clone(item);
                !o.placeHolder && (o.placeHolder = o.label);
                o.index = index;
                o.class = item.visible ? "" : "hide";
                return dab_1.nano(_this.app.templates[item.readonly ? "formFieldWinSpan" : "formFieldWinInput"], o);
            })
                .join('');
        }, ["Save", "Cancel"], function (choice) {
            var isRequired = function (s, ndx) { return (dab_1.empty(s) && formItems[ndx].required); };
            if (choice == 0
                && (Array.from(this.contentHTML.querySelectorAll("div>input"))
                    .filter(function (elem) {
                    var index = parseInt(elem.getAttribute("index")), item = formItems[index];
                    if (item
                        && !item.readonly
                        && isRequired(item.value = elem.value, index)) {
                        elem.nextElementSibling.innerText = "required";
                        dab_1.removeClass(elem.nextElementSibling, "hide");
                        return true;
                    }
                    elem.nextElementSibling.innerText = "*";
                    dab_1.addClass(elem.nextElementSibling, "hide");
                })).length)
                return false;
            return true;
        });
    };
    FormWindow.prototype.propertyDefaults = function () {
        return dab_1.extend(_super.prototype.propertyDefaults.call(this), {
            class: "win dialog form no-select hide",
            templateName: "formWin01",
        });
    };
    return FormWindow;
}(dialog_base_1.default));
exports.FormWindow = FormWindow;
//# sourceMappingURL=dialog-windows.js.map