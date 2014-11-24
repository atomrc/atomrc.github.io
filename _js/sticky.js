/*global module, window*/

(function (win) {
    "use strict";
    module.exports = function (elements) {
        var i, element, isSticky = false;

        for (i = 0; i < elements.length; i++) {
            element = elements[i];
            element.parentNode.style.height = element.getBoundingClientRect().height + "px";
        }

        win.addEventListener("scroll", function () {
            var rect;

            for (i = 0; i < elements.length; i++) {
                element = elements[i];
                rect = element.parentNode.getBoundingClientRect();

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
            }
        });

        return elements;
    };
}(window));
