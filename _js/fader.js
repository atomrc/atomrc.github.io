/*global module, window*/

(function (win) {
    "use strict";
    var Fader = function (element) {
        var height = element.getBoundingClientRect().height,
            properties = element.dataset.fader,
            rect,
            val;

        win.addEventListener("scroll", function () {
            rect = element.getBoundingClientRect();
            val = (height + rect.top) / height;
            element.style.opacity = Math.min(1, Math.max(val, 0));
        });
    };

    module.exports = function (elements) {
        var faders = [];

        for (var i = 0; i < elements.length; i++) {
            faders.push(new Fader(elements[i]));
        }
    };
}(window));
