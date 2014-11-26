/*global require, document*/
var fader = require("./fader"),
    sticky = require("./sticky"),
    materialButton = require("./material-button"),
    lazyDisqus = require("./lazy-disqus");

(function (doc) {
    "use strict";
    var disqusElement = doc.getElementById("disqus_thread");

    fader(doc.querySelectorAll("[data-fader]"));
    sticky(doc.querySelectorAll("[data-sticky]"));
    materialButton(doc.querySelectorAll("[data-material-button]"));

    if (disqusElement) {
        lazyDisqus(disqusElement);
    }

}(document));
