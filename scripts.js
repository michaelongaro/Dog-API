// import dotenv from "./node_modules/dotenv/lib/dotenv";

// dotenv.config();
//process.env.WEATHER_API_KEY

const apiKey = "5A30FxiSCT46fzC7G35geCxlL0Xeuqwp";

const cityName = document.getElementById("city");

const search = document.getElementById("search");
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

const weatherIcons = {
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

let cards_created = false;

function setupCardStructure() {
  for (const i in days) {
    // create parent and two child divs for day of week and weather icon
    const day_icon_container = document.createElement("div");
    day_icon_container.setAttribute("id", "day-icon-container");

    const day_of_week = document.createElement("div");
    day_of_week.setAttribute("id", "day-of-week");

    weather_status_icon = document.createElement("div");
    weather_status_icon.setAttribute("id", "weather-status-icon");
    // weather_status_icon.setAttribute("class", "loading");

    // appending children divs to parent
    day_icon_container.append(day_of_week);
    day_icon_container.append(weather_status_icon);

    // create both high and low temp divs
    const high_container = document.createElement("div");
    high_container.setAttribute("id", "high-container");

    const low_container = document.createElement("div");
    low_container.setAttribute("id", "low-container");

    // create divs for the high/low labels
    const high_label = document.createElement("div");
    high_label.setAttribute("id", "high-label");

    const low_label = document.createElement("div");
    low_label.setAttribute("id", "low-label");

    // create divs for the actual temperatures
    high_temperature = document.createElement("div");
    high_temperature.setAttribute("id", "high-temperature");
    // high_temperature.setAttribute("class", "loading");

    low_temperature = document.createElement("div");
    low_temperature.setAttribute("id", "low-temperature");
    // low_temperature.setAttribute("class", "loading");

    // appending both labels and temps to their parent divs
    high_container.append(high_label);
    high_container.append(high_temperature);

    low_container.append(low_label);
    low_container.append(low_temperature);

    // add day of week + 'high' and 'low' text
    day_of_week.innerHTML = days_str[i];
    high_label.innerHTML = "High";
    low_label.innerHTML = "Low";

    days[i].append(day_icon_container);
    days[i].append(high_container);
    days[i].append(low_container);
  }

  cards_created = true;
}

const d = new Date();
let current_day = d.getDay();

let current_forecast_days = [];

let current_search_str = "";
// let autofill_str = "";

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
      } else {
        renderAutofillResults();
      }
    }
  }, 250),
  true
);

function clearAutofillResults() {
  while (res_list.firstChild) {
    res_list.removeChild(res_list.lastChild);
  }
}

function clearSearchBar() {
  search.value = "";
}

function shift_days() {
  let counter = 0;
  while (counter < 5) {
    if (current_day + counter > 6) {
      current_forecast_days.push(days[(current_day + counter) % 7]);
    } else {
      current_forecast_days.push(days[current_day + counter]);
    }
    counter += 1;
  }
  return current_forecast_days;
}

function showCityName(city) {
  cityName.innerHTML = "";

  cityName.innerHTML = city;
  cityName.style.display = "block";
  cityName.style.fontSize = "20pt";
}

async function getAutofillResults(str) {
  let autofill_url = `http://dataservice.accuweather.com/locations/v1/cities/autocomplete?apikey=${apiKey}&q=${str}`;

  try {
    let res = await fetch(autofill_url);

    return await res.json();
  } catch (error) {
    console.log(error);
  }
}

async function getWeather(city_loc) {
  let forecast_url = `http://dataservice.accuweather.com/forecasts/v1/daily/5day/${city_loc}?apikey=${apiKey}`;

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
    res_list.style.height = 0;
  }
});

async function renderAutofillResults() {
  let results = await getAutofillResults(search.value);
  for (const result of results) {
    let autofillResult = document.createElement("div");
    autofillResult.innerHTML = `${result["LocalizedName"]}, ${result["AdministrativeArea"]["ID"]}`;
    res_list.append(autofillResult);

    autofillResult.addEventListener(
      "click",
      () => {
        res_list.style.height = 0;
        showCityName(
          `${result["LocalizedName"]}, ${result["AdministrativeArea"]["ID"]}`
        );
        renderWeather(result["Key"]);
      },
      true
    );

    autofillResult.addEventListener(
      "keyup",
      (e) => {
        if (e.code === "Enter") {
          e.preventDefault();
          autofillResult.click();
        }
      },
      true
    );
  }

  res_list.style.height = "350px";
}

async function renderWeather(city_loc) {
  let raw_days = await getWeather(city_loc);
  console.log(raw_days);
  if (!cards_created) {
    setupCardStructure();
    shift_days();
  }
  clearAutofillResults();
  clearSearchBar();
  let days_arr = raw_days["DailyForecasts"];
  container.style.display = "flex";

  for (let k = 0; k < 5; k++) {
    current_forecast_days[k].style.display = "flex";
  }

  // setTimeout(() => {
  //   for (let i = 0; i < 5; i++) {
  //     current_forecast_days[i].children[0].children[1].classList.remove(
  //       "loading"
  //     );
  //     current_forecast_days[i].children[1].children[1].classList.remove(
  //       "loading"
  //     );
  //     current_forecast_days[i].children[2].children[1].classList.remove(
  //       "loading"
  //     );
  //   }
  // }, 3000);

  setTimeout(() => {
    for (let i = 0; i < 5; i++) {
      const currentHours = currentHoursInTimezone(days_arr[i]["Date"]);
      const morningOrEvening = currentHours < 21 ? "Day" : "Night";

      current_forecast_days[i].children[0].children[1].innerHTML = `<img src=${
        weatherIcons[days_arr[i][morningOrEvening]["Icon"]]
      }>`;
      current_forecast_days[i].children[1].children[1].innerHTML =
        days_arr[i]["Temperature"]["Maximum"]["Value"];
      current_forecast_days[i].children[2].children[1].innerHTML =
        days_arr[i]["Temperature"]["Minimum"]["Value"];
    }
  }, 1500);
}

// structure should be
//                      day
//
//       Min                           Max
//
//        15                            35
//
//
//        Precip.                      Wind
//          5%                          13mph
//
// could substitute precip. for rain droplet and wind for wind icon
