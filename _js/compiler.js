/*global module*/

(function (doc) {
    "use strict";

    module.exports = function (directives, rootElement) {
        rootElement = rootElement || doc;
        for (var i in directives) {
            var elements = rootElement.querySelectorAll(i);
            for (var j = 0; j < elements.length; j++) {
                directives[i](elements[j]);
            }
        }
    };
}(window.document));
