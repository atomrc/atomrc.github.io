!function t(e,n,r){function i(c,u){if(!n[c]){if(!e[c]){var s="function"==typeof require&&require;if(!u&&s)return s(c,!0);if(o)return o(c,!0);throw new Error("Cannot find module '"+c+"'")}var a=n[c]={exports:{}};e[c][0].call(a.exports,function(t){var n=e[c][1][t];return i(n?n:t)},a,a.exports,t,e,n,r)}return n[c].exports}for(var o="function"==typeof require&&require,c=0;c<r.length;c++)i(r[c]);return i}({1:[function(t,e){!function(){"use strict";e.exports=function(t,e){for(var n in e)for(var r=t.querySelectorAll(n),i=0;i<r.length;i++)e[n](r[i])}}()},{}],2:[function(t){var e=t("./probe"),n=t("./sticky"),r=t("./compiler");!function(t){"use strict";var i={"#disqus_thread":function(n){e(n,function(){var e=t.createElement("script");e.type="text/javascript",e.async=!0,e.src="//whysocurious.disqus.com/embed.js",(t.getElementsByTagName("head")[0]||t.getElementsByTagName("body")[0]).appendChild(e)})},"[data-reading-probe]":function(t){e(t,function(t){ga("send","event","article","read",t.dataset.readingProbe)})},"[data-sticky]":function(t){n(t)}};r(t,i)}(document)},{"./compiler":1,"./probe":3,"./sticky":4}],3:[function(t,e){!function(t){"use strict";e.exports=function(e,n){var r=t.innerHeight,i=!1;return t.addEventListener("scroll",function(){if(!i){var t=e.getBoundingClientRect();t.top<=r&&(n(e),i=!0)}}),e}}(window)},{}],4:[function(t,e){!function(t){"use strict";e.exports=function(e){var n=!1;return e.parentNode.style.height=e.getBoundingClientRect().height+"px",t.addEventListener("scroll",function(){var t=e.parentNode.getBoundingClientRect(),r=t.top<=0;return r&&!n?(n=!0,void e.classList.add("sticky")):void(!r&&n&&(n=!1,e.classList.remove("sticky")))}),e}}(window)},{}]},{},[2]);