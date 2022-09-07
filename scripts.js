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

const d = new Date();
let current_day = d.getDay();
let current_forecast_days = [];
let current_forecast_days_indicies = [];

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
    } else {
      current_forecast_days.push(days[current_day + i]);
      current_forecast_days_indicies.push(days.indexOf(days[current_day + i]));
    }
  }
  return current_forecast_days;
}

// probably a good convention to try to switch/follow is just changing classes instead
// of adding these arbitrary-feeling styles all over...
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

// getting min/max daily temps + rain % + wind
async function getWeeklyWeather(city_loc) {
  let forecast_url = `http://dataservice.accuweather.com/forecasts/v1/daily/5day/${city_loc}?apikey=${apiKey}&details=true`;

  try {
    let res = await fetch(forecast_url);

    return await res.json();
  } catch (error) {
    console.log(error);
  }
}

// getting realFeel temp + humidity
async function getCurrentConditions(city_loc) {
  let forecast_url = `http://dataservice.accuweather.com/currentconditions/v1/${city_loc}?apikey=${apiKey}&details=true`;

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
    res_list.style.borderWidth = 0;
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
        res_list.style.borderWidth = 0;
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
  res_list.style.borderWidth = "2px";
}

function startSkeletonAnimation() {
  document.getElementById("current-day").className += " loading";

  for (const day of days) {
    day.className += " loading";
  }

  console.log("started animejs");
  anime({
    targets:
      "#current-day, #sunday, #monday, #tuesday, #wednesday, #thursday, #friday, #saturday",
    loop: 1,
    translateY: [10, -10],
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
    },
  });
}

// FINALLY A TIME TO USE THE "ORDER" ATTRIBUTE OF A FLEX CHILD
// TO ORDER DAYS IN LOGICAL PATTERN
// for example today is wed so wed is in middle
// and then it would be thurs - sun in left to rigth order, so you would have to assing that
// I would assume in shift_cards()? yea prob best bet

// ALSO learn how to make easy custom scroll-bar, prob just tweak/use one that already exists

function calculateBackgroundGradientByTemp() {
  // TODO:
}

async function renderWeather(city_loc) {
  if (!cards_created) {
    shift_days();
    cards_created = true;
  }

  for (const day_index in days) {
    console.log(day_index, current_day, day_index === current_day);
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
          weatherIcons[formatted_forecast[i][morningOrEvening]["Icon"]]
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
          weatherIcons[formatted_forecast[i][morningOrEvening]["Icon"]]
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
