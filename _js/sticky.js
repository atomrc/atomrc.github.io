/*global module, window*/

(function (win) {
    "use strict";
    module.exports = function (elements) {
        var i, element;

        for (i = 0; i < elements.length; i++) {
            element = elements[i];
            element.parentNode.style.height = element.getBoundingClientRect().height + "px";
        }

        win.addEventListener("scroll", function () {
            var rect;

            for (i = 0; i < elements.length; i++) {
                element = elements[i];
                rect = element.parentNode.getBoundingClientRect();

                if (rect.top <= 0) {
                    element.classList.add("sticky");
                } else {
                    element.classList.remove("sticky");
                }
            }
        });

        return elements;
    };
}(window));
