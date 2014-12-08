/*global module, window*/

(function (win) {
    "use strict";
    module.exports = function (elements) {
        var previousPos = 0,
            body = win.document.body,
            element;
        win.addEventListener("scroll", function (event) {
            for (var i = 0; i < elements.length; i++) {
                var diff = previousPos - body.getBoundingClientRect().top;
                element = elements[i];
                previousPos = body.getBoundingClientRect().top;
                if (diff < -10) {
                    element.classList.remove("visible");
                } else {
                    element.classList.add("visible");
                }
            }
        });

        return elements;
    };
}(window));
