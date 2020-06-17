"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var base_window_1 = require("./base-window");
var dab_1 = require("./dab");
var FormWindow = /** @class */ (function (_super) {
    tslib_1.__extends(FormWindow, _super);
    function FormWindow(options) {
        var _this = _super.call(this, options) || this;
        _this.titleHTML = _this.win.querySelector("div>h4");
        _this.formHTML = _this.win.querySelector("div>form>fieldset");
        _this.contentHTML = _this.win.querySelector("div>div>div");
        return _this;
    }
    FormWindow.prototype.showDialog = function (title, formItems) {
        var self = this;
        return new Promise(function (resolve, reject) {
            var cancelIndex = -1, cleanUp = function () {
                document.removeEventListener("keydown", keyHandler, false);
                dab_1.rEL(self.contentHTML, "click", clickHandler, false);
                self.setVisible(false);
                dab_1.addClass(self.win, "hide");
            }, clickHandler = function (e) {
                var choice = parseInt(e.target.getAttribute("dialog-option"));
                if (isNaN(choice))
                    return;
                if (choice == 0) {
                    if ((Array.from(self.formHTML.querySelectorAll("div>input"))
                        .filter(function (item, index) {
                        if (!(formItems[index].value = item.value) && formItems[index].required) {
                            dab_1.removeClass(item.nextElementSibling, "hide");
                            return true;
                        }
                        else
                            dab_1.addClass(item.nextElementSibling, "hide");
                    })).length) {
                        return;
                    }
                }
                cleanUp();
                resolve(choice);
            }, keyHandler = function (ev) {
                if (ev.code == 'Escape') {
                    cleanUp();
                    resolve(cancelIndex);
                }
            };
            self.titleHTML.innerText = title;
            //form
            self.formHTML.innerHTML = formItems.map(function (item, index) {
                var label = "<label for=\"dialog-form-" + index + "\">" + item.label + "</label>", placeHolder = item.placeHolder ? " placeholder=\"" + item.placeHolder + "\"" : "", input = "<input type=\"text\" id=\"dialog-form-" + index + "\"" + placeHolder + " />", required = "<span class=\"hide\"> *</span>";
                return '<div class="pure-control-group">' + label + input + required + '</div>';
            })
                .join('');
            self.contentHTML.innerHTML =
                ["Save", "Cancel"].map(function (text, index) {
                    if (text.toUpperCase() == "CANCEL")
                        cancelIndex = index;
                    return "<button dialog-option=\"" + index + "\">" + text + "</button>";
                })
                    .join('');
            document.addEventListener("keydown", keyHandler, false);
            dab_1.aEL(self.contentHTML, "click", clickHandler, false);
            self.setVisible(true);
            dab_1.removeClass(self.win, "hide");
        });
    };
    FormWindow.prototype.propertyDefaults = function () {
        return dab_1.extend(_super.prototype.propertyDefaults.call(this), {
            class: "win dialog form no-select hide",
            templateName: "formWin01",
        });
    };
    return FormWindow;
}(base_window_1.default));
exports.default = FormWindow;
//# sourceMappingURL=form-window.js.map