/*global require, document*/

(function (doc) {
    "use strict";
    var sticky = require("./sticky");

    sticky(doc.querySelectorAll("[data-sticky]"));
}(document));
