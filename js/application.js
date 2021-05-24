(function (win, doc) {
  doc.querySelectorAll("article h2, article h3").forEach((element) => {
    var anchor = doc.createElement("a");
    anchor.href = "#" + element.id;
    anchor.classList.add("anchor");
    element.appendChild(anchor);
  });

  doc.addEventListener("DOMContentLoaded", () => {
    //hack to force the browser to interpret the
    //anchor hash when page is loaded
    if (win.location.hash) {
      win.location.hash = win.location.hash;
    }
  });
})(window, document);
