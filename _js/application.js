/*global require, document, ga*/
var probe = require("./probe"),
    compile = require("./compiler");

(function (doc) {
    "use strict";
    var directives = {
        "#disqus_thread": function (element) {
            probe(element, function(/*element*/) {
                var dsq = doc.createElement("script"); dsq.type = "text/javascript"; dsq.async = true;
                dsq.src = "//whysocurious.disqus.com/embed.js";
                (doc.getElementsByTagName("head")[0] || doc.getElementsByTagName("body")[0]).appendChild(dsq);
            });
        },
        "[data-reading-probe]": function (element) {
            probe(element, function (element) {
                ga("send", "event", "article", "read", element.dataset.readingProbe);
            });
        }
    };

    compile(doc, directives);

}(document));
