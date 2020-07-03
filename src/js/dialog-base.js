"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var base_window_1 = require("./base-window");
var dab_1 = require("./dab");
var DialogBase = /** @class */ (function (_super) {
    tslib_1.__extends(DialogBase, _super);
    function DialogBase(options) {
        var _this = _super.call(this, options) || this;
        _this.titleHTML = _this.win.querySelector("div>h4");
        _this.buttonsHTML = _this.win.querySelector("div>div>div");
        return _this;
    }
    DialogBase.prototype.promise = function (title, setContent, buttons, validator) {
        var self = this;
        return new Promise(function (resolve, reject) {
            var cancelIndex = -1, cleanUp = function () {
                document.removeEventListener("keydown", keyHandler, false);
                dab_1.rEL(self.buttonsHTML, "click", clickHandler, false);
                self.setVisible(false);
                dab_1.addClass(self.win, "hide");
            }, clickHandler = function (e) {
                var choice = parseInt(e.target.getAttribute("dialog-option"));
                if (isNaN(choice)
                    || (validator && !validator.call(self, choice)))
                    return;
                cleanUp();
                resolve(choice);
            }, keyHandler = function (ev) {
                if (ev.code == 'Escape') {
                    cleanUp();
                    resolve(cancelIndex);
                }
            };
            self.titleHTML.innerText = title;
            setContent.call(self);
            self.buttonsHTML.innerHTML =
                buttons.map(function (text, index) {
                    if (text.toUpperCase() == "CANCEL")
                        cancelIndex = index;
                    return "<button dialog-option=\"" + index + "\">" + text + "</button>";
                })
                    .join('');
            document.addEventListener("keydown", keyHandler, false);
            dab_1.aEL(self.buttonsHTML, "click", clickHandler, false);
            self.setVisible(true);
            dab_1.removeClass(self.win, "hide");
        });
    };
    return DialogBase;
}(base_window_1.default));
exports.default = DialogBase;
//# sourceMappingURL=dialog-base.js.map