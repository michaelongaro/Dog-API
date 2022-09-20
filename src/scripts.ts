import anime from "animejs";

import { weather_icons } from "./util/weather_icons";

const api_key = "5A30FxiSCT46fzC7G35geCxlL0Xeuqwp";

const city_name = document.getElementById("city") as HTMLElement;

const current_location_search = document.getElementById(
  "current-location-search"
) as HTMLButtonElement;
const search_button = document.getElementById(
  "search-button"
) as HTMLButtonElement;

const search = document.getElementById("search") as HTMLInputElement;
const res_list = document.getElementById("result-list") as HTMLElement;

const current_day = document.getElementById("current-day") as HTMLElement;
const monday = document.getElementById("monday") as HTMLElement;
const tuesday = document.getElementById("tuesday") as HTMLElement;
const wednesday = document.getElementById("wednesday") as HTMLElement;
const thursday = document.getElementById("thursday") as HTMLElement;
const friday = document.getElementById("friday") as HTMLElement;
const saturday = document.getElementById("saturday") as HTMLElement;
const sunday = document.getElementById("sunday") as HTMLElement;

const fahrenheight_toggle = document.getElementById(
  "fahrenheight-button"
) as HTMLButtonElement;
const celcius_toggle = document.getElementById(
  "celcius-button"
) as HTMLButtonElement;

const current_day_of_week = document.getElementById(
  "current-day-of-week"
) as HTMLElement;
const current_weather_icon = document.getElementById(
  "weather-status-icon-7"
) as HTMLElement;
const current_precip_percent = document.getElementById(
  "precip-percent-7"
) as HTMLElement;
const current_temp = document.getElementById(
  "current-temperature"
) as HTMLElement;
const current_min_temp = document.getElementById(
  "low-temperature-7"
) as HTMLElement;
const current_max_temp = document.getElementById(
  "high-temperature-7"
) as HTMLElement;
const current_humidity = document.getElementById(
  "current-humidity"
) as HTMLElement;
const current_wind = document.getElementById("wind-7") as HTMLElement;

const days = [sunday, monday, tuesday, wednesday, thursday, friday, saturday];
const days_str = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

let min_weekly_temp: number, max_weekly_temp: number;

let autofill_nav_index = -1;
let autofill_results: IAutofillResults | undefined;

let cards_created = false;

const d = new Date();
let current_day_idx = d.getDay();
let current_forecast_days_indicies: number[] = [];

let current_longitude: number;
let current_latitude: number;

search.addEventListener(
  "keyup",
  debounce(() => {
    clearAutofillResults();
    if (search.value === "") {
      res_list.style.height = "0";
      res_list.style.borderWidth = "0";
    } else {
      renderAutofillResults();
    }
  }, 250),
  true
);

current_location_search.addEventListener("click", () => {
  getCurrentCoordinates();
});

fahrenheight_toggle.addEventListener("click", () => {
  changeTemperatureUnit(false);
});

celcius_toggle.addEventListener("click", () => {
  changeTemperatureUnit(true);
});

function clearAutofillResults() {
  for (const autofill_result of Array.from(res_list.children)) {
    autofill_result.remove();
  }
}

function clearSearchBar() {
  search.value = "";
}

function shift_days() {
  for (let i = 0; i < 5; i++) {
    if (current_day_idx + i > 6) {
      // for this and below probably cleaner to be storing these into an obj
      // where key is  days.indexOf(days[current_day_idx + i - 7])
      // and value is days[current_day_idx + i - 7]
      // current_forecast_days.push(days[current_day_idx + i - 7]);
      current_forecast_days_indicies.push(
        days.indexOf(days[current_day_idx + i - 7])
      );
      days[current_day_idx + i - 7].style.order = `${current_day_idx + i}`;
    } else {
      // current_forecast_days.push(days[current_day_idx + i]);
      current_forecast_days_indicies.push(
        days.indexOf(days[current_day_idx + i])
      );
      days[current_day_idx + i].style.order = `${current_day_idx + i}`;
    }
  }
  // return current_forecast_days;
}

// probably a good convention to try to switch/follow is just changing classes instead
// of adding these arbitrary-feeling styles all over...
function showCityName(city: string) {
  city_name.innerHTML = "";
  city_name.innerHTML = city;

  city_name.style.display = "block";
  city_name.style.fontSize = "20pt";
}

async function getAutofillResults(location: string) {
  let autofill_url = `http://dataservice.accuweather.com/locations/v1/cities/autocomplete?apikey=${api_key}&q=${location}`;

  try {
    let res = await fetch(autofill_url);

    return await res.json();
  } catch (error) {
    console.log(error);
  }
}

