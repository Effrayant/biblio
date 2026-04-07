const html = document.documentElement;
const toggleDark = document.getElementById("toggleDark");
const themeIcon = document.getElementById("themeIcon");
 
export function appliquerTheme(theme) {
  html.setAttribute("data-theme", theme);
 
  const modeSombre = theme === "dark";
  toggleDark.checked = modeSombre;
  themeIcon.textContent = modeSombre ? "🌙" : "☀️";
 
  document.querySelector(".item-desc").textContent = modeSombre
    ? "Mode sombre activé"
    : "Mode clair activé";
}