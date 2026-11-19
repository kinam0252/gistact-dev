(() => {
  const KEY = "gistact-theme", root = document.documentElement;
  const saved = () => {
    try {
      const t = localStorage.getItem(KEY);
      return t === "light" || t === "dark" ? t : null;
    } catch (e) {
      return null;
    }
  };
  const sync = () => document.querySelectorAll("[data-theme-toggle]").forEach((b) => {
    const light = root.dataset.theme === "light";
    b.setAttribute("aria-label", light ? "Switch to dark mode" : "Switch to light mode");
    b.setAttribute("aria-pressed", String(light));
  });
  const apply = (t) => {
    root.dataset.theme = t;
    root.style.colorScheme = t;
    sync();
    document.dispatchEvent(new CustomEvent("themechange", { detail: t }));
  };
  apply(saved() || "dark");
  document.addEventListener("click", (e) => {
    const b = e.target.closest && e.target.closest("[data-theme-toggle]");
    if (!b) return;
    const t = root.dataset.theme === "light" ? "dark" : "light";
    try {
      localStorage.setItem(KEY, t);
    } catch (err) {
    }
    apply(t);
  });
  document.addEventListener("DOMContentLoaded", sync);
})();