// getting min/max daily temps + rain % + wind
async function getWeeklyWeather(city_loc: string) {
  let forecast_url = `http://dataservice.accuweather.com/forecasts/v1/daily/5day/${city_loc}?apikey=${api_key}&details=true`;

  try {
    let res = await fetch(forecast_url);

    return await res.json();
  } catch (error) {
    console.log(error);
  }
}

// getting realFeel temp + humidity
async function getCurrentConditions(city_loc: string) {
  let forecast_url = `http://dataservice.accuweather.com/currentconditions/v1/${city_loc}?apikey=${api_key}&details=true`;

  try {
    let res = await fetch(forecast_url);

    return await res.json();
  } catch (error) {
    console.log(error);
  }
}

function debounce(cb: Function, delay = 1000) {
  let timeout: number;
  return (...args: any) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      cb(...args);
    }, delay);
  };
}

async function getCurrentLocation(latitude: number, longitude: number) {
  let location_finder_url = `http://dataservice.accuweather.com/locations/v1/cities/geoposition/search?apikey=${api_key}&q=${latitude}%2C%20${longitude}`;

  try {
    let res = await fetch(location_finder_url);

    let res_value = await res.clone().json();

    showCityName(
      `${res_value["LocalizedName"]}, ${res_value["AdministrativeArea"]["ID"]}`
    );

    renderWeather(res_value.Key);
  } catch (error) {
    console.log(error);
  }
}

function currentHoursInTimezone(timeZone: string) {
  return new Date(timeZone).getHours();
}

search.addEventListener("focus", () => {
  if (search.value !== "" && res_list.style.height === "0px") {
    renderAutofillResults();
  }
});

window.addEventListener("click", (e: MouseEvent) => {
  let target = e.target as Node;
  if (!res_list.contains(target) && !search.contains(target)) {
    resetAutofillNavigation();
  }
});

interface IAutofillResult {
  LocalizedName: string;
  AdministrativeArea: {
    ID: string;
    LocalizedName: string;
  };
  Country: {
    ID: string;
  };
  Key: string;
}

interface IAutofillResults extends Array<IAutofillResult> {}

async function renderAutofillResults() {
  autofill_results = await getAutofillResults(search.value);

  res_list.style.height = "200px";
  res_list.style.borderWidth = "2px";
  autofill_nav_index = -1;

  if (autofill_results === undefined) {
    let autofillResult = document.createElement("div");
    autofillResult.innerHTML = "No results found";
    res_list.append(autofillResult);
    return;
  }

  for (const result of autofill_results) {
    let autofillResult = document.createElement("div");
    autofillResult.setAttribute("tabIndex", "-1");
    autofillResult.innerHTML = formatLocation(result);
    res_list.append(autofillResult);

    autofillResult.addEventListener(
      "click",
      () => {
        preRenderWeather(result);
      },
      true
    );
  }

  window.addEventListener("keydown", handleKeyboardAutofillNavigation);
}

function handleKeyboardAutofillNavigation(e: KeyboardEvent) {
  let num_autofill_results = document.querySelectorAll("#result-list > div");

  if (e.key === "ArrowDown") {
    e.preventDefault();

    if (autofill_nav_index < num_autofill_results.length - 1) {
      autofill_nav_index++;
      for (const result of Array.from(num_autofill_results)) {
        result.className = "";
      }
      num_autofill_results[autofill_nav_index].className =
        "keyboard-navigated-autofill";
      (num_autofill_results[autofill_nav_index] as HTMLElement)?.focus();
    }
  } else if (e.key === "ArrowUp") {
    e.preventDefault();

    if (
      autofill_nav_index >= 0 &&
      autofill_nav_index < num_autofill_results.length
    ) {
      autofill_nav_index--;
      if (autofill_nav_index !== -1) {
        for (const result of Array.from(num_autofill_results)) {
          result.className = "";
        }
        num_autofill_results[autofill_nav_index].className =
          "keyboard-navigated-autofill";
        (num_autofill_results[autofill_nav_index] as HTMLElement)?.focus();
      }
    }
  }

  if (e.key === "Enter") {
    e.preventDefault();

    if (autofill_results) {
      preRenderWeather(
        autofill_results[autofill_nav_index === -1 ? 0 : autofill_nav_index]
      );
    }
  }

  if (e.key === "Escape") {
    e.preventDefault();

    resetAutofillNavigation();
  }

  if (autofill_nav_index === -1) {
    search.focus();
  }
}

function resetAutofillNavigation() {
  let num_autofill_results = document.querySelectorAll("#result-list > div");
  res_list.style.height = "0";
  res_list.style.borderWidth = "0";
  autofill_nav_index = -1;
  for (const result of Array.from(num_autofill_results)) {
    result.className = "";
    (result as HTMLElement)?.blur();
  }

  window.removeEventListener("keydown", handleKeyboardAutofillNavigation);
}

