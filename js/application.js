!function t(e,r,n){function i(c,u){if(!r[c]){if(!e[c]){var s="function"==typeof require&&require;if(!u&&s)return s(c,!0);if(o)return o(c,!0);throw new Error("Cannot find module '"+c+"'")}var a=r[c]={exports:{}};e[c][0].call(a.exports,function(t){var r=e[c][1][t];return i(r?r:t)},a,a.exports,t,e,r,n)}return r[c].exports}for(var o="function"==typeof require&&require,c=0;c<n.length;c++)i(n[c]);return i}({1:[function(t){!function(e){"use strict";var r=t("./sticky");r(e.querySelectorAll("[data-sticky]"))}(document)},{"./sticky":2}],2:[function(t,e){!function(t){"use strict";e.exports=function(e){var r,n;for(r=0;r<e.length;r++)n=e[r],n.dataset.stickyLimit=n.getBoundingClientRect().bottom;return t.addEventListener("scroll",function(){var t,i;for(r=0;r<e.length;r++)n=e[r],i=parseInt(n.dataset.stickyLimit,10),t=n.parentNode.getBoundingClientRect(),t.top+i<0?n.classList.add("sticky"):n.classList.remove("sticky")}),e}}(window)},{}]},{},[1]);