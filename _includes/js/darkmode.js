(function (win, doc) {
  let isDarkMode = false;
  const toggleDarkMode = (setDarkMode) => {
    isDarkMode = setDarkMode ?? !isDarkMode;
    if (isDarkMode) {
      document.body.classList.add("dark-mode");
      document.body.classList.remove("light-mode");
    } else {
      document.body.classList.remove("dark-mode");
      document.body.classList.add("light-mode");
    }
  };
  if (
    win.matchMedia &&
    win.matchMedia("(prefers-color-scheme: dark)").matches
  ) {
    toggleDarkMode(true);
  }

  const darkModeToggle = doc.getElementById("dark-mode-toggle");

  darkModeToggle.addEventListener("click", () => toggleDarkMode());
})(window, document);
