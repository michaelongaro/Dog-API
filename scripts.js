// import dotenv from "./node_modules/dotenv/lib/dotenv";

// dotenv.config();
//process.env.WEATHER_API_KEY

const api_key = "5A30FxiSCT46fzC7G35geCxlL0Xeuqwp";

const city_name = document.getElementById("city");

const current_location_search = document.getElementById(
  "current-location-search"
);
const search = document.getElementById("search");
const search_button = document.getElementById("search-button");
const container = document.getElementById("container");
const res_list = document.getElementById("result-list");

const monday = document.getElementById("monday");
const tuesday = document.getElementById("tuesday");
const wednesday = document.getElementById("wednesday");
const thursday = document.getElementById("thursday");
const friday = document.getElementById("friday");
const saturday = document.getElementById("saturday");
const sunday = document.getElementById("sunday");

let weather_status_icon;
let high_temperature;
let low_temperature;

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

const weather_icons = {
  1: "./assets/day.svg",
  2: "./assets/day.svg",
  3: "./assets/lightDayClouds.svg",
  4: "./assets/mediumDayClouds.svg",
  5: "./assets/mediumDayClouds.svg",
  6: "./assets/heavyDayClouds.svg",
  7: "./assets/heavyDayClouds.svg",
  8: "./assets/heavyDayClouds.svg",
  11: "./assets/heavyDayClouds.svg",
  12: "./assets/lightRain.svg",
  13: "./assets/rainWithSun.svg",
  14: "./assets/rainWithSun.svg",
  15: "./assets/thunder.svg",
  16: "./assets/rainWithSun.svg",
  17: "./assets/rainWithSun.svg",
  18: "./assets/heavyRain.svg",
  19: "./assets/lightSnow.svg",
  20: "./assets/lightSnow.svg",
  21: "./assets/lightSnow.svg",
  22: "./assets/heavySnow.svg",
  23: "./assets/snowWithSun.svg",
  24: "./assets/mediumSnow.svg",
  25: "./assets/mediumSnow.svg",
  26: "./assets/mediumSnow.svg",
  27: "./assets/mediumSnow.svg",
  28: "./assets/mediumSnow.svg",
  29: "./assets/mediumSnow.svg",
  30: "./assets/day.svg",
  31: "./assets/day.svg",
  32: "./assets/lightDayClouds.svg",
  33: "./assets/night.svg",
  34: "./assets/lightNightClouds.svg",
  35: "./assets/lightNightClouds.svg",
  36: "./assets/lightNightClouds.svg",
  37: "./assets/mediumNightClouds.svg",
  38: "./assets/heavyNightClouds.svg",
  39: "./assets/mediumNightClouds.svg",
  40: "./assets/mediumNightClouds.svg",
  41: "./assets/mediumNightClouds.svg",
  42: "./assets/mediumNightClouds.svg",
  43: "./assets/mediumNightClouds.svg",
  44: "./assets/mediumNightClouds.svg",
};

let min_weekly_temp, max_weekly_temp;

let autofill_nav_index = -1;
let autofill_results = [];

let cards_created = false;

const d = new Date();
let current_day = d.getDay();
let current_forecast_days = [];
let current_forecast_days_indicies = [];

let current_longitude = null;
let current_latitude = null;

window.addEventListener(
  "keyup",
  debounce((event) => {
    if (
      (event.which >= 65 && event.which <= 90) ||
      event.code === "Backspace"
    ) {
      clearAutofillResults();
      if (search.value === "") {
        res_list.style.height = 0;
        res_list.style.borderWidth = 0;
      } else {
        renderAutofillResults();
      }
    }
  }, 250),
  true
);

current_location_search.addEventListener("click", () => {
  getCurrentCoordinates();
});

function clearAutofillResults() {
  while (res_list.firstChild) {
    res_list.removeChild(res_list.lastChild);
  }
}

function clearSearchBar() {
  search.value = "";
}

function shift_days() {
  for (let i = 0; i < 5; i++) {
    if (current_day + i > 6) {
      // for this and below probably cleaner to be storing these into an obj
      // where key is  days.indexOf(days[current_day + i - 7])
      // and value is days[current_day + i - 7]
      current_forecast_days.push(days[current_day + i - 7]);
      current_forecast_days_indicies.push(
        days.indexOf(days[current_day + i - 7])
      );
      days[current_day + i - 7].style.order = current_day + i;
    } else {
      current_forecast_days.push(days[current_day + i]);
      current_forecast_days_indicies.push(days.indexOf(days[current_day + i]));
      days[current_day + i].style.order = current_day + i;
    }
  }
  return current_forecast_days;
}

// probably a good convention to try to switch/follow is just changing classes instead
// of adding these arbitrary-feeling styles all over...
function showCityName(city) {
  city_name.innerHTML = "";

  city_name.innerHTML = city;
  city_name.style.display = "block";
  city_name.style.fontSize = "20pt";
}

