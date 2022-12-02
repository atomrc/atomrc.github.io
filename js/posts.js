(function (win, doc) {
  doc.querySelectorAll("article h2, article h3").forEach((element) => {
    var anchor = doc.createElement("a");
    anchor.href = "#" + element.id;
    anchor.classList.add("anchor");
    element.append(anchor);
  });

  //hack to force the browser to interpret the
  //anchor hash when page is loaded
  function scrollToHash() {
    if (win.location.hash) {
      win.location.hash = win.location.hash;
    }
  }

  if (doc.readyState === "loading") {
    doc.addEventListener("DOMContentLoaded", scrollToHash, { once: true });
  } else {
    scrollToHash();
  }
})(window, document);
