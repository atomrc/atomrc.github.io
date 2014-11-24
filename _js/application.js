/*global require, document*/
var fader = require("./fader"),
    sticky = require("./sticky"),
    lazyDisqus = require("./lazy-disqus");

(function (doc) {
    "use strict";

    fader(doc.querySelectorAll("[data-fader]"));
    sticky(doc.querySelectorAll("[data-sticky]"));
    lazyDisqus(doc.getElementById("disqus_thread"));

}(document));
