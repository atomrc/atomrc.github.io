/*global module, window*/

(function (win) {
    "use strict";
    module.exports = function (elements) {
        var i, element, height;

        for (i = 0; i < elements.length; i++) {
            element = elements[i];
            element.dataset.stickyLimit = element.getBoundingClientRect().bottom;
            height = element.getBoundingClientRect().height;
        }

        win.addEventListener("scroll", function () {
            var rect, limit;

            for (i = 0; i < elements.length; i++) {
                element = elements[i];
                limit = parseInt(element.dataset.stickyLimit, 10);
                rect = element.parentNode.getBoundingClientRect();

                if (rect.top + limit < 0) {
                    element.classList.add("sticky");
                } else {
                    element.classList.remove("sticky");
                }
            }
        });

        return elements;
    };
}(window));
