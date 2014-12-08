/*global module, window*/

(function (win) {
    "use strict";

    module.exports = function (element, initFn) {
        var windowHeight = win.innerHeight,
            init = false;

        win.addEventListener("scroll", function () {
            if (init) { return; }
            var rect = element.getBoundingClientRect();

            if (rect.top <= windowHeight) {
                initFn(element);
                init = true;
            }
        });
    };
}(window));
