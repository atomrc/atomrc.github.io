(function(win, doc) {
  function compile(directives, rootElement) {
    Object.entries(directives).forEach(([selector, directive]) => {
      rootElement
        .querySelectorAll(selector)
        .forEach(element => directive(element));
    });
  }

  function probe(element, onVisible) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(({ isIntersecting, target }) => {
        if (isIntersecting) {
          onVisible(target);
          observer.unobserve(target);
        }
      });
    });
    observer.observe(element);
  }

  var directives = {
    "article h2, article h3": element => {
      var anchor = doc.createElement("a");
      anchor.href = "#" + element.id;
      anchor.classList.add("anchor");
      element.appendChild(anchor);
    },

    "[data-reading-probe]": element => {
      probe(element, element => {
        ga("send", "event", "article", "read", element.dataset.readingProbe);
      });
    }
  };

  compile(directives, doc);

  doc.addEventListener("DOMContentLoaded", () => {
    //hack to force the browser to interpret the
    //anchor hash when page is loaded
    if (win.location.hash) {
      win.location.hash = win.location.hash;
    }
  });
})(window, document);
