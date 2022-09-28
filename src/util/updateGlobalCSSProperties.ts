// expanding + showing container and child elements
export default function updateGlobalCSSProperties() {
  document.documentElement.style.setProperty("--container-widths", "100%");
  document.documentElement.style.setProperty("--container-heights", "100%");
  document.documentElement.style.setProperty("--container-user-select", "auto");
  document.documentElement.style.setProperty("--day-padding", "1.75rem");
  document.documentElement.style.setProperty("--day-opacity", "1");
  document.documentElement.style.setProperty(
    "--daily-forecast-container-margin-bottom",
    "3rem"
  );
  document.documentElement.style.setProperty(
    "--temp-units-container-margin-bottom",
    "2rem"
  );
}
