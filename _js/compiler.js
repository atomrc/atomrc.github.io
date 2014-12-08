/*global module*/

(function () {
    "use strict";

    module.exports = function (rootElement, directives) {
        for (var i in directives) {
            var elements = rootElement.querySelectorAll(i);
            for (var j = 0; j < elements.length; j++) {
                directives[i](elements[j]);
            }
        }
    };
}());
