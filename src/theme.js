import moonIcon from "./assets/icons/moon.svg";
import sunIcon from "./assets/icons/sun.svg";

const themeToggle = document.querySelector(".theme-toggle");
const themeIcon = themeToggle.querySelector(".theme-toggle-icon");
const storageKey = "weather-app-theme";

function applyTheme(theme) {
  const isDark = theme === "dark";
  document.documentElement.dataset.theme = theme;
  themeIcon.src = isDark ? sunIcon : moonIcon;
  themeToggle.setAttribute(
    "aria-label",
    isDark ? "Switch to light mode" : "Switch to dark mode",
  );
  themeToggle.setAttribute("aria-pressed", String(isDark));
}

let savedTheme;
try {
  savedTheme = localStorage.getItem(storageKey);
} catch (error) {
  console.error("Could not read the saved theme preference.", error);
}

let currentTheme = savedTheme === "dark" ? "dark" : "light";
applyTheme(currentTheme);

themeToggle.addEventListener("click", (event) => {
  currentTheme = currentTheme === "dark" ? "light" : "dark";

  try {
    localStorage.setItem(storageKey, currentTheme);
  } catch (error) {
    console.error("Could not save the theme preference.", error);
  }

  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  if (!document.startViewTransition || reduceMotion) {
    applyTheme(currentTheme);
    return;
  }

  const root = document.documentElement;
  const horizontalDistance = Math.max(
    event.clientX,
    window.innerWidth - event.clientX,
  );
  const verticalDistance = Math.max(
    event.clientY,
    window.innerHeight - event.clientY,
  );

  root.style.setProperty("--theme-transition-x", `${event.clientX}px`);
  root.style.setProperty("--theme-transition-y", `${event.clientY}px`);
  root.style.setProperty(
    "--theme-transition-radius",
    `${Math.hypot(horizontalDistance, verticalDistance)}px`,
  );

  document.startViewTransition(() => applyTheme(currentTheme));
});