async function getAutofillResults(str) {
  let autofill_url = `http://dataservice.accuweather.com/locations/v1/cities/autocomplete?apikey=${api_key}&q=${str}`;

  try {
    let res = await fetch(autofill_url);

    return await res.json();
  } catch (error) {
    console.log(error);
  }
}

// getting min/max daily temps + rain % + wind
async function getWeeklyWeather(city_loc) {
  let forecast_url = `http://dataservice.accuweather.com/forecasts/v1/daily/5day/${city_loc}?apikey=${api_key}&details=true`;

  try {
    let res = await fetch(forecast_url);

    return await res.json();
  } catch (error) {
    console.log(error);
  }
}

// getting realFeel temp + humidity
async function getCurrentConditions(city_loc) {
  let forecast_url = `http://dataservice.accuweather.com/currentconditions/v1/${city_loc}?apikey=${api_key}&details=true`;

  try {
    let res = await fetch(forecast_url);

    return await res.json();
  } catch (error) {
    console.log(error);
  }
}

function debounce(cb, delay = 1000) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      cb(...args);
    }, delay);
  };
}

async function getCurrentLocation(latitude, longitude) {
  console.log(
    `http://dataservice.accuweather.com/locations/v1/cities/geoposition/search?apikey=${api_key}&q=${latitude}%2C%20${longitude}`
  );
  let location_finder_url = `http://dataservice.accuweather.com/locations/v1/cities/geoposition/search?apikey=${api_key}&q=${latitude}%2C%20${longitude}`;

  try {
    let res = await fetch(location_finder_url);

    let res_value = await res.clone().json();

    showCityName(
      `${res_value["LocalizedName"]}, ${res_value["AdministrativeArea"]["ID"]}`
    );

    // return await res.json();

    //maybe just do res_value.Key below?
    // renderWeather(res.json().Key);
    renderWeather(res_value.Key);
  } catch (error) {
    console.log(error);
  }
}

function currentHoursInTimezone(timeZoneStr) {
  return new Date(timeZoneStr).getHours();
}

search.addEventListener("focus", () => {
  if (search.value !== "" && res_list.style.height === "0px") {
    renderAutofillResults();
  }
});

window.addEventListener("click", (e) => {
  if (!res_list.contains(e.target) && !search.contains(e.target)) {
    resetAutofillNavigation();
  }
});

