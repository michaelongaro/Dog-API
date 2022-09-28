import { weather_icons } from "./weather_icons";

const days_str = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const current_day_of_week = document.getElementById(
  "current-day-of-week"
) as HTMLDivElement;
const current_weather_icon = document.getElementById(
  "weather-status-icon-7"
) as HTMLDivElement;
const current_precip_percent = document.getElementById(
  "precip-percent-7"
) as HTMLDivElement;
``;
const current_temp = document.getElementById(
  "current-temperature"
) as HTMLDivElement;
const current_min_temp = document.getElementById(
  "low-temperature-7"
) as HTMLDivElement;
const current_max_temp = document.getElementById(
  "high-temperature-7"
) as HTMLDivElement;
const current_humidity = document.getElementById(
  "current-humidity"
) as HTMLDivElement;
const current_wind = document.getElementById("wind-7") as HTMLDivElement;

function currentHoursInTimezone(timeZone: string) {
  return new Date(timeZone).getHours();
}

export default function renderWeatherValues(
  current_conditions: any,
  formatted_forecast: any,
  current_forecast_days_indicies: number[],
  current_day_idx: number
) {
  for (let i = 0; i < 5; i++) {
    const currentHours = currentHoursInTimezone(formatted_forecast[i]["Date"]);

    // currently always sets to "Day" because the Date property returns the time
    // at the start of the day, need to send the location key through the
    // "locationKey" api from accuweather to get the timezone and then calculate
    // the currentHours based on that value.
    const morningOrEvening = currentHours < 21 ? "Day" : "Night";

    // references to dynamic html elems
    const forecast_weather_icon = document.getElementById(
      `weather-status-icon-${current_forecast_days_indicies[i]}`
    ) as HTMLDivElement;
    const forecast_precip_percent = document.getElementById(
      `precip-percent-${current_forecast_days_indicies[i]}`
    ) as HTMLDivElement;
    const forecast_min_temp = document.getElementById(
      `low-temperature-${current_forecast_days_indicies[i]}`
    ) as HTMLDivElement;
    const forecast_max_temp = document.getElementById(
      `high-temperature-${current_forecast_days_indicies[i]}`
    ) as HTMLDivElement;

    if (i === 0) {
      current_day_of_week.innerHTML = days_str[current_day_idx];

      current_weather_icon.innerHTML = `<img src=${
        weather_icons[formatted_forecast[i][morningOrEvening]["Icon"]]
      }>`;

      current_precip_percent.innerHTML = `${formatted_forecast[i][morningOrEvening]["RainProbability"]}%`;

      current_temp.innerHTML = `${current_conditions[0].Temperature.Imperial.Value}°F`;

      current_min_temp.innerHTML = `${formatted_forecast[i].Temperature.Minimum.Value}°F`;

      current_max_temp.innerHTML = `${formatted_forecast[i].Temperature.Maximum.Value}°F`;

      current_humidity.innerHTML = `${current_conditions[0].RelativeHumidity}%`;

      current_wind.innerHTML = `${formatted_forecast[i][morningOrEvening]["Wind"]["Speed"]["Value"]}mph`;
    } else {
      forecast_weather_icon.innerHTML = `<img src=${
        weather_icons[formatted_forecast[i][morningOrEvening]["Icon"]]
      }>`;

      forecast_precip_percent.innerHTML = `${formatted_forecast[i][morningOrEvening]["RainProbability"]}%`;

      forecast_min_temp.innerHTML = `${formatted_forecast[i].Temperature.Minimum.Value}°F`;

      forecast_max_temp.innerHTML = `${formatted_forecast[i].Temperature.Maximum.Value}°F`;
    }
  }
}
