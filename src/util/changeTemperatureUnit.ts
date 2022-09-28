export default function changeTemperatureUnit(
  convertToCelcius: boolean,
  fahrenheight_toggle: HTMLButtonElement,
  celcius_toggle: HTMLButtonElement
) {
  for (let i = 0; i < 7; i++) {
    const low_temp = document.getElementById(`low-temperature-${i}`)?.innerHTML;
    const high_temp = document.getElementById(
      `high-temperature-${i}`
    )?.innerHTML;

    if (low_temp && high_temp) {
      if (convertToCelcius) {
        document.getElementById(
          `low-temperature-${i}`
        )!.innerHTML = `${Math.round((5 / 9) * (parseInt(low_temp) - 32))}°C`;
        document.getElementById(
          `high-temperature-${i}`
        )!.innerHTML = `${Math.round((5 / 9) * (parseInt(high_temp) - 32))}°C`;
      } else {
        document.getElementById(
          `low-temperature-${i}`
        )!.innerHTML = `${Math.round((9 / 5) * parseInt(low_temp) + 32)}°F`;
        document.getElementById(
          `high-temperature-${i}`
        )!.innerHTML = `${Math.round((9 / 5) * parseInt(high_temp) + 32)}°F`;
      }
    }
  }

  const current_temp = document.getElementById(
    "current-temperature"
  )?.innerHTML;
  const current_low = document.getElementById("low-temperature-7")?.innerHTML;
  const current_high = document.getElementById("high-temperature-7")?.innerHTML;

  if (current_temp && current_low && current_high) {
    if (convertToCelcius) {
      document.getElementById("current-temperature")!.innerHTML = `${Math.round(
        (5 / 9) * (parseInt(current_temp) - 32)
      )}°C`;
      document.getElementById("low-temperature-7")!.innerHTML = `${Math.round(
        (5 / 9) * (parseInt(current_low) - 32)
      )}°C`;
      document.getElementById("high-temperature-7")!.innerHTML = `${Math.round(
        (5 / 9) * (parseInt(current_high) - 32)
      )}°C`;
    } else {
      document.getElementById("current-temperature")!.innerHTML = `${Math.round(
        (9 / 5) * parseInt(current_temp) + 32
      )}°F`;
      document.getElementById("low-temperature-7")!.innerHTML = `${Math.round(
        (9 / 5) * parseInt(current_low) + 32
      )}°C`;
      document.getElementById("high-temperature-7")!.innerHTML = `${Math.round(
        (9 / 5) * parseInt(current_high) + 32
      )}°C`;
    }
  }

  if (convertToCelcius) {
    fahrenheight_toggle.className = "";
    celcius_toggle.className = "toggled";
  } else {
    fahrenheight_toggle.className = "toggled";
    celcius_toggle.className = "";
  }
}