function preRenderWeather(result: IAutofillResult) {
  res_list.style.height = "0";
  res_list.style.borderWidth = "0";

  showCityName(formatLocation(result));
  renderWeather(result["Key"]);
}

function formatLocation(location: IAutofillResult) {
  let broader_location: string;

  if (parseInt(location["AdministrativeArea"]["ID"]) !== NaN) {
    broader_location = `${location["AdministrativeArea"]["LocalizedName"]}, ${location["Country"]["ID"]}`;
  } else {
    broader_location = location["AdministrativeArea"]["ID"];
  }

  const formattedLocation = `${location["LocalizedName"]}, ${broader_location}`;

  return formattedLocation;
}

search_button.addEventListener("click", () => {
  if (autofill_results) {
    preRenderWeather(
      autofill_results[autofill_nav_index === -1 ? 0 : autofill_nav_index]
    );
  }
});

function changeTemperatureUnit(convertToCelcius: boolean) {
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

  if (current_temp) {
    if (convertToCelcius) {
      document.getElementById("current-temperature")!.innerHTML = `${Math.round(
        (5 / 9) * (parseInt(current_temp) - 32)
      )}°C`;
    } else {
      document.getElementById("current-temperature")!.innerHTML = `${Math.round(
        (9 / 5) * parseInt(current_temp) + 32
      )}°F`;
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

function startSkeletonAnimation() {
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

      fahrenheight_toggle.className = "toggled";
      celcius_toggle.className = "";
    },
  });
}

const mapTempsToColorRange = (
  temp: number,
  fromRange: number[],
  toRange: number[]
) => {
  return (
    ((temp - fromRange[0]) * (toRange[1] - toRange[0])) /
      (fromRange[1] - fromRange[0]) +
    toRange[0]
  );
};

// extract to separate file
function calculateBackgroundGradientByTemps(
  min_weekly_temp: number,
  max_weekly_temp: number
) {
  let coldestHSLValue, hottestHSLValue;

  if (min_weekly_temp <= -40) {
    coldestHSLValue = "hsl(240 100% 20%)";
  } else if (min_weekly_temp > -40 && min_weekly_temp <= 0) {
    coldestHSLValue = "hsl(240 100% 30%)";
  } else if (min_weekly_temp > 0 && min_weekly_temp <= 30) {
    coldestHSLValue = "hsl(240 100% 50%)";
  } else if (min_weekly_temp > 30 && min_weekly_temp <= 50) {
    coldestHSLValue = `hsl(${mapTempsToColorRange(
      min_weekly_temp,
      [30, 50],
      [240, 180]
    )} 100% 50%)`;
  } else if (min_weekly_temp > 50 && min_weekly_temp <= 70) {
    coldestHSLValue = `hsl(${mapTempsToColorRange(
      min_weekly_temp,
      [50, 70],
      [60, 55]
    )} 100% 50%)`;
  } else if (min_weekly_temp > 70 && min_weekly_temp <= 80) {
    coldestHSLValue = `hsl(${mapTempsToColorRange(
      min_weekly_temp,
      [70, 80],
      [55, 40]
    )} 100% 50%)`;
  } else if (min_weekly_temp > 80 && min_weekly_temp <= 90) {
    coldestHSLValue = `hsl(${mapTempsToColorRange(
      min_weekly_temp,
      [80, 90],
      [40, 20]
    )} 100% 50%)`;
  } else if (min_weekly_temp > 90 && min_weekly_temp <= 100) {
    coldestHSLValue = `hsl(${mapTempsToColorRange(
      min_weekly_temp,
      [90, 100],
      [20, 10]
    )} 100% 50%)`;
  } else if (min_weekly_temp > 100) {
    coldestHSLValue = `hsl(${mapTempsToColorRange(
      min_weekly_temp,
      [100, 130],
      [10, 0]
    )} 100% 50%)`;
  }

  if (max_weekly_temp <= -40) {
    hottestHSLValue = "hsl(240 100% 20%)";
  } else if (max_weekly_temp > -40 && max_weekly_temp <= 0) {
    hottestHSLValue = "hsl(240 100% 30%)";
  } else if (max_weekly_temp > 0 && max_weekly_temp <= 30) {
    hottestHSLValue = "hsl(240 100% 50%)";
  } else if (max_weekly_temp > 30 && max_weekly_temp <= 50) {
    hottestHSLValue = `hsl(${mapTempsToColorRange(
      max_weekly_temp,
      [30, 50],
      [240, 180]
    )} 100% 50%)`;
  } else if (max_weekly_temp > 50 && max_weekly_temp <= 70) {
    hottestHSLValue = `hsl(${mapTempsToColorRange(
      max_weekly_temp,
      [50, 70],
      [60, 55]
    )} 100% 50%)`;
  } else if (max_weekly_temp > 70 && max_weekly_temp <= 80) {
    hottestHSLValue = `hsl(${mapTempsToColorRange(
      max_weekly_temp,
      [70, 80],
      [55, 40]
    )} 100% 50%)`;
  } else if (max_weekly_temp > 80 && max_weekly_temp <= 90) {
    hottestHSLValue = `hsl(${mapTempsToColorRange(
      max_weekly_temp,
      [80, 90],
      [40, 20]
    )} 100% 50%)`;
  } else if (max_weekly_temp > 90 && max_weekly_temp <= 100) {
    hottestHSLValue = `hsl(${mapTempsToColorRange(
      max_weekly_temp,
      [90, 100],
      [20, 10]
    )} 100% 50%)`;
  } else if (max_weekly_temp > 100) {
    hottestHSLValue = `hsl(${mapTempsToColorRange(
      max_weekly_temp,
      [100, 130],
      [10, 0]
    )} 100% 50%)`;
  }

  document.documentElement.style.setProperty(
    "--background-coldest-gradient-color",
    `${coldestHSLValue}`
  );
  document.documentElement.style.setProperty(
    "--background-hottest-gradient-color",
    `${hottestHSLValue}`
  );
}

