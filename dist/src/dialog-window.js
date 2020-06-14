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
var base_window_1 = require("./base-window");
//later check main window resize, should recenter automatically
var DialogWindow = /** @class */ (function (_super) {
    __extends(DialogWindow, _super);
    //Save, Cancel, Don't Save
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
                var option = parseInt(e.target.getAttribute("dialog-option"));
                console.log(option);
                if (isNaN(option))
                    return;
                cleanUp();
                resolve(option);
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
    DialogWindow.prototype.propertyDefaults = function () {
        return dab_1.extend(_super.prototype.propertyDefaults.call(this), {
            class: "win dialog hide",
            templateName: "dialogWin01",
        });
    };
    return DialogWindow;
}(base_window_1.default));
exports.default = DialogWindow;
//# sourceMappingURL=dialog-window.js.map