async function renderAutofillResults() {
  // let results = await getAutofillResults(search.value);
  autofill_results = await getAutofillResults(search.value);

  if (autofill_results === undefined) {
    let autofillResult = document.createElement("div");
    autofillResult.innerHTML = "No results found";
    res_list.append(autofillResult);
  }
  res_list.style.height = "200px";
  res_list.style.borderWidth = "2px";
  autofill_nav_index = -1;

  for (const result of autofill_results) {
    let autofillResult = document.createElement("div");
    autofillResult.setAttribute("tabIndex", "-1");
    autofillResult.innerHTML = `${result["LocalizedName"]}, ${result["AdministrativeArea"]["ID"]}`;
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

function handleKeyboardAutofillNavigation(e) {
  console.log(autofill_results);

  let num_autofill_results = document.querySelectorAll("#result-list > div");

  if (e.key === "ArrowDown") {
    e.preventDefault();

    if (autofill_nav_index < num_autofill_results.length - 1) {
      autofill_nav_index++;
      for (const result of num_autofill_results) {
        result.className = "";
      }
      num_autofill_results[autofill_nav_index].className =
        "keyboard-navigated-autofill";
      num_autofill_results[autofill_nav_index].focus();
    }
  } else if (e.key === "ArrowUp") {
    e.preventDefault();

    if (
      autofill_nav_index > 0 &&
      autofill_nav_index < num_autofill_results.length
    ) {
      autofill_nav_index--;
      for (const result of num_autofill_results) {
        result.className = "";
      }
      num_autofill_results[autofill_nav_index].className =
        "keyboard-navigated-autofill";
      num_autofill_results[autofill_nav_index].focus();
    }
  }

  if (e.key === "Enter") {
    e.preventDefault();

    preRenderWeather(
      autofill_results[autofill_nav_index === -1 ? 0 : autofill_nav_index]
    );
  }

  if (e.key === "Escape") {
    e.preventDefault();

    resetAutofillNavigation();
  }
}

function resetAutofillNavigation() {
  let num_autofill_results = document.querySelectorAll("#result-list > div");
  res_list.style.height = 0;
  res_list.style.borderWidth = 0;
  autofill_nav_index = -1;
  for (const result of num_autofill_results) {
    result.className = "";
    result.blur();
  }

  window.removeEventListener("keydown", handleKeyboardAutofillNavigation);
}

// okay so ideal format is "LocalizedName",
// parseInt(["AdministrativeArea"]["ID"]) === NaN ? ["AdministrativeArea"]["LocalizedName"],
// ["Country"]["ID"]

function preRenderWeather(result) {
  console.log(result);
  res_list.style.height = 0;
  res_list.style.borderWidth = 0;
  showCityName(
    `${result["LocalizedName"]}, ${result["AdministrativeArea"]["ID"]}`
  );
  renderWeather(result["Key"]);
}

search_button.addEventListener("click", () => {
  preRenderWeather(
    autofill_results[autofill_nav_index === -1 ? 0 : autofill_nav_index]
  );
});

function startSkeletonAnimation() {
  document.documentElement.style.setProperty("--container-opacities", 0);

  document.getElementById("current-day").className += " loading";

  for (const day of days) {
    day.className += " loading";
  }

  console.log("started animejs");
  anime({
    targets:
      "#current-day, #sunday, #monday, #tuesday, #wednesday, #thursday, #friday, #saturday",
    loop: 1,
    translateY: [15, -5],
    scale: [1.1, 0.9, 1],
    rotateY: "360deg",
    direction: "alternate",
    duration: 2000,
    easing: "easeInSine",
    complete: () => {
      document.getElementById("current-day").className = "day base-flex";
      for (const day of days) {
        day.className = "day";
      }

      document.documentElement.style.setProperty("--container-opacities", 1);
      calculateBackgroundGradientByTemps(min_weekly_temp, max_weekly_temp);
    },
  });
}

const mapTempsToColorRange = (number, fromRange, toRange) => {
  return (
    ((number - fromRange[0]) * (toRange[1] - toRange[0])) /
      (fromRange[1] - fromRange[0]) +
    toRange[0]
  );
};

function calculateBackgroundGradientByTemps(min_weekly_temp, max_weekly_temp) {
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
    coldestHSLValue
  );
  document.documentElement.style.setProperty(
    "--background-hottest-gradient-color",
    hottestHSLValue
  );
}

function getCurrentCoordinates() {
  const options = {
    enableHighAccuracy: true,
    timeout: 5000,
    maximumAge: 0,
  };

  function success(pos) {
    current_latitude = pos.coords.latitude;
    current_longitude = pos.coords.longitude;

    getCurrentLocation(current_latitude, current_longitude);
  }

  function error(err) {
    console.warn(`ERROR(${err.code}): ${err.message}`);
  }

  navigator.geolocation.getCurrentPosition(success, error, options);
}

async function renderWeather(city_loc) {
  if (!cards_created) {
    shift_days();
    cards_created = true;
  }

  for (const day_index in days) {
    if (
      !current_forecast_days_indicies.includes(parseInt(day_index)) ||
      parseInt(day_index) === current_day
    ) {
      days[day_index].style.display = "none";
    }
  }

  // expanding + showing container and child elements
  document.documentElement.style.setProperty("--container-widths", "100%");
  document.documentElement.style.setProperty("--container-heights", "100%");
  document.documentElement.style.setProperty("--container-user-select", "auto");
  document.documentElement.style.setProperty("--day-padding", "1.5rem");
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

      if (i === 0) {
        document.getElementById("current-day-of-week").innerHTML =
          days_str[current_day];

        document.getElementById(
          "weather-status-icon-7"
        ).innerHTML = `<img src=${
          weather_icons[formatted_forecast[i][morningOrEvening]["Icon"]]
        }>`;

        document.getElementById(
          "precip-percent-7"
        ).innerHTML = `${formatted_forecast[i][morningOrEvening]["RainProbability"]}%`;

        document.getElementById(
          "current-temperature"
        ).innerHTML = `${current_conditions[0].Temperature.Imperial.Value}°F`;

        document.getElementById(
          "low-temperature-7"
        ).innerHTML = `${formatted_forecast[i].Temperature.Minimum.Value}°F`;

        document.getElementById(
          "high-temperature-7"
        ).innerHTML = `${formatted_forecast[i].Temperature.Maximum.Value}°F`;

        document.getElementById(
          "current-humidity"
        ).innerHTML = `${current_conditions[0].RelativeHumidity}%`;

        document.getElementById(
          "wind-7"
        ).innerHTML = `${formatted_forecast[i][morningOrEvening]["Wind"]["Speed"]["Value"]}mph`;
      } else {
        document.getElementById(
          `weather-status-icon-${current_forecast_days_indicies[i]}`
        ).innerHTML = `<img src=${
          weather_icons[formatted_forecast[i][morningOrEvening]["Icon"]]
        }>`;

        document.getElementById(
          `precip-percent-${current_forecast_days_indicies[i]}`
        ).innerHTML = `${formatted_forecast[i][morningOrEvening]["RainProbability"]}%`;

        document.getElementById(
          `low-temperature-${current_forecast_days_indicies[i]}`
        ).innerHTML = `${formatted_forecast[i].Temperature.Minimum.Value}F`;

        document.getElementById(
          `high-temperature-${current_forecast_days_indicies[i]}`
        ).innerHTML = `${formatted_forecast[i].Temperature.Maximum.Value}F`;
      }
    }
  }, 4100);
}
