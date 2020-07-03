"use strict";
//Color class is adapted from:
//https://github.com/Microsoft/TypeScriptSamples/blob/master/raytracer/raytracer.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.Colors = exports.Color = void 0;
var Color = /** @class */ (function () {
    function Color(r, g, b) {
        this.r = r;
        this.g = g;
        this.b = b;
    }
    Color.scale = function (k, v) { return new Color(k * v.r, k * v.g, k * v.b); };
    Color.plus = function (v1, v2) { return new Color(v1.r + v2.r, v1.g + v2.g, v1.b + v2.b); };
    Color.times = function (v1, v2) { return new Color(v1.r * v2.r, v1.g * v2.g, v1.b * v2.b); };
    Color.toDrawingColor = function (c) {
        var legalize = function (d) { return d > 1 ? 1 : d; };
        return {
            r: Math.floor(legalize(c.r) * 255),
            g: Math.floor(legalize(c.g) * 255),
            b: Math.floor(legalize(c.b) * 255)
        };
    };
    Color.getcolor = function (text, defaultColor) {
        var color = text && Colors[text.trim().toLowerCase()];
        //default to green
        return Colors[color !== undefined ? color : (defaultColor !== undefined) ? defaultColor : ''];
    };
    Color.white = new Color(1.0, 1.0, 1.0);
    Color.grey = new Color(0.5, 0.5, 0.5);
    Color.black = new Color(0.0, 0.0, 0.0);
    Color.background = Color.black;
    Color.defaultColor = Color.black;
    return Color;
}());
exports.Color = Color;
//supported colors for a board component
var Colors;
(function (Colors) {
    Colors[Colors["white"] = 0] = "white";
    Colors[Colors["black"] = 1] = "black";
    Colors[Colors["green"] = 2] = "green";
    Colors[Colors["red"] = 3] = "red";
    Colors[Colors["blue"] = 4] = "blue";
    Colors[Colors["yellow"] = 5] = "yellow";
    Colors[Colors["orange"] = 6] = "orange";
    Colors[Colors["purple"] = 7] = "purple";
    Colors[Colors["brown"] = 8] = "brown";
    Colors[Colors["aqua"] = 9] = "aqua";
    Colors[Colors["bisque"] = 10] = "bisque";
    Colors[Colors["navy"] = 11] = "navy";
    Colors[Colors["teal"] = 12] = "teal";
    Colors[Colors["violet"] = 13] = "violet";
})(Colors = exports.Colors || (exports.Colors = {}));
//# sourceMappingURL=colors.js.map