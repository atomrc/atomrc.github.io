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
var fader = require("./fader");

(function (doc) {
    "use strict";

    fader(doc.querySelectorAll("[data-fader]"));

}(document));

},{"./fader":1}]},{},[2])