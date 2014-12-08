/*global module, window*/

(function (win) {
    "use strict";
    module.exports = function (element) {
        var isSticky = false;

        element.parentNode.style.height = element.getBoundingClientRect().height + "px";

        win.addEventListener("scroll", function () {
            var rect = element.parentNode.getBoundingClientRect();

            var shouldBeSticky = rect.top <= 0;

            if (shouldBeSticky && !isSticky) {
                isSticky = true;
                element.classList.add("sticky");
                return;
            }
            if (!shouldBeSticky && isSticky) {
                isSticky = false;
                element.classList.remove("sticky");
            }
        });

        return element;
    };
}(window));