function getCurrentCoordinates() {
  const options = {
    enableHighAccuracy: true,
    timeout: 5000,
    maximumAge: 0,
  };

  function success(pos: GeolocationPosition) {
    current_latitude = pos.coords.latitude;
    current_longitude = pos.coords.longitude;

    getCurrentLocation(current_latitude, current_longitude);
  }

  function error(err: GeolocationPositionError) {
    console.warn(`ERROR(${err.code}): ${err.message}`);
  }

  navigator.geolocation.getCurrentPosition(success, error, options);
}

async function renderWeather(city_loc: string) {
  if (!cards_created) {
    shift_days();
    cards_created = true;
  }

  for (const day_index in days) {
    if (
      !current_forecast_days_indicies.includes(parseInt(day_index)) ||
      parseInt(day_index) === current_day_idx
    ) {
      days[day_index].style.display = "none";
    }
  }

  // expanding + showing container and child elements
  document.documentElement.style.setProperty("--container-widths", "100%");
  document.documentElement.style.setProperty("--container-heights", "100%");
  document.documentElement.style.setProperty("--container-user-select", "auto");
  document.documentElement.style.setProperty("--day-padding", "1.75rem");
  document.documentElement.style.setProperty("--day-opacity", "1");

  startSkeletonAnimation();

  let five_day_forecast = await getWeeklyWeather(city_loc);
  let current_conditions = await getCurrentConditions(city_loc);

  clearAutofillResults();
  clearSearchBar();

  let formatted_forecast = five_day_forecast["DailyForecasts"];

  // getting and storing min/max temps for the week
  min_weekly_temp = Math.min(
    ...[
      formatted_forecast[0].Temperature.Minimum.Value,
      formatted_forecast[1].Temperature.Minimum.Value,
      formatted_forecast[2].Temperature.Minimum.Value,
      formatted_forecast[3].Temperature.Minimum.Value,
      formatted_forecast[4].Temperature.Minimum.Value,
    ]
  );

  max_weekly_temp = Math.max(
    ...[
      formatted_forecast[0].Temperature.Maximum.Value,
      formatted_forecast[1].Temperature.Maximum.Value,
      formatted_forecast[2].Temperature.Maximum.Value,
      formatted_forecast[3].Temperature.Maximum.Value,
      formatted_forecast[4].Temperature.Maximum.Value,
    ]
  );

  setTimeout(() => {
    for (let i = 0; i < 5; i++) {
      const currentHours = currentHoursInTimezone(
        formatted_forecast[i]["Date"]
      );
      const morningOrEvening = currentHours < 21 ? "Day" : "Night";

      // references to dynamic html elems
      const forecast_weather_icon = document.getElementById(
        `weather-status-icon-${current_forecast_days_indicies[i]}`
      ) as HTMLElement;
      const forecast_precip_percent = document.getElementById(
        `precip-percent-${current_forecast_days_indicies[i]}`
      ) as HTMLElement;
      const forecast_min_temp = document.getElementById(
        `low-temperature-${current_forecast_days_indicies[i]}`
      ) as HTMLElement;
      const forecast_max_temp = document.getElementById(
        `high-temperature-${current_forecast_days_indicies[i]}`
      ) as HTMLElement;

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
  }, 4100);
}
