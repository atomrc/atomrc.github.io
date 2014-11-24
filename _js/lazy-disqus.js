/*global module, window*/

(function (win, doc) {
    "use strict";

    module.exports = function (element) {
        var windowHeight = win.innerHeight,
            init = false;

        win.addEventListener("scroll", function () {
            if (init) { return; }
            var rect = element.getBoundingClientRect();

            if (rect.top <= windowHeight) {
                init = true;
                var disqusShortname = "whysocurious";
                (function() {
                    var dsq = doc.createElement("script"); dsq.type = "text/javascript"; dsq.async = true;
                    dsq.src = "//" + disqusShortname + ".disqus.com/embed.js";
                    (doc.getElementsByTagName("head")[0] || doc.getElementsByTagName("body")[0]).appendChild(dsq);
                })();
            }
        });
    };
}(window, window.document));
