import debounce from "./util/debounce";

import getAutofillResults from "./util/getAutofillResults";
import getWeeklyWeather from "./util/getWeeklyWeather";
import getCurrentConditions from "./util/getCurrentConditions";
import getCurrentLocation from "./util/getCurrentLocation";
import changeTemperatureUnit from "./util/changeTemperatureUnit";
import startSkeletonAnimation from "./util/startSkeletonAnimation";
import updateGlobalCSSProperties from "./util/updateGlobalCSSProperties";
import renderWeatherValues from "./util/renderWeatherValues";

const container = document.getElementById("container") as HTMLDivElement;
const city_name = document.getElementById("city") as HTMLDivElement;

const current_location_search = document.getElementById(
  "current-location-search"
) as HTMLButtonElement;
const search_button = document.getElementById(
  "search-button"
) as HTMLButtonElement;

const search = document.getElementById("search") as HTMLInputElement;
const res_list = document.getElementById("result-list") as HTMLDivElement;

// const current_day = document.getElementById("current-day") as HTMLDivElement;
const monday = document.getElementById("monday") as HTMLDivElement;
const tuesday = document.getElementById("tuesday") as HTMLDivElement;
const wednesday = document.getElementById("wednesday") as HTMLDivElement;
const thursday = document.getElementById("thursday") as HTMLDivElement;
const friday = document.getElementById("friday") as HTMLDivElement;
const saturday = document.getElementById("saturday") as HTMLDivElement;
const sunday = document.getElementById("sunday") as HTMLDivElement;

// const temp_units_container = document.getElementById(
//   "temp-units-container"
// ) as HTMLDivElement;
const fahrenheight_toggle = document.getElementById(
  "fahrenheight-button"
) as HTMLButtonElement;
const celcius_toggle = document.getElementById(
  "celcius-button"
) as HTMLButtonElement;

const days = [sunday, monday, tuesday, wednesday, thursday, friday, saturday];

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
  changeTemperatureUnit(false, fahrenheight_toggle, celcius_toggle);
});

celcius_toggle.addEventListener("click", () => {
  changeTemperatureUnit(true, fahrenheight_toggle, celcius_toggle);
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
      current_forecast_days_indicies.push(
        days.indexOf(days[current_day_idx + i - 7])
      );
      days[current_day_idx + i - 7].style.order = `${current_day_idx + i}`;
    } else {
      current_forecast_days_indicies.push(
        days.indexOf(days[current_day_idx + i])
      );
      days[current_day_idx + i].style.order = `${current_day_idx + i}`;
    }
  }
}

function showCityName(city: string) {
  city_name.innerHTML = "";
  city_name.innerHTML = city;

  city_name.style.display = "block";
  city_name.style.fontSize = "20pt";
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

  if (!autofill_results) {
    return;
  }

  res_list.style.borderWidth = "2px";
  autofill_nav_index = -1;

  if (autofill_results.length === 0) {
    let autofillResult = document.createElement("div");
    autofillResult.innerHTML = "No results found";
    autofillResult.style.pointerEvents = "none";
    res_list.append(autofillResult);
    res_list.style.height = "35px";
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

  res_list.style.height = "200px";

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
      (num_autofill_results[autofill_nav_index] as HTMLDivElement)?.focus();
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
        (num_autofill_results[autofill_nav_index] as HTMLDivElement)?.focus();
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
    (result as HTMLDivElement)?.blur();
  }

  window.removeEventListener("keydown", handleKeyboardAutofillNavigation);
}

function preRenderWeather(result: IAutofillResult) {
  res_list.style.height = "0";
  res_list.style.borderWidth = "0";

  autofill_results = [];
  container.style.display = "flex";

  showCityName(formatLocation(result));
  renderWeather(result["Key"]);
}

function formatLocation(location: IAutofillResult) {
  let broader_location: string;

  broader_location = `${location["AdministrativeArea"]["LocalizedName"]}, ${location["Country"]["ID"]}`;

  const formattedLocation = `${location["LocalizedName"]}, ${broader_location}`;

  return formattedLocation;
}

search_button.addEventListener("click", () => {
  if (autofill_results && autofill_results.length > 0) {
    preRenderWeather(
      autofill_results[autofill_nav_index === -1 ? 0 : autofill_nav_index]
    );
  } else {
    city_name.style.display = "none";
    container.style.display = "none";
  }
});

function getCurrentCoordinates() {
  const options = {
    enableHighAccuracy: true,
    timeout: 5000,
    maximumAge: 0,
  };

  function success(pos: GeolocationPosition) {
    current_latitude = pos.coords.latitude;
    current_longitude = pos.coords.longitude;

    getCurrentLocation(
      current_latitude,
      current_longitude,
      container,
      showCityName,
      renderWeather
    );
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

  updateGlobalCSSProperties();

  container.style.pointerEvents = "auto";

  let five_day_forecast = await getWeeklyWeather(city_loc);
  let current_conditions = await getCurrentConditions(city_loc);
  let formatted_forecast = five_day_forecast["DailyForecasts"];

  clearAutofillResults();
  clearSearchBar();

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

  startSkeletonAnimation(
    days,
    min_weekly_temp,
    max_weekly_temp,
    fahrenheight_toggle,
    celcius_toggle
  );

  setTimeout(() => {
    renderWeatherValues(
      current_conditions,
      formatted_forecast,
      current_forecast_days_indicies,
      current_day_idx
    );
  }, 3400);
}
