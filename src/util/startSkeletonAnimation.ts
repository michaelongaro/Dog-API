import anime from "animejs";

import calculateBackgroundGradientByTemps from "./calculateBackgroundGradientByTemps";

const current_day = document.getElementById("current-day") as HTMLDivElement;
const temp_units_container = document.getElementById(
  "temp-units-container"
) as HTMLDivElement;

export default function startSkeletonAnimation(
  days: HTMLDivElement[],
  min_weekly_temp: number,
  max_weekly_temp: number,
  fahrenheight_toggle: HTMLButtonElement,
  celcius_toggle: HTMLButtonElement
) {
  document.documentElement.style.setProperty("--container-opacities", "0");

  current_day.className += " loading";

  for (const day of days) {
    day.className += " loading";
  }

  anime({
    targets:
      "#current-day, #sunday, #monday, #tuesday, #wednesday, #thursday, #friday, #saturday",
    loop: 1,
    translateY: [10, -5],
    scale: [1.1, 0.9, 1],
    rotateY: "360deg",
    direction: "alternate",
    duration: 2000,
    easing: "easeInSine",
    complete: () => {
      current_day.className = "day base-flex";
      for (const day of days) {
        day.className = "day";
      }

      document.documentElement.style.setProperty("--container-opacities", "1");
      calculateBackgroundGradientByTemps(min_weekly_temp, max_weekly_temp);

      temp_units_container.style.pointerEvents = "auto";
      fahrenheight_toggle.className = "toggled";
      celcius_toggle.className = "";
    },
  });
}
