/**
 * Created by Jerico on 02/10/2015.
 */
angular.module("getColorApp", ['ngFileUpload'])
    .controller("getColorCtrl", ["$scope", "$timeout", function (scope, timeout) {
        var RGB = function () {

            this.setR = function (r) {
                this.r = r;
            };

            this.setG = function (g) {
                this.g = g;
            };

            this.setB = function (b) {
                this.b = b;
            };

        };
        RGB.prototype.equals = function (RGB) {
            return this.r === RGB.r & this.g === RGB.g & this.b === RGB.b;
        };
        RGB.prototype.valueOf = function () {
            return this.r + this.g + this.b;
        };
        RGB.prototype.toString = function () {
            return this.r + this.g + this.b;
        };
        function componentToHex(c) {
            var hex = c.toString(16);
            return hex.length == 1 ? "0" + hex : hex;
        }

        function rgbToHex(RGB) {
            return "#" + componentToHex(RGB.r) + componentToHex(RGB.g) + componentToHex(RGB.b);
        }

        function hexToRgb(hex) {
            var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
            return result ? {
                r: parseInt(result[1], 16),
                g: parseInt(result[2], 16),
                b: parseInt(result[3], 16)
            } : null;
        }

        scope.selectFile = function ($file) {
            console.debug("selectFile", $file);
            scope.loadingImage = true;
            FileAPI.readAsDataURL($file, function (event) {
                var dataURL = event.result;
                console.debug("dataURL", dataURL);
                timeout(function () {
                    scope.loadingImage = false;
                    scope.chromaSamples = [];
                    scope.chromaColors = [];
                    scope.imageData = dataURL;
                    scope.findColor();
                });
            });

        };

        scope.findColor = function () {
            var img = new Image();
            img.src = scope.imageData;

            var colorThief = new ColorThief();
            var palettes = colorThief.getPalette(img, 256);
            var rgbs = new Array();

            rgbs.contains = function (RGB) {
                for (var i in this) {
                    var rgb = this[i];
                    if (rgb.valueOf() === RGB.valueOf()) return true;
                }
                return false;
            };

            for (var pal in palettes) {
                var palette = palettes[pal];
                console.debug("palette", palette);
                var rgb = new RGB();
                rgb.setR(palette[0]);
                rgb.setG(palette[1]);
                rgb.setB(palette[2]);
                console.debug("rgb", rgb);
                if (!rgbs.contains(rgb)) {
                    rgbs.push(rgb);
                }
            }


            console.debug("palettes", rgbs.length);

            scope.hexes = new Array();

            for (var i = 0; i < rgbs.length; i++) {
                var rgb = rgbs[i];
                scope.hexes.push(rgbToHex(rgb));
            }

        };


        scope.includeForChroma = function (hex) {
            if (scope.chromaSamples === undefined) {
                scope.chromaSamples = [];
            }
            if (scope.chromaSamples.indexOf(hex) === -1) {
                scope.chromaSamples.push(hex);
                scope.chromaSamplesString = JSON.stringify(scope.chromaSamples);
                var scaleCount = scope.chromaSamples.length * 3;
                scope.chromaColors = chroma.scale(scope.chromaSamples).colors(scaleCount);
                scope.chromaColorsString = JSON.stringify(scope.chromaColors);
            }
        };


        scope.removeAdded = function (hex) {
            if (scope.chromaSamples && scope.chromaSamples.indexOf(hex) > -1) {
                return true;
            }
            return false;
        };

        scope.remove = function (chromaHex) {
            if (scope.chromaSamples && scope.chromaSamples.indexOf(chromaHex) > -1) {
                scope.chromaSamples.splice(scope.chromaSamples.indexOf(chromaHex), 1);
                var scaleCount = scope.chromaSamples.length * 3;
                if (scope.chromaSamples.length > 2) {
                    scope.chromaColors = chroma.scale(scope.chromaSamples).colors(scaleCount);
                    scope.chromaColorsString = JSON.stringify(scope.chromaColors);
                } else {
                    scope.chromaColors = [];
                    scope.chromaColorsString = JSON.stringify(scope.chromaColors);
                }

            }
        };

    }]);

