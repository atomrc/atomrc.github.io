/*global require, document*/
var fader = require("./fader");

(function (doc) {
    "use strict";

    fader(doc.querySelectorAll("[data-fader]"));

}(document));
