!function e(n,t,r){function o(a,c){if(!t[a]){if(!n[a]){var u="function"==typeof require&&require;if(!c&&u)return u(a,!0);if(i)return i(a,!0);throw new Error("Cannot find module '"+a+"'")}var s=t[a]={exports:{}};n[a][0].call(s.exports,function(e){var t=n[a][1][e];return o(t?t:e)},s,s.exports,e,n,t,r)}return t[a].exports}for(var i="function"==typeof require&&require,a=0;a<r.length;a++)o(r[a]);return o}({1:[function(e,n){!function(e){"use strict";n.exports=function(n,t){t=t||e;for(var r in n)for(var o=t.querySelectorAll(r),i=0;i<o.length;i++)n[r](o[i])}}(window.document)},{}],2:[function(e){var n=e("./probe"),t=e("./compiler");!function(e){"use strict";var r={"article h2, article h3":function(n){var t=e.createElement("a");t.href="#"+n.id,t.classList.add("anchor"),n.appendChild(t)},"#disqus_thread":function(t){n(t,function(){var n=e.createElement("script");n.type="text/javascript",n.async=!0,n.src="//whysocurious.disqus.com/embed.js",(e.getElementsByTagName("head")[0]||e.getElementsByTagName("body")[0]).appendChild(n)})},"[data-reading-probe]":function(e){n(e,function(e){ga("send","event","article","read",e.dataset.readingProbe)})}};t(r),e.addEventListener("DOMContentLoaded",function(){window.location.hash&&(window.location.hash=window.location.hash)})}(document)},{"./compiler":1,"./probe":3}],3:[function(e,n){!function(e){"use strict";n.exports=function(n,t){var r=e.innerHeight,o=!1;return e.addEventListener("scroll",function(){if(!o){var e=n.getBoundingClientRect();e.top<=r&&(t(n),o=!0)}}),n}}(window)},{}]},{},[2]);