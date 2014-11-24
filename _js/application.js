/*global require, document*/
var fader = require("./fader"),
    sticky = require("./sticky"),
    lazyDisqus = require("./lazy-disqus");

(function (doc) {
    "use strict";
    var disqusElement = doc.getElementById("disqus_thread");

    fader(doc.querySelectorAll("[data-fader]"));
    sticky(doc.querySelectorAll("[data-sticky]"));

    if (disqusElement) {
        lazyDisqus(disqusElement);
    }

}(document));
