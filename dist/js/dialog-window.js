"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var dab_1 = require("./dab");
var base_window_1 = require("./base-window");
var DialogWindow = /** @class */ (function (_super) {
    tslib_1.__extends(DialogWindow, _super);
    function DialogWindow(options) {
        var _this = _super.call(this, options) || this;
        _this.titleHTML = _this.win.querySelector("div>h4");
        _this.messageHTML = _this.win.querySelector("div>h5");
        _this.contentHTML = _this.win.querySelector("div>div>div");
        return _this;
    }
    DialogWindow.prototype.showDialog = function (title, message, buttons) {
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
                cleanUp();
                resolve(choice);
            }, keyHandler = function (ev) {
                if (ev.code == 'Escape') {
                    cleanUp();
                    resolve(cancelIndex);
                }
            };
            self.titleHTML.innerText = title;
            self.messageHTML.innerText = message;
            self.contentHTML.innerHTML =
                buttons.map(function (text, index) {
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
}(base_window_1.default));
exports.default = DialogWindow;
//# sourceMappingURL=dialog-window.js.map