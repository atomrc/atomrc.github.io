(function (win, doc) {
  let isDarkMode =
    sessionStorage.getItem("darkmode") === undefined
      ? win.matchMedia("(prefers-color-scheme: dark)").matches
      : sessionStorage.getItem("darkmode") === "true";

  const toggleDarkMode = (setDarkMode) => {
    isDarkMode = setDarkMode ?? !isDarkMode;
    sessionStorage.setItem("darkmode", isDarkMode);
    if (isDarkMode) {
      document.body.classList.add("dark-mode");
      document.body.classList.remove("light-mode");
    } else {
      document.body.classList.remove("dark-mode");
      document.body.classList.add("light-mode");
    }
  };

  toggleDarkMode(isDarkMode);
  const darkModeToggle = doc.getElementById("dark-mode-toggle");

  darkModeToggle.addEventListener("click", () => toggleDarkMode());
})(window, document);
