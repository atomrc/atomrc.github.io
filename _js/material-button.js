/*global module, window*/

(function (win) {
    "use strict";
    module.exports = function (elements) {
        var previousPos = 0,
            element;
        win.addEventListener("scroll", function (event) {
            for (var i = 0; i < elements.length; i++) {
                var diff = previousPos - event.pageY;
                element = elements[i];
                previousPos = event.pageY;
                if (diff < 0) {
                    element.classList.add("visible");
                } else {
                    element.classList.remove("visible");
                }
            }
        });

        return elements;
    };
}(window));
