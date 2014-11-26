(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/*global module, window*/

(function (win) {
    "use strict";
    var Fader = function (element) {
        var height = element.getBoundingClientRect().height,
            properties = element.dataset.fader,
            rect,
            val;

        win.addEventListener("scroll", function () {
            rect = element.getBoundingClientRect();
            val = (height + rect.top) / height;
            element.style.opacity = Math.min(1, Math.max(val, 0));
        });
    };

    module.exports = function (elements) {
        var faders = [];

        for (var i = 0; i < elements.length; i++) {
            faders.push(new Fader(elements[i]));
        }
    };
}(window));

},{}],2:[function(require,module,exports){
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

},{"./fader":1,"./lazy-disqus":3,"./material-button":4,"./sticky":5}],3:[function(require,module,exports){
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

},{}],4:[function(require,module,exports){
/*global module, window*/

(function (win) {
    "use strict";
    module.exports = function (elements) {
        var previousPos = 0,
            element;
        win.addEventListener("scroll", function (event) {
            for (var i = 0; i < elements.length; i++) {
                var diff = previousPos - event.pageY;
                element = elements[i];
                previousPos = event.pageY;
                if (diff < 0) {
                    element.classList.add("visible");
                } else {
                    element.classList.remove("visible");
                }
            }
        });

        return elements;
    };
}(window));

},{}],5:[function(require,module,exports){
/*global module, window*/

(function (win) {
    "use strict";
    module.exports = function (elements) {
        var i, element, isSticky = false;

        for (i = 0; i < elements.length; i++) {
            element = elements[i];
            element.parentNode.style.height = element.getBoundingClientRect().height + "px";
        }

        win.addEventListener("scroll", function () {
            var rect;

            for (i = 0; i < elements.length; i++) {
                element = elements[i];
                rect = element.parentNode.getBoundingClientRect();

                var shouldBeSticky = rect.top <= 0;

                if (shouldBeSticky && !isSticky) {
                    isSticky = true;
                    element.classList.add("sticky");
                    return;
                }
                if (!shouldBeSticky && isSticky) {
                    isSticky = false;
                    element.classList.remove("sticky");
                }
            }
        });

        return elements;
    };
}(window));

},{}]},{},[2])