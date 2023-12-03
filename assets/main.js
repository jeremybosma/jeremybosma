var toggles = document.querySelectorAll(".theme-toggle");

var storedTheme = localStorage.getItem("theme");

if (!storedTheme) {
  storedTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

document.documentElement.setAttribute("data-theme", storedTheme);

toggles.forEach(function(toggle) {
  if (storedTheme === "light") {
    toggle.innerHTML = "<button>🌙</button>";
  } else {
    toggle.innerHTML = "<button>☀️</button>";
  }
});

toggles.forEach(function(toggle) {
  toggle.onclick = function() {
    var currentTheme = document.documentElement.getAttribute("data-theme");
    var targetTheme = "light";

    if (currentTheme === "light") {
      targetTheme = "dark";
      toggle.innerHTML = "<button>☀️</button>";
    } else {
      toggle.innerHTML = "<button>🌙</button>";
    }

    document.documentElement.setAttribute("data-theme", targetTheme);
    localStorage.setItem("theme", targetTheme);
  };
